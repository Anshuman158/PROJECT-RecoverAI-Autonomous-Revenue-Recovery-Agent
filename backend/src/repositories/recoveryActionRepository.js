import { store } from './memoryStore.js';
import { RecoveryAction } from '../models/RecoveryAction.js';

export const recoveryActionRepository = {
  save(action) {
    const instance = action instanceof RecoveryAction ? action : new RecoveryAction(action);
    store.recoveryActions.set(instance.id, instance);
    if (instance.idempotencyKey) {
      store.idempotencyKeys.set(instance.idempotencyKey, instance);
    }
    return instance;
  },

  findById(id) {
    return store.recoveryActions.get(id) || null;
  },

  findByIdempotencyKey(key) {
    return store.idempotencyKeys.get(key) || null;
  },

  findByRecoveryCaseId(recoveryCaseId) {
    return Array.from(store.recoveryActions.values())
      .filter(a => a.recoveryCaseId === recoveryCaseId)
      .sort((a, b) => new Date(a.attemptedAt || 0) - new Date(b.attemptedAt || 0));
  },

  findAll() {
    return Array.from(store.recoveryActions.values());
  }
};
