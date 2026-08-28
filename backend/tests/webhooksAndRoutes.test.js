import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('Webhooks Route - successfully ingests failed payment and creates recovery case', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  const payload = {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: `pay_test_${Date.now()}`,
          amount: 149900,
          customer_id: 'cust_webhook_test',
          error_code: 'INSUFFICIENT_FUNDS',
          error_description: 'Customer account balance low',
          email: 'test@example.com',
          contact: '+919999988888'
        }
      }
    }
  };

  try {
    const res = await fetch(`http://localhost:${port}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(data.caseId);
  } finally {
    server.close();
  }
});

test('Dashboard Summary Route - returns aggregate metrics', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/dashboard/summary`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.metrics);
    assert.ok(data.casesByProblemType);
  } finally {
    server.close();
  }
});

test('Demo Trigger Route - simulates transient bank downtime scenario with guardrails', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/demo/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'BANK_DOWNTIME' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.diagnosis.failureCategory, 'TRANSIENT_GATEWAY');
    assert.equal(data.diagnosis.policyDecision, 'APPROVED');
  } finally {
    server.close();
  }
});
