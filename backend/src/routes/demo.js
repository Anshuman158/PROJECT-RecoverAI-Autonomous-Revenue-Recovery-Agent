import express from 'express';
import { recoveryCaseRepository } from '../repositories/recoveryCaseRepository.js';
import { paymentEventRepository } from '../repositories/paymentEventRepository.js';
import { auditEventRepository } from '../repositories/auditEventRepository.js';
import { customerRepository } from '../repositories/customerRepository.js';
import { aiAgentService } from '../services/aiAgentService.js';
import { razorpayService } from '../services/razorpayService.js';
import { RecoveryCase, RecoveryCaseStatus, RecoveryProblemType } from '../models/RecoveryCase.js';
import { PaymentEvent } from '../models/PaymentEvent.js';
import { RecoveryAction, RecoveryActionStatus } from '../models/RecoveryAction.js';
import { recoveryActionRepository } from '../repositories/recoveryActionRepository.js';
import { AuditEvent, AuditActor, AuditEventType } from '../models/AuditEvent.js';

const router = express.Router();

const DEMO_SCENARIOS = {
  BANK_DOWNTIME: {
    title: 'Bank Server Downtime (Transient Timeout)',
    amountPaise: 199900,
    errorCode: 'BAD_REQUEST_PAYMENT_TIMED_OUT',
    errorDesc: 'Gateway communication timed out with customer issuing bank (HDFC)',
    customer: { id: 'cust_demo_1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+919876543210' }
  },
  INSUFFICIENT_FUNDS: {
    title: 'Recurring Autopay Balance Low',
    amountPaise: 49900,
    errorCode: 'INSUFFICIENT_FUNDS',
    errorDesc: 'Account balance insufficient for subscription renewal mandate',
    customer: { id: 'cust_demo_2', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+919812345678' }
  },
  MANDATE_2FA_EXPIRED: {
    title: 'RBI e-Mandate Re-Authentication Required',
    amountPaise: 999900,
    errorCode: 'PAYMENT_AUTHENTICATION_EXPIRED',
    errorDesc: 'RBI 2FA e-Mandate expired. Bank requires manual OTP customer authentication',
    customer: { id: 'cust_demo_3', name: 'Rohan Mehra', email: 'rohan.mehra@example.com', phone: '+919988776655' }
  },
  VIP_HIGH_VALUE_ESCALATE: {
    title: 'VIP Enterprise High-Value (Exceeds ₹10k Cap)',
    amountPaise: 2500000, // ₹25,000 INR
    errorCode: 'INSUFFICIENT_FUNDS',
    errorDesc: 'Enterprise billing cycle payment failure',
    customer: { id: 'cust_demo_4', name: 'TechCorp Enterprise', email: 'finance@techcorp.in', phone: '+919000011222' }
  }
};

router.post('/demo/trigger', async (req, res) => {
  const { scenario = 'BANK_DOWNTIME' } = req.body;
  const config = DEMO_SCENARIOS[scenario] || DEMO_SCENARIOS.BANK_DOWNTIME;

  // Save customer
  customerRepository.save(config.customer);

  // 1. Create simulated PaymentEvent
  const paymentEvent = paymentEventRepository.save(new PaymentEvent({
    razorpayPaymentId: `pay_demo_${Date.now()}`,
    customerId: config.customer.id,
    amount: config.amountPaise,
    status: 'failed',
    errorCode: config.errorCode,
    errorDescription: config.errorDesc,
    source: 'RAZORPAY_WEBHOOK'
  }));

  // 2. Create RecoveryCase
  const newCase = recoveryCaseRepository.save(new RecoveryCase({
    eventId: paymentEvent.id,
    customerId: config.customer.id,
    problemType: RecoveryProblemType.FAILED_PAYMENT,
    amountAtRisk: config.amountPaise,
    reason: config.errorCode,
    status: RecoveryCaseStatus.DETECTED
  }));

  auditEventRepository.save(new AuditEvent({
    recoveryCaseId: newCase.id,
    eventType: AuditEventType.EVENT_RECEIVED,
    actor: AuditActor.RAZORPAY_WEBHOOK,
    explanation: `Simulated webhook received: ${config.title} (₹${(config.amountPaise / 100).toLocaleString()})`
  }));

  // 3. Run AI Diagnosis
  const diagnosis = await aiAgentService.diagnoseAndRecommend(newCase, config.customer);

  newCase.diagnosis = diagnosis.diagnosis;
  newCase.confidence = diagnosis.confidence;
  newCase.recommendedAction = diagnosis.actionType;
  newCase.policyDecision = diagnosis.policyDecision;
  newCase.policyReason = diagnosis.policyReason;

  let paymentLink = null;
  let action = null;

  if (diagnosis.policyDecision === 'APPROVED') {
    newCase.status = RecoveryCaseStatus.EXECUTING;

    paymentLink = await razorpayService.createRecoveryPaymentLink({
      amountPaise: config.amountPaise,
      customer: config.customer,
      description: `Recovery for ${newCase.id}`,
      referenceId: newCase.id
    });

    const customizedCopy = diagnosis.copy.replace('{{PAYMENT_LINK}}', paymentLink.shortUrl);

    action = recoveryActionRepository.save(new RecoveryAction({
      recoveryCaseId: newCase.id,
      actionType: diagnosis.actionType,
      amount: config.amountPaise,
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

    auditEventRepository.save(new AuditEvent({
      recoveryCaseId: newCase.id,
      eventType: AuditEventType.ACTION_EXECUTED,
      actor: AuditActor.ACTION_EXECUTOR,
      explanation: `Dispatched ${diagnosis.channel} recovery message with dynamic Razorpay link: ${paymentLink.shortUrl}`,
      metadata: { actionId: action.id, link: paymentLink.shortUrl }
    }));
  } else {
    newCase.status = RecoveryCaseStatus.BLOCKED;

    auditEventRepository.save(new AuditEvent({
      recoveryCaseId: newCase.id,
      eventType: AuditEventType.ACTION_BLOCKED,
      actor: AuditActor.POLICY_ENGINE,
      explanation: `Guardrail triggered: ${diagnosis.policyReason}`
    }));
  }

  recoveryCaseRepository.save(newCase);

  res.json({
    scenario: config.title,
    case: newCase,
    diagnosis,
    paymentLink,
    action
  });
});

export default router;
