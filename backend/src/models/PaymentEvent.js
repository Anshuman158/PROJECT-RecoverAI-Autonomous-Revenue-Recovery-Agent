import crypto from 'crypto';

/**
 * PaymentEvent represents an incoming payment event from Razorpay Webhook or Checkout Ingestion.
 * Monetary amounts are strictly integer paise.
 */
export class PaymentEvent {
  constructor({
    id = `evt_${crypto.randomUUID()}`,
    razorpayPaymentId = null,
    orderId = null,
    customerId,
    amount, // in paise integer
    currency = 'INR',
    status, // 'failed', 'authorized', 'captured', 'abandoned', 'subscription_failed'
    errorCode = null,
    errorDescription = null,
    createdAt = new Date().toISOString(),
    source = 'RAZORPAY_WEBHOOK' // 'RAZORPAY_WEBHOOK', 'CHECKOUT_SYSTEM', 'SUBSCRIPTION_ENGINE'
  }) {
    if (!customerId) throw new Error('PaymentEvent requires customerId');
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0) {
      throw new Error(`PaymentEvent amount must be a non-negative integer (paise), received: ${amount}`);
    }

    this.id = id;
    this.razorpayPaymentId = razorpayPaymentId;
    this.orderId = orderId;
    this.customerId = customerId;
    this.amount = amount;
    this.currency = currency;
    this.status = status;
    this.errorCode = errorCode;
    this.errorDescription = errorDescription;
    this.createdAt = createdAt;
    this.source = source;
  }
}
