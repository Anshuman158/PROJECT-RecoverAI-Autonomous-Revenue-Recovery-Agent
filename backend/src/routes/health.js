import { Router } from 'express';
import { config } from '../config/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'RecoverAI Backend',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    razorpayConfigured: Boolean(config.razorpay.keyId && config.razorpay.keySecret),
    aiConfigured: Boolean(config.ai.geminiApiKey),
    policyLimits: {
      maxAutonomousRecoveryAmountPaise: config.policy.maxAutonomousRecoveryAmountPaise,
      maxAutonomousRecoveryAmountINR: config.policy.maxAutonomousRecoveryAmountPaise / 100,
      maxRetryAttempts: config.policy.maxRetryAttempts,
      minAiConfidence: config.policy.minAiConfidence
    }
  });
});

export default router;
