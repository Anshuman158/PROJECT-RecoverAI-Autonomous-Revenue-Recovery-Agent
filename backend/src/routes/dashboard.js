import express from 'express';
import { recoveryCaseRepository } from '../repositories/recoveryCaseRepository.js';
import { auditEventRepository } from '../repositories/auditEventRepository.js';
import { store } from '../repositories/memoryStore.js';

const router = express.Router();

router.get('/dashboard/summary', (req, res) => {
  const metrics = recoveryCaseRepository.getMetrics();
  const recentCases = recoveryCaseRepository.findAll().slice(0, 10);
  const recentAudits = auditEventRepository.findAll().slice(0, 15);

  // Group cases by problem type
  const casesByProblemType = {
    FAILED_PAYMENT: 0,
    FAILED_SUBSCRIPTION: 0,
    CHECKOUT_ABANDONMENT: 0
  };

  // Channel distribution from executed actions
  const channelBreakdown = {
    WHATSAPP: 0,
    EMAIL: 0,
    SMS: 0,
    SILENT_RETRY: 0
  };

  for (const c of store.recoveryCases.values()) {
    if (casesByProblemType[c.problemType] !== undefined) {
      casesByProblemType[c.problemType]++;
    }
  }

  for (const a of store.recoveryActions.values()) {
    const channel = a.resultMetadata?.channel;
    if (channel && channelBreakdown[channel] !== undefined) {
      channelBreakdown[channel]++;
    }
  }

  res.json({
    metrics,
    casesByProblemType,
    channelBreakdown,
    recentCases,
    recentAudits
  });
});

export default router;
