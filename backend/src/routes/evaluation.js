import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiAgentService } from '../services/aiAgentService.js';
import { RecoveryCase } from '../models/RecoveryCase.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let latestEvaluationResults = null;

router.post('/evaluation/run', async (req, res) => {
  try {
    const paymentsPath = path.resolve(__dirname, '../../../data/synthetic/payments.json');
    if (!fs.existsSync(paymentsPath)) {
      return res.status(404).json({ error: 'Synthetic dataset not found' });
    }

    const rawData = fs.readFileSync(paymentsPath, 'utf8');
    const payments = JSON.parse(rawData);
    const failedPayments = payments.filter(p => p.status === 'failed').slice(0, 100);

    let totalEvaluated = 0;
    let totalRiskPaise = 0;
    let simulatedRecoveredPaise = 0;
    let guardrailBlocked = 0;
    let autoApproved = 0;
    let channelCounts = { WHATSAPP: 0, EMAIL: 0, SMS: 0, SILENT_RETRY: 0 };
    let categoryCounts = {};

    for (const p of failedPayments) {
      totalEvaluated++;
      totalRiskPaise += p.amount;

      const dummyCase = new RecoveryCase({
        eventId: p.id,
        customerId: p.customerId || 'cust_synthetic',
        amountAtRisk: p.amount,
        reason: p.errorCode || 'UNKNOWN_ERROR'
      });

      const diagnosis = await aiAgentService.diagnoseAndRecommend(dummyCase);

      categoryCounts[diagnosis.failureCategory] = (categoryCounts[diagnosis.failureCategory] || 0) + 1;
      if (channelCounts[diagnosis.channel] !== undefined) {
        channelCounts[diagnosis.channel]++;
      }

      if (diagnosis.policyDecision === 'APPROVED') {
        autoApproved++;
        // Simulated recovery probability by failure category
        const recoveryProb = diagnosis.failureCategory === 'TRANSIENT_GATEWAY' ? 0.92 :
                             diagnosis.failureCategory === 'INSUFFICIENT_FUNDS' ? 0.72 :
                             diagnosis.failureCategory === 'AUTHENTICATION_REQUIRED' ? 0.65 : 0.45;
        simulatedRecoveredPaise += Math.round(p.amount * recoveryProb);
      } else {
        guardrailBlocked++;
      }
    }

    const baselineDunningRecoveryPaise = Math.round(totalRiskPaise * 0.18); // Traditional dunning standard ~18%
    const aiRecoveryRate = totalRiskPaise > 0 ? (simulatedRecoveredPaise / totalRiskPaise) : 0;
    const liftPercent = baselineDunningRecoveryPaise > 0 
      ? (((simulatedRecoveredPaise - baselineDunningRecoveryPaise) / baselineDunningRecoveryPaise) * 100) 
      : 0;

    latestEvaluationResults = {
      evaluatedCases: totalEvaluated,
      totalRiskINR: totalRiskPaise / 100,
      baselineRecoveredINR: baselineDunningRecoveryPaise / 100,
      aiRecoveredINR: simulatedRecoveredPaise / 100,
      recoveryRatePercent: parseFloat((aiRecoveryRate * 100).toFixed(2)),
      liftPercent: parseFloat(liftPercent.toFixed(1)),
      autoApproved,
      guardrailBlocked,
      channelCounts,
      categoryCounts,
      timestamp: new Date().toISOString()
    };

    res.json(latestEvaluationResults);
  } catch (err) {
    res.status(500).json({ error: 'Evaluation failed', message: err.message });
  }
});

router.get('/evaluation/results', (req, res) => {
  res.json(latestEvaluationResults || { status: 'No evaluation run yet' });
});

export default router;
