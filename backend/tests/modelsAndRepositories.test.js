import test from 'node:test';
import assert from 'node:assert';
import { PaymentEvent } from '../src/models/PaymentEvent.js';
import { RecoveryCase, RecoveryCaseStatus, RecoveryProblemType } from '../src/models/RecoveryCase.js';
import { RecoveryAction, RecoveryActionType, PolicyDecision } from '../src/models/RecoveryAction.js';
import { AuditEvent, AuditActor, AuditEventType } from '../src/models/AuditEvent.js';
import { store } from '../src/repositories/memoryStore.js';
import { paymentEventRepository } from '../src/repositories/paymentEventRepository.js';
import { recoveryCaseRepository } from '../src/repositories/recoveryCaseRepository.js';
import { recoveryActionRepository } from '../src/repositories/recoveryActionRepository.js';
import { auditEventRepository } from '../src/repositories/auditEventRepository.js';

test('Domain Models - rejects invalid floating or negative monetary values', () => {
  assert.throws(() => {
    new PaymentEvent({
      customerId: 'cust_123',
      amount: 149.99, // Float error
      status: 'failed'
    });
  }, /must be a non-negative integer/);

  assert.throws(() => {
    new RecoveryCase({
      eventId: 'evt_123',
      customerId: 'cust_123',
      amountAtRisk: -500 // Negative error
    });
  }, /must be a positive integer in paise/);
});

test('Domain Models & Repositories - save and query work with paise conversions and metrics', () => {
  store.clear();

  const payEvent = paymentEventRepository.save({
    customerId: 'cust_001',
    amount: 149900, // ₹1,499 in paise
    status: 'failed',
    errorCode: 'GATEWAY_TIMEOUT'
  });
  assert.strictEqual(payEvent.amount, 149900);
  assert.ok(paymentEventRepository.findById(payEvent.id));

  const recCase = recoveryCaseRepository.save({
    eventId: payEvent.id,
    customerId: 'cust_001',
    problemType: RecoveryProblemType.FAILED_PAYMENT,
    amountAtRisk: 149900,
    status: RecoveryCaseStatus.RECOVERED,
    recoveredAmount: 149900
  });

  const recCase2 = recoveryCaseRepository.save({
    eventId: 'evt_999',
    customerId: 'cust_002',
    problemType: RecoveryProblemType.CHECKOUT_ABANDONMENT,
    amountAtRisk: 499900, // ₹4,999
    status: RecoveryCaseStatus.BLOCKED,
    policyDecision: PolicyDecision.BLOCKED,
    recoveredAmount: 0
  });

  const metrics = recoveryCaseRepository.getMetrics();
  assert.strictEqual(metrics.totalCases, 2);
  assert.strictEqual(metrics.totalRiskINR, 6498); // 1499 + 4999
  assert.strictEqual(metrics.totalRecoveredINR, 1499);
  assert.strictEqual(metrics.recoveredCases, 1);
  assert.strictEqual(metrics.blockedCases, 1);
  assert.strictEqual(metrics.recoveryRate, 23.07); // 149900 / 649800 * 100

  // Verify Audit Trail
  const audit = auditEventRepository.save({
    recoveryCaseId: recCase.id,
    eventType: AuditEventType.CASE_CREATED,
    actor: AuditActor.SYSTEM,
    explanation: 'Case created for failed payment recovery'
  });
  assert.ok(audit.id);
  const caseAudit = auditEventRepository.findByRecoveryCaseId(recCase.id);
  assert.strictEqual(caseAudit.length, 1);
  assert.strictEqual(caseAudit[0].eventType, AuditEventType.CASE_CREATED);
});
