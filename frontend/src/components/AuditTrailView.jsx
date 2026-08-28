import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Shield, Zap, Server, User } from 'lucide-react';
import { api } from '../services/api';

export default function AuditTrailView() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAudits = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setAudits(res.recentAudits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Immutable Recovery Audit Trail</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Cryptographically tracked timeline of all webhook events, failure diagnoses, and autonomous actions.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={loadAudits}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Audit</span>
        </button>
      </div>

      <div className="card" style={{ background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {audits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              No audit events recorded yet. Webhooks and demo simulations will appear here in real-time.
            </div>
          ) : (
            audits.map((a) => (
              <div 
                key={a.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '14px', 
                  padding: '14px 16px', 
                  background: 'var(--bg-surface-elevated)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ 
                  background: a.actor === 'POLICY_ENGINE' ? 'var(--color-warning-bg)' : 
                              a.actor === 'RECOVERY_AGENT' ? 'var(--color-brand-glow)' : 'var(--bg-surface)', 
                  color: a.actor === 'POLICY_ENGINE' ? '#fbbf24' : 
                         a.actor === 'RECOVERY_AGENT' ? '#60a5fa' : 'var(--text-secondary)',
                  padding: '8px', 
                  borderRadius: '8px' 
                }}>
                  {a.actor === 'POLICY_ENGINE' ? <Shield size={18} /> : 
                   a.actor === 'RECOVERY_AGENT' ? <Zap size={18} /> : 
                   a.actor === 'MERCHANT' ? <User size={18} /> : <Server size={18} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{a.actor}</span>
                      <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>{a.eventType}</span>
                      {a.recoveryCaseId && (
                        <span className="mono" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>({a.recoveryCaseId})</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(a.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                    {a.explanation}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
