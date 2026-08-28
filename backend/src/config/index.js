import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.LLM_MODEL || 'gemini-2.5-flash'
  },
  policy: {
    maxAutonomousRecoveryAmountPaise: parseInt(process.env.MAX_AUTONOMOUS_RECOVERY_AMOUNT || '1000000', 10), // ₹10,000 in paise
    maxRetryAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
    maxCustomerRecoveryContacts: parseInt(process.env.MAX_CUSTOMER_RECOVERY_CONTACTS || '1', 10),
    minAiConfidence: parseFloat(process.env.MIN_AI_CONFIDENCE || '0.70'),
    actionExpiryMinutes: parseInt(process.env.ACTION_EXPIRY_MINUTES || '15', 10)
  }
};
