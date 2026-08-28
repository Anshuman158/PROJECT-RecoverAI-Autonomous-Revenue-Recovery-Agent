import express from 'express';
import { razorpayService } from '../services/razorpayService.js';
import { aiAgentService } from '../services/aiAgentService.js';
import { paymentEventRepository } from '../repositories/paymentEventRepository.js';
import { recoveryCaseRepository } from '../repositories/recoveryCaseRepository.js';
import { recoveryActionRepository } from '../repositories/recoveryActionRepository.js';
import { auditEventRepository } from '../repositories/auditEventRepository.js';
import { customerRepository } from '../repositories/customerRepository.js';
import { PaymentEvent } from '../models/PaymentEvent.js';
import { RecoveryCase, RecoveryCaseStatus, RecoveryProblemType } from '../models/RecoveryCase.js';
import { RecoveryAction, RecoveryActionStatus } from '../models/RecoveryAction.js';
import { AuditEvent, AuditActor, AuditEventType } from '../models/AuditEvent.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/webhooks/razorpay
 * Real-time Razorpay Webhook Ingestion with cryptographic signature verification
 */
router.post('/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

  // 1. Verify HMAC-SHA256 Signature
  const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
  if (!isValid && process.env.NODE_ENV === 'production') {
    logger.warn('INVALID_WEBHOOK_SIGNATURE', { signature });
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  const payload = req.body || {};
  const event = payload.event;
  const eventData = payload.payload?.payment?.entity || payload.payload?.subscription?.entity || payload.payload?.invoice?.entity || {};

  logger.info('RAZORPAY_WEBHOOK_RECEIVED', { event, id: eventData.id });

  try {
    // 2. Process Failure Events
    if (event === 'payment.failed' || event === 'subscription.halted' || event === 'invoice.payment_failed') {
      const razorpayPaymentId = eventData.id || `pay_${Date.now()}`;
      const customerId = eventData.customer_id || eventData.notes?.customer_id || 'cust_default';
      const amountPaise = parseInt(eventData.amount || 49900, 10);
      const errorCode = eventData.error_code || eventData.error_description || 'PAYMENT_FAILED';

      // Idempotency check
      const existingCase = recoveryCaseRepository.findByEventId(razorpayPaymentId);
      if (existingCase) {
        logger.info('DUPLICATE_WEBHOOK_IGNORED', { eventId: razorpayPaymentId });
        auditEventRepository.save(new AuditEvent({
          recoveryCaseId: existingCase.id,
          eventType: AuditEventType.DUPLICATE_IGNORED,
          actor: AuditActor.RAZORPAY_WEBHOOK,
          explanation: `Duplicate webhook notification for payment ${razorpayPaymentId} ignored.`
        }));
        return res.status(200).json({ status: 'ok', message: 'Duplicate event ignored' });
      }

      // Save raw payment event
      const paymentEvent = paymentEventRepository.save(new PaymentEvent({
        razorpayPaymentId,
        customerId,
        amount: amountPaise,
        status: 'failed',
        errorCode,
        errorDescription: eventData.error_description || errorCode,
        source: 'RAZORPAY_WEBHOOK'
      }));

      // Create Recovery Case
      const problemType = event.includes('subscription') ? RecoveryProblemType.FAILED_SUBSCRIPTION : RecoveryProblemType.FAILED_PAYMENT;
      const newCase = recoveryCaseRepository.save(new RecoveryCase({
        eventId: paymentEvent.id,
        customerId,
        problemType,
        amountAtRisk: amountPaise,
        reason: errorCode,
        status: RecoveryCaseStatus.DETECTED
      }));

      auditEventRepository.save(new AuditEvent({
        recoveryCaseId: newCase.id,
        eventType: AuditEventType.CASE_CREATED,
        actor: AuditActor.SYSTEM,
        explanation: `Recovery case created for failed payment of ₹${(amountPaise / 100).toLocaleString()}`
      }));

      // Retrieve customer context if available
      const customer = customerRepository.findById(customerId) || {
        id: customerId,
        name: eventData.notes?.name || eventData.email || 'Customer',
        email: eventData.email || 'customer@example.com',
        phone: eventData.contact || '+919876543210'
      };

      // Run AI Diagnosis & Policy Guardrail Check
      const diagnosis = await aiAgentService.diagnoseAndRecommend(newCase, customer);

      newCase.diagnosis = diagnosis.diagnosis;
      newCase.confidence = diagnosis.confidence;
      newCase.recommendedAction = diagnosis.actionType;
      newCase.policyDecision = diagnosis.policyDecision;
      newCase.policyReason = diagnosis.policyReason;

      auditEventRepository.save(new AuditEvent({
        recoveryCaseId: newCase.id,
        eventType: AuditEventType.DIAGNOSIS_GENERATED,
        actor: AuditActor.RECOVERY_AGENT,
        explanation: `AI categorized failure as ${diagnosis.failureCategory} with ${(diagnosis.confidence * 100).toFixed(0)}% confidence.`
      }));

      // Autonomous Execution if policy approved
      if (diagnosis.policyDecision === 'APPROVED') {
        newCase.status = RecoveryCaseStatus.EXECUTING;

        // Generate dynamic Razorpay checkout link
        const paymentLink = await razorpayService.createRecoveryPaymentLink({
          amountPaise,
          customer,
          description: `Recovery for ${newCase.id}`,
          referenceId: newCase.id
        });

        const customizedCopy = diagnosis.copy.replace('{{PAYMENT_LINK}}', paymentLink.shortUrl);

        const action = recoveryActionRepository.save(new RecoveryAction({
          recoveryCaseId: newCase.id,
          actionType: diagnosis.actionType,
          amount: amountPaise,
          status: RecoveryActionStatus.EXECUTED,
          policyDecision: diagnosis.policyDecision,
          policyReason: diagnosis.policyReason,
          attemptedAt: new Date().toISOString(),
          resultMetadata: {
            channel: diagnosis.channel,
            paymentLink: paymentLink.shortUrl,
            messageCopy: customizedCopy
          }
        }));

        newCase.retryCount += 1;
        recoveryCaseRepository.save(newCase);

        auditEventRepository.save(new AuditEvent({
          recoveryCaseId: newCase.id,
          eventType: AuditEventType.ACTION_EXECUTED,
          actor: AuditActor.ACTION_EXECUTOR,
          explanation: `Autonomous action dispatched via ${diagnosis.channel} with dynamic Razorpay link: ${paymentLink.shortUrl}`,
          metadata: { actionId: action.id, link: paymentLink.shortUrl }
        }));
      } else {
        newCase.status = RecoveryCaseStatus.BLOCKED;
        recoveryCaseRepository.save(newCase);

        auditEventRepository.save(new AuditEvent({
          recoveryCaseId: newCase.id,
          eventType: AuditEventType.ACTION_BLOCKED,
          actor: AuditActor.POLICY_ENGINE,
          explanation: `Action blocked by policy guardrails: ${diagnosis.policyReason}`
        }));
      }

      return res.status(200).json({ status: 'ok', caseId: newCase.id, diagnosis: newCase.diagnosis });
    }

    // 3. Process Success / Recovery Captured Events
    if (event === 'payment.captured' || event === 'payment.authorized' || event === 'invoice.paid') {
      const razorpayPaymentId = eventData.id;
      const amountPaise = parseInt(eventData.amount || 0, 10);
      const referenceId = eventData.notes?.reference_id || eventData.description;

      let matchedCase = null;
      if (referenceId) {
        matchedCase = recoveryCaseRepository.findById(referenceId);
      }

      if (matchedCase && matchedCase.status !== RecoveryCaseStatus.RECOVERED) {
        matchedCase.status = RecoveryCaseStatus.RECOVERED;
        matchedCase.recoveredAmount = amountPaise || matchedCase.amountAtRisk;
        matchedCase.updatedAt = new Date().toISOString();
        recoveryCaseRepository.save(matchedCase);

        auditEventRepository.save(new AuditEvent({
          recoveryCaseId: matchedCase.id,
          eventType: AuditEventType.RECOVERY_COMPLETED,
          actor: AuditActor.RAZORPAY_WEBHOOK,
          explanation: `Payment successfully captured (₹${(matchedCase.recoveredAmount / 100).toLocaleString()}). Revenue recovered!`,
          metadata: { paymentId: razorpayPaymentId }
        }));
      }

      return res.status(200).json({ status: 'ok', message: 'Payment capture acknowledged' });
    }

    // Default 200 acknowledge for unhandled webhook events
    return res.status(200).json({ status: 'ok', received: true, event });
  } catch (err) {
    logger.error('WEBHOOK_PROCESSING_ERROR', { error: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Internal processing error', message: err.message });
  }
});

export default router;
