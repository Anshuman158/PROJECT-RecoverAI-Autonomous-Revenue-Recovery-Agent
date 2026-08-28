import { store } from './memoryStore.js';
import { PaymentEvent } from '../models/PaymentEvent.js';

export const paymentEventRepository = {
  save(event) {
    const instance = event instanceof PaymentEvent ? event : new PaymentEvent(event);
    store.paymentEvents.set(instance.id, instance);
    return instance;
  },

  findById(id) {
    return store.paymentEvents.get(id) || null;
  },

  findByRazorpayPaymentId(razorpayPaymentId) {
    if (!razorpayPaymentId) return null;
    for (const evt of store.paymentEvents.values()) {
      if (evt.razorpayPaymentId === razorpayPaymentId) return evt;
    }
    return null;
  },

  findAll() {
    return Array.from(store.paymentEvents.values());
  },

  isWebhookProcessed(webhookEventId) {
    return store.processedWebhookIds.has(webhookEventId);
  },

  markWebhookProcessed(webhookEventId) {
    store.processedWebhookIds.add(webhookEventId);
  }
};
