/**
 * Centralized API client for RecoverAI frontend
 */
const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  async getDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard/summary`);
    if (!res.ok) throw new Error(`Failed to fetch dashboard summary: ${res.statusText}`);
    return res.json();
  },

  async getRecoveryCases(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/recovery-cases${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error(`Failed to fetch recovery cases: ${res.statusText}`);
    return res.json();
  },

  async getRecoveryCaseById(id) {
    const res = await fetch(`${BASE_URL}/recovery-cases/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch recovery case ${id}: ${res.statusText}`);
    return res.json();
  },

  async analyzeCase(id) {
    const res = await fetch(`${BASE_URL}/recovery-cases/${id}/analyze`, { method: 'POST' });
    if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
    return res.json();
  },

  async executeCase(id) {
    const res = await fetch(`${BASE_URL}/recovery-cases/${id}/execute`, { method: 'POST' });
    if (!res.ok) throw new Error(`Execution failed: ${res.statusText}`);
    return res.json();
  },

  async getCaseAudit(id) {
    const res = await fetch(`${BASE_URL}/recovery-cases/${id}/audit`);
    if (!res.ok) throw new Error(`Failed to fetch audit: ${res.statusText}`);
    return res.json();
  },

  async runEvaluation(payload = {}) {
    const res = await fetch(`${BASE_URL}/evaluation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Evaluation run failed: ${res.statusText}`);
    return res.json();
  },

  async getEvaluationResults() {
    const res = await fetch(`${BASE_URL}/evaluation/results`);
    if (!res.ok) throw new Error(`Failed to fetch evaluation results: ${res.statusText}`);
    return res.json();
  },

  async triggerDemoScenario(scenarioKey) {
    const res = await fetch(`${BASE_URL}/demo/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: scenarioKey })
    });
    if (!res.ok) throw new Error(`Demo trigger failed: ${res.statusText}`);
    return res.json();
  }
};
