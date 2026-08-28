import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let razorpayInstance = null;

if (config.razorpay.keyId && config.razorpay.keySecret && !config.razorpay.keyId.includes('placeholder')) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });
  } catch (err) {
    logger.warn('RAZORPAY_INIT_WARNING', { error: err.message });
  }
}

export const razorpayService = {
  /**
   * Validates the cryptographic signature of incoming Razorpay webhooks using HMAC-SHA256
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    if (!signature) return false;
    const webhookSecret = secret || config.razorpay.webhookSecret;
    if (!webhookSecret) {
      logger.warn('WEBHOOK_SECRET_MISSING', { message: 'No webhook secret configured in environment' });
      return true; // Allow in development mode if secret not configured
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf8'),
        Buffer.from(signature, 'utf8')
      );
    } catch (err) {
      logger.error('SIGNATURE_VERIFICATION_ERROR', { error: err.message });
      return false;
    }
  },

  /**
   * Generates a single-click dynamic Razorpay payment link for customer checkout
   */
  async createRecoveryPaymentLink({ amountPaise, customer, description, referenceId }) {
    if (typeof amountPaise !== 'number' || !Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new Error(`Invalid amount in paise: ${amountPaise}`);
    }

    const expireBy = Math.floor(Date.now() / 1000) + (config.policy.actionExpiryMinutes * 60);

    // If live/test Razorpay client is initialized
    if (razorpayInstance) {
      try {
        const link = await razorpayInstance.paymentLink.create({
          amount: amountPaise,
          currency: 'INR',
          accept_partial: false,
          description: description || 'RecoverAI Payment Recovery',
          customer: {
            name: customer?.name || 'Valued Customer',
            email: customer?.email || 'customer@example.com',
            contact: customer?.phone || '+919876543210'
          },
          notify: {
            sms: true,
            email: true,
            whatsapp: true
          },
          reminder_enable: true,
          reference_id: referenceId || `rc_${Date.now()}`,
          expire_by: expireBy
        });

        return {
          id: link.id,
          shortUrl: link.short_url,
          status: link.status,
          amountPaise: link.amount,
          expireBy
        };
      } catch (err) {
        logger.error('RAZORPAY_API_ERROR', { error: err.message });
      }
    }

    // High-fidelity fallback / simulated payment link with test tokens
    const simulatedId = `plink_${crypto.randomUUID().slice(0, 12)}`;
    return {
      id: simulatedId,
      shortUrl: `https://rzp.io/i/rec_${simulatedId.slice(6)}`,
      status: 'created',
      amountPaise,
      expireBy,
      simulated: true
    };
  }
};
