import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { RecoveryActionType, PolicyDecision } from '../models/RecoveryAction.js';

export const aiAgentService = {
  /**
   * Diagnoses payment failure and generates autonomous recovery recommendation
   */
  async diagnoseAndRecommend(recoveryCase, customer = null) {
    const amountPaise = recoveryCase.amountAtRisk;
    const errorCode = (recoveryCase.reason || '').toUpperCase();
    const customerName = customer?.name || 'Valued Customer';
    const amountINR = (amountPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

    let failureCategory = 'UNKNOWN';
    let actionType = RecoveryActionType.SEND_RECOVERY_MESSAGE;
    let channel = 'WHATSAPP';
    let delayMinutes = 0;
    let confidence = 0.88;
    let diagnosis = '';
    let copy = '';
    let discountPercent = 0;

    // Failure reasoning heuristics & contextual classification
    if (errorCode.includes('TIMED_OUT') || errorCode.includes('GATEWAY') || errorCode.includes('BANK_DOWNTIME') || errorCode.includes('NETWORK')) {
      failureCategory = 'TRANSIENT_GATEWAY';
      actionType = RecoveryActionType.RETRY_PAYMENT;
      channel = 'SILENT_RETRY';
      delayMinutes = 120; // Retry in 2 hours
      confidence = 0.95;
      diagnosis = 'Temporary bank server timeout or network glitch detected. Suppressing immediate customer notification to prevent unnecessary friction.';
      copy = `System scheduled autonomous silent retry in 2 hours for ${amountINR}.`;
    } else if (errorCode.includes('INSUFFICIENT') || errorCode.includes('BALANCE') || errorCode.includes('FUNDS') || errorCode.includes('LIMIT')) {
      failureCategory = 'INSUFFICIENT_FUNDS';
      actionType = RecoveryActionType.SEND_RECOVERY_MESSAGE;
      channel = 'WHATSAPP';
      delayMinutes = 0;
      confidence = 0.91;
      diagnosis = 'Customer account balance insufficient at time of automated billing cycle.';
      copy = `Hi ${customerName}, your subscription payment of ${amountINR} couldn't be processed. Click here to complete payment with 1-click UPI/Card to keep your services uninterrupted: {{PAYMENT_LINK}}`;
    } else if (errorCode.includes('AUTH') || errorCode.includes('MANDATE') || errorCode.includes('OTP') || errorCode.includes('2FA')) {
      failureCategory = 'AUTHENTICATION_REQUIRED';
      actionType = RecoveryActionType.SEND_RECOVERY_MESSAGE;
      channel = 'WHATSAPP';
      confidence = 0.89;
      diagnosis = 'Bank 2FA / RBI e-Mandate re-authentication required by issuing bank.';
      copy = `Hi ${customerName}, your bank requires a quick 2FA authorization for your ${amountINR} subscription. Authenticate securely here: {{PAYMENT_LINK}}`;
    } else if (errorCode.includes('EXPIRED') || errorCode.includes('INVALID_CARD')) {
      failureCategory = 'PAYMENT_METHOD_EXPIRED';
      actionType = RecoveryActionType.SEND_RECOVERY_MESSAGE;
      channel = 'EMAIL';
      confidence = 0.85;
      diagnosis = 'Registered payment method has expired or is invalid.';
      copy = `Hi ${customerName}, your card on file for ${amountINR} has expired. Please update your payment method via our secure checkout: {{PAYMENT_LINK}}`;
    } else if (errorCode.includes('FRAUD') || errorCode.includes('STOLEN') || errorCode.includes('BLOCKED_CARD')) {
      failureCategory = 'HARD_DECLINE';
      actionType = RecoveryActionType.ESCALATE;
      channel = 'EMAIL';
      confidence = 0.94;
      diagnosis = 'Hard decline triggered by bank risk/fraud systems. Retries strictly prohibited.';
      copy = `Security notification: Payment method flagged by issuing bank. Please use an alternative payment source.`;
    } else {
      failureCategory = 'GENERIC_FAILURE';
      actionType = RecoveryActionType.SEND_RECOVERY_MESSAGE;
      channel = 'EMAIL';
      confidence = 0.75;
      diagnosis = 'Standard payment authorization failure encountered during invoice settlement.';
      copy = `Hello ${customerName}, we encountered an issue processing your payment of ${amountINR}. Please review and retry here: {{PAYMENT_LINK}}`;
    }

    // High value customer discount incentive
    if (amountPaise > 500000 && recoveryCase.retryCount >= 1) {
      discountPercent = 5;
    }

    // Evaluate Guardrails & Policy Limits
    const policyResult = this.evaluatePolicy({
      amountPaise,
      confidence,
      retryCount: recoveryCase.retryCount,
      failureCategory,
      actionType
    });

    return {
      failureCategory,
      actionType,
      channel,
      delayMinutes,
      confidence,
      diagnosis,
      copy,
      discountPercent,
      policyDecision: policyResult.decision,
      policyReason: policyResult.reason
    };
  },

  /**
   * Deterministic Policy Engine evaluation
   */
  evaluatePolicy({ amountPaise, confidence, retryCount, failureCategory, actionType }) {
    // 1. Max Autonomous Recovery Amount Limit (Paise)
    if (amountPaise > config.policy.maxAutonomousRecoveryAmountPaise) {
      return {
        decision: PolicyDecision.BLOCKED,
        reason: `Amount (₹${(amountPaise / 100).toLocaleString()}) exceeds maximum autonomous policy threshold of ₹${(config.policy.maxAutonomousRecoveryAmountPaise / 100).toLocaleString()}. Requires Merchant Approval.`
      };
    }

    // 2. Retry Attempt Ceiling
    if (retryCount >= config.policy.maxRetryAttempts) {
      return {
        decision: PolicyDecision.BLOCKED,
        reason: `Maximum retry attempts limit (${config.policy.maxRetryAttempts}) reached. Case must be escalated to human operator.`
      };
    }

    // 3. AI Confidence Threshold
    if (confidence < config.policy.minAiConfidence) {
      return {
        decision: PolicyDecision.BLOCKED,
        reason: `AI confidence score (${(confidence * 100).toFixed(0)}%) is below required policy threshold of ${(config.policy.minAiConfidence * 100).toFixed(0)}%.`
      };
    }

    // 4. Hard Decline Protection
    if (failureCategory === 'HARD_DECLINE' && actionType === RecoveryActionType.RETRY_PAYMENT) {
      return {
        decision: PolicyDecision.BLOCKED,
        reason: 'Autonomous retries on hard fraud/card decline are strictly disallowed to prevent merchant score penalties.'
      };
    }

    return {
      decision: PolicyDecision.APPROVED,
      reason: 'All fintech policy safeguards and confidence constraints satisfied.'
    };
  }
};
