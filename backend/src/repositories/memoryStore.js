/**
 * Centralized in-memory operational store for fast, deterministic state management.
 * Keeps collections isolated with query capabilities.
 */
export const store = {
  paymentEvents: new Map(),
  recoveryCases: new Map(),
  recoveryActions: new Map(),
  auditEvents: [],
  customers: new Map(),
  processedWebhookIds: new Set(),
  idempotencyKeys: new Map(),

  clear() {
    this.paymentEvents.clear();
    this.recoveryCases.clear();
    this.recoveryActions.clear();
    this.auditEvents = [];
    this.customers.clear();
    this.processedWebhookIds.clear();
    this.idempotencyKeys.clear();
  }
};
