import test from 'node:test';
import assert from 'node:assert';
import { createApp } from '../src/app.js';

test('Health Check Route - returns HEALTHY status and policy limits', async () => {
  const app = createApp();
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    
    const body = await res.json();
    assert.strictEqual(body.status, 'HEALTHY');
    assert.strictEqual(body.service, 'RecoverAI Backend');
    assert.ok(body.policyLimits);
    assert.strictEqual(typeof body.policyLimits.maxAutonomousRecoveryAmountPaise, 'number');
    assert.strictEqual(typeof body.policyLimits.maxRetryAttempts, 'number');
  } finally {
    server.close();
  }
});
