import crypto from 'crypto';

export const RecoveryCaseStatus = {
  DETECTED: 'DETECTED',
  DIAGNOSED: 'DIAGNOSED',
  APPROVED: 'APPROVED',
  BLOCKED: 'BLOCKED',
  EXECUTING: 'EXECUTING',
  RECOVERED: 'RECOVERED',
  FAILED: 'FAILED',
  ESCALATED: 'ESCALATED'
};

export const RecoveryProblemType = {
  FAILED_PAYMENT: 'FAILED_PAYMENT',
  CHECKOUT_ABANDONMENT: 'CHECKOUT_ABANDONMENT',
  FAILED_SUBSCRIPTION: 'FAILED_SUBSCRIPTION'
};

/**
 * RecoveryCase represents an active or resolved revenue recovery workflow.
 * Holds diagnostic context, policy boundaries, and recovery state.
 */
export class RecoveryCase {
  constructor({
    id = `rc_${crypto.randomUUID().slice(0, 8)}`,
    eventId,
    customerId,
    problemType = RecoveryProblemType.FAILED_PAYMENT,
    amountAtRisk, // integer paise
    currency = 'INR',
    reason = '',
    status = RecoveryCaseStatus.DETECTED,
    diagnosis = null,
    confidence = null,
    recommendedAction = null,
    policyDecision = null,
    policyReason = null,
    retryCount = 0,
    recoveredAmount = 0, // integer paise
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    if (!eventId) throw new Error('RecoveryCase requires eventId');
    if (!customerId) throw new Error('RecoveryCase requires customerId');
    if (typeof amountAtRisk !== 'number' || !Number.isInteger(amountAtRisk) || amountAtRisk < 0) {
      throw new Error(`RecoveryCase amountAtRisk must be a positive integer in paise, received: ${amountAtRisk}`);
    }

    this.id = id;
    this.eventId = eventId;
    this.customerId = customerId;
    this.problemType = problemType;
    this.amountAtRisk = amountAtRisk;
    this.currency = currency;
    this.reason = reason;
    this.status = status;
    this.diagnosis = diagnosis;
    this.confidence = confidence;
    this.recommendedAction = recommendedAction;
    this.policyDecision = policyDecision;
    this.policyReason = policyReason;
    this.retryCount = retryCount;
    this.recoveredAmount = recoveredAmount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
