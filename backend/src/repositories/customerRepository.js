import { store } from './memoryStore.js';

export const customerRepository = {
  save(customer) {
    store.customers.set(customer.id, { ...customer });
    return customer;
  },

  findById(id) {
    return store.customers.get(id) || null;
  },

  findAll() {
    return Array.from(store.customers.values());
  },

  seed(customersList) {
    for (const c of customersList) {
      store.customers.set(c.id, c);
    }
  }
};
