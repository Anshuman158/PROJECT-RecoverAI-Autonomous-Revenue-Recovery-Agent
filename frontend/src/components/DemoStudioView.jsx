import React, { useState } from 'react';
import { 
  PlayCircle, 
  Zap, 
  ShieldAlert, 
  Clock, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function DemoStudioView() {
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('BANK_DOWNTIME');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scenarios = [
    {
      key: 'BANK_DOWNTIME',
      title: 'Transient Bank Server Downtime',
      description: 'HDFC gateway timed out. Agent schedules silent background retry (no customer spam).',
      badge: 'Silent Retry',
      badgeColor: 'neutral',
      amountINR: '1,999'
    },
    {
      key: 'INSUFFICIENT_FUNDS',
      title: 'Insufficient Balance on Autopay Mandate',
      description: 'Customer balance low. Agent dispatches instant WhatsApp message with 1-click UPI checkout link.',
      badge: 'WhatsApp Recovery',
      badgeColor: 'success',
      amountINR: '499'
    },
    {
      key: 'MANDATE_2FA_EXPIRED',
      title: 'RBI 2FA / e-Mandate Authentication Expired',
      description: 'Bank requires manual customer 2FA OTP re-authentication before subscription renews.',
      badge: '2FA Auth Link',
      badgeColor: 'warning',
      amountINR: '9,999'
    },
    {
      key: 'VIP_HIGH_VALUE_ESCALATE',
      title: 'High-Value Invoice (Exceeds ₹10,000 Cap)',
      description: 'Transaction is ₹25,000. Autonomous action is BLOCKED and escalated to Human-in-the-Loop.',
      badge: 'Guardrail Escalate',
      badgeColor: 'danger',
      amountINR: '25,000'
    }
  ];

  const handleTrigger = async (scenarioKey) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedScenario(scenarioKey);
      const res = await api.triggerDemoScenario(scenarioKey);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header Info */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#60a5fa" />
              Live Razorpay Webhook & Autonomous Recovery Simulator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Test the end-to-end autonomous agent workflow in real-time. Trigger simulated payment failures and watch the failure diagnosis, guardrail verification, and dynamic Razorpay payment links in action.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selection Grid */}
      <div className="grid-cards" style={{ marginBottom: '24px' }}>
        {scenarios.map((s) => {
          const isSelected = selectedScenario === s.key;
          return (
            <div 
              key={s.key} 
              className="card"
              style={{ 
                margin: 0, 
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--color-brand)' : 'var(--border-subtle)',
                background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleTrigger(s.key)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${s.badgeColor}`} style={{ fontSize: '0.7rem' }}>{s.badge}</span>
                <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>₹{s.amountINR}</span>
              </div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginTop: '10px' }}>{s.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                {s.description}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '14px', justifyContent: 'center', padding: '6px 12px', fontSize: '0.82rem' }}
                disabled={loading}
              >
                <PlayCircle size={14} />
                <span>{loading && isSelected ? 'Simulating...' : 'Simulate Failure'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Live Simulation Response Box */}
      {error && (
        <div className="card" style={{ background: 'var(--color-danger-bg)', color: '#fca5a5', marginBottom: '24px' }}>
          <AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px' }} />
          Simulation failed: {error}
        </div>
      )}

      {result && (
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', animation: 'fadeIn 0.3s ease' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#34d399" />
              Agent Diagnostic & Autonomous Execution Output
            </span>
            <span className={`badge badge-${result.diagnosis?.policyDecision === 'APPROVED' ? 'success' : 'danger'}`}>
              Policy Decision: {result.diagnosis?.policyDecision}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '16px' }}>
            {/* Left Column: Diagnostics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Failure Classification</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {result.diagnosis?.failureCategory}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {result.diagnosis?.diagnosis}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guardrail Compliance Reason</div>
                <div style={{ fontSize: '0.85rem', color: result.diagnosis?.policyDecision === 'APPROVED' ? '#34d399' : '#f87171', marginTop: '4px', fontWeight: '600' }}>
                  {result.diagnosis?.policyReason}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Confidence</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#60a5fa' }}>
                    {((result.diagnosis?.confidence || 0) * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ flex: 1, padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Action Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {result.diagnosis?.actionType}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Payment Link & Copy */}
            <div style={{ padding: '16px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                Dispatched Customer Communication ({result.diagnosis?.channel})
              </div>

              <div style={{ 
                background: '#0a0d14', 
                padding: '14px', 
                borderRadius: '8px', 
                fontSize: '0.82rem', 
                color: 'var(--text-primary)', 
                lineHeight: '1.5',
                border: '1px solid #1e293b',
                fontFamily: 'var(--font-mono)'
              }}>
                {result.action?.resultMetadata?.messageCopy || result.diagnosis?.copy}
              </div>

              {result.paymentLink?.shortUrl && (
                <div style={{ marginTop: '14px' }}>
                  <a 
                    href={result.paymentLink.shortUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', color: '#3b82f6', borderColor: '#3b82f6' }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Generated Razorpay Link ({result.paymentLink.shortUrl})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
