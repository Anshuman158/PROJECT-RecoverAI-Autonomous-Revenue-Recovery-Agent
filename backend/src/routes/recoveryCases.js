import express from 'express';
import { recoveryCaseRepository } from '../repositories/recoveryCaseRepository.js';
import { recoveryActionRepository } from '../repositories/recoveryActionRepository.js';
import { auditEventRepository } from '../repositories/auditEventRepository.js';
import { customerRepository } from '../repositories/customerRepository.js';
import { aiAgentService } from '../services/aiAgentService.js';
import { razorpayService } from '../services/razorpayService.js';
import { RecoveryCaseStatus } from '../models/RecoveryCase.js';
import { RecoveryAction, RecoveryActionStatus } from '../models/RecoveryAction.js';
import { AuditEvent, AuditActor, AuditEventType } from '../models/AuditEvent.js';

const router = express.Router();

// GET /api/recovery-cases
router.get('/recovery-cases', (req, res) => {
  const { status, problemType } = req.query;
  const cases = recoveryCaseRepository.findAll({ status, problemType });
  res.json({ cases, count: cases.length });
});

// GET /api/recovery-cases/:id
router.get('/recovery-cases/:id', (req, res) => {
  const item = recoveryCaseRepository.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Recovery case not found' });
  const customer = customerRepository.findById(item.customerId);
  const actions = recoveryActionRepository.findByRecoveryCaseId(item.id);
  const audits = auditEventRepository.findByRecoveryCaseId(item.id);

  res.json({
    case: item,
    customer,
    actions,
    audits
  });
});

// POST /api/recovery-cases/:id/analyze
router.post('/recovery-cases/:id/analyze', async (req, res) => {
  const item = recoveryCaseRepository.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Recovery case not found' });

  const customer = customerRepository.findById(item.customerId);
  const diagnosis = await aiAgentService.diagnoseAndRecommend(item, customer);

  item.diagnosis = diagnosis.diagnosis;
  item.confidence = diagnosis.confidence;
  item.recommendedAction = diagnosis.actionType;
  item.policyDecision = diagnosis.policyDecision;
  item.policyReason = diagnosis.policyReason;
  item.status = RecoveryCaseStatus.DIAGNOSED;
  recoveryCaseRepository.save(item);

  auditEventRepository.save(new AuditEvent({
    recoveryCaseId: item.id,
    eventType: AuditEventType.DIAGNOSIS_GENERATED,
    actor: AuditActor.RECOVERY_AGENT,
    explanation: `Manual diagnosis performed: categorized as ${diagnosis.failureCategory} (${(diagnosis.confidence * 100).toFixed(0)}% confidence)`
  }));

  res.json({ case: item, diagnosis });
});

// POST /api/recovery-cases/:id/execute
router.post('/recovery-cases/:id/execute', async (req, res) => {
  const item = recoveryCaseRepository.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Recovery case not found' });

  const customer = customerRepository.findById(item.customerId);
  const diagnosis = await aiAgentService.diagnoseAndRecommend(item, customer);

  // Generate dynamic link
  const link = await razorpayService.createRecoveryPaymentLink({
    amountPaise: item.amountAtRisk,
    customer,
    description: `Recovery for ${item.id}`,
    referenceId: item.id
  });

  const customizedCopy = diagnosis.copy.replace('{{PAYMENT_LINK}}', link.shortUrl);

  const action = recoveryActionRepository.save(new RecoveryAction({
    recoveryCaseId: item.id,
    actionType: diagnosis.actionType,
    amount: item.amountAtRisk,
    status: RecoveryActionStatus.EXECUTED,
    policyDecision: 'APPROVED',
    policyReason: 'Manual execution trigger',
    attemptedAt: new Date().toISOString(),
    resultMetadata: {
      channel: diagnosis.channel,
      paymentLink: link.shortUrl,
      messageCopy: customizedCopy
    }
  }));

  item.retryCount += 1;
  item.status = RecoveryCaseStatus.EXECUTING;
  recoveryCaseRepository.save(item);

  auditEventRepository.save(new AuditEvent({
    recoveryCaseId: item.id,
    eventType: AuditEventType.ACTION_EXECUTED,
    actor: AuditActor.MERCHANT,
    explanation: `Recovery action executed via ${diagnosis.channel} with dynamic payment link: ${link.shortUrl}`,
    metadata: { actionId: action.id, link: link.shortUrl }
  }));

  res.json({ case: item, action, paymentLink: link });
});

// GET /api/recovery-cases/:id/audit
router.get('/recovery-cases/:id/audit', (req, res) => {
  const audits = auditEventRepository.findByRecoveryCaseId(req.params.id);
  res.json({ audits });
});

export default router;
