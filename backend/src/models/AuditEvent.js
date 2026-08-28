import crypto from 'crypto';

export const AuditActor = {
  SYSTEM: 'SYSTEM',
  RECOVERY_AGENT: 'RECOVERY_AGENT',
  POLICY_ENGINE: 'POLICY_ENGINE',
  ACTION_EXECUTOR: 'ACTION_EXECUTOR',
  RAZORPAY_WEBHOOK: 'RAZORPAY_WEBHOOK',
  MERCHANT: 'MERCHANT'
};

export const AuditEventType = {
  EVENT_RECEIVED: 'EVENT_RECEIVED',
  DUPLICATE_IGNORED: 'DUPLICATE_IGNORED',
  RISK_ASSESSED: 'RISK_ASSESSED',
  CASE_CREATED: 'CASE_CREATED',
  DIAGNOSIS_GENERATED: 'DIAGNOSIS_GENERATED',
  RECOMMENDATION_PROPOSED: 'RECOMMENDATION_PROPOSED',
  POLICY_EVALUATED: 'POLICY_EVALUATED',
  ACTION_EXECUTED: 'ACTION_EXECUTED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  RECOVERY_COMPLETED: 'RECOVERY_COMPLETED',
  ACTION_BLOCKED: 'ACTION_BLOCKED',
  FAILURE_HANDLED: 'FAILURE_HANDLED',
  ESCALATED: 'ESCALATED'
};

/**
 * AuditEvent records immutable step-by-step history of every recovery decision.
 */
export class AuditEvent {
  constructor({
    id = `aud_${crypto.randomUUID().slice(0, 10)}`,
    recoveryCaseId,
    eventType,
    actor,
    explanation,
    metadata = {},
    createdAt = new Date().toISOString()
  }) {
    if (!eventType) throw new Error('AuditEvent requires eventType');
    if (!actor) throw new Error('AuditEvent requires actor');

    this.id = id;
    this.recoveryCaseId = recoveryCaseId;
    this.eventType = eventType;
    this.actor = actor;
    this.explanation = explanation;
    this.metadata = metadata;
    this.createdAt = createdAt;
  }
}
