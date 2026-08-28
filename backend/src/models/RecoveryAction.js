import crypto from 'crypto';

export const RecoveryActionType = {
  RETRY_PAYMENT: 'RETRY_PAYMENT',
  SEND_RECOVERY_MESSAGE: 'SEND_RECOVERY_MESSAGE',
  ESCALATE: 'ESCALATE',
  NO_ACTION: 'NO_ACTION'
};

export const RecoveryActionStatus = {
  PENDING: 'PENDING',
  EXECUTED: 'EXECUTED',
  BLOCKED: 'BLOCKED',
  FAILED: 'FAILED',
  UNCERTAIN: 'UNCERTAIN'
};

export const PolicyDecision = {
  APPROVED: 'APPROVED',
  BLOCKED: 'BLOCKED'
};

/**
 * RecoveryAction encapsulates an individual action evaluated by the Policy Engine.
 */
export class RecoveryAction {
  constructor({
    id = `act_${crypto.randomUUID().slice(0, 8)}`,
    recoveryCaseId,
    actionType,
    amount, // integer paise
    status = RecoveryActionStatus.PENDING,
    policyDecision = null,
    policyReason = null,
    idempotencyKey = `idemp_${crypto.randomUUID()}`,
    attemptedAt = null,
    completedAt = null,
    resultMetadata = {}
  }) {
    if (!recoveryCaseId) throw new Error('RecoveryAction requires recoveryCaseId');
    if (!Object.values(RecoveryActionType).includes(actionType)) {
      throw new Error(`Invalid RecoveryActionType: ${actionType}`);
    }

    this.id = id;
    this.recoveryCaseId = recoveryCaseId;
    this.actionType = actionType;
    this.amount = amount;
    this.status = status;
    this.policyDecision = policyDecision;
    this.policyReason = policyReason;
    this.idempotencyKey = idempotencyKey;
    this.attemptedAt = attemptedAt;
    this.completedAt = completedAt;
    this.resultMetadata = resultMetadata;
  }
}
