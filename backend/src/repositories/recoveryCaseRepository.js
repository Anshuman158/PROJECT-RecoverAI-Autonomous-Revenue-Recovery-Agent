import { store } from './memoryStore.js';
import { RecoveryCase } from '../models/RecoveryCase.js';

export const recoveryCaseRepository = {
  save(recoveryCase) {
    const instance = recoveryCase instanceof RecoveryCase ? recoveryCase : new RecoveryCase(recoveryCase);
    instance.updatedAt = new Date().toISOString();
    store.recoveryCases.set(instance.id, instance);
    return instance;
  },

  findById(id) {
    return store.recoveryCases.get(id) || null;
  },

  findByEventId(eventId) {
    for (const item of store.recoveryCases.values()) {
      if (item.eventId === eventId) return item;
    }
    return null;
  },

  findByCustomerId(customerId) {
    return Array.from(store.recoveryCases.values()).filter(c => c.customerId === customerId);
  },

  findAll(filters = {}) {
    let list = Array.from(store.recoveryCases.values());

    if (filters.status) {
      list = list.filter(c => c.status === filters.status);
    }
    if (filters.problemType) {
      list = list.filter(c => c.problemType === filters.problemType);
    }

    // Sort descending by createdAt
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getMetrics() {
    let totalRiskPaise = 0;
    let totalRecoveredPaise = 0;
    let totalCases = 0;
    let recoveredCases = 0;
    let failedCases = 0;
    let blockedCases = 0;
    let escalatedCases = 0;

    for (const c of store.recoveryCases.values()) {
      totalCases++;
      totalRiskPaise += c.amountAtRisk || 0;
      totalRecoveredPaise += c.recoveredAmount || 0;

      if (c.status === 'RECOVERED') recoveredCases++;
      if (c.status === 'FAILED') failedCases++;
      if (c.status === 'BLOCKED' || c.policyDecision === 'BLOCKED') blockedCases++;
      if (c.status === 'ESCALATED') escalatedCases++;
    }

    const recoveryRate = totalRiskPaise > 0 ? (totalRecoveredPaise / totalRiskPaise) : 0;
    const avgRecoveredAmountPaise = recoveredCases > 0 ? Math.round(totalRecoveredPaise / recoveredCases) : 0;

    return {
      totalRiskPaise,
      totalRiskINR: totalRiskPaise / 100,
      totalRecoveredPaise,
      totalRecoveredINR: totalRecoveredPaise / 100,
      recoveryRate: parseFloat((recoveryRate * 100).toFixed(2)),
      totalCases,
      recoveredCases,
      failedCases,
      blockedCases,
      escalatedCases,
      avgRecoveredAmountINR: avgRecoveredAmountPaise / 100
    };
  }
};
