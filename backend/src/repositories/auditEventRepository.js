import { store } from './memoryStore.js';
import { AuditEvent } from '../models/AuditEvent.js';

export const auditEventRepository = {
  save(event) {
    const instance = event instanceof AuditEvent ? event : new AuditEvent(event);
    store.auditEvents.push(instance);
    return instance;
  },

  findByRecoveryCaseId(recoveryCaseId) {
    return store.auditEvents
      .filter(e => e.recoveryCaseId === recoveryCaseId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  findAll(limit = 100) {
    // Return recent audit events first
    return [...store.auditEvents]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
};
