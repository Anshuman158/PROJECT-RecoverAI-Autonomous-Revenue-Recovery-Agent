import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

export default function RecoveryCasesView({ initialCaseId }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.getRecoveryCases(filterStatus ? { status: filterStatus } : {});
      setCases(res.cases || []);
      if (initialCaseId && !selectedCase) {
        handleSelectCase(initialCaseId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [filterStatus]);

  const handleSelectCase = async (id) => {
    try {
      const res = await api.getRecoveryCaseById(id);
      setSelectedCase(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      setActionLoading(true);
      await api.analyzeCase(id);
      await handleSelectCase(id);
      await loadCases();
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async (id) => {
    try {
      setActionLoading(true);
      await api.executeCase(id);
      await handleSelectCase(id);
      await loadCases();
    } catch (err) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              background: 'var(--bg-surface-elevated)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-subtle)', 
              padding: '8px 12px', 
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}
          >
            <option value="">All Case Statuses</option>
            <option value="DETECTED">DETECTED</option>
            <option value="DIAGNOSED">DIAGNOSED</option>
            <option value="EXECUTING">EXECUTING</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={loadCases}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Cases</span>
        </button>
      </div>

      {/* Cases Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount (INR)</th>
              <th>Failure Code</th>
              <th>Status</th>
              <th>Policy</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No recovery cases found. Trigger a scenario in Demo Studio or send Razorpay webhooks.
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id}>
                  <td className="mono" style={{ color: 'var(--color-brand)' }}>{c.id}</td>
                  <td>{c.customerId}</td>
                  <td><span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.problemType}</span></td>
                  <td style={{ fontWeight: '700' }}>₹{(c.amountAtRisk / 100).toLocaleString()}</td>
                  <td><span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{c.reason}</span></td>
                  <td>
                    <span className={`badge badge-${c.status === 'RECOVERED' ? 'success' : c.status === 'BLOCKED' ? 'danger' : 'warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: c.policyDecision === 'APPROVED' ? '#34d399' : '#f87171' }}>
                      {c.policyDecision || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleSelectCase(c.id)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'flex-end', 
          zIndex: 1000 
        }}>
          <div style={{ 
            width: '560px', 
            background: 'var(--bg-surface)', 
            height: '100%', 
            padding: '24px', 
            overflowY: 'auto',
            borderLeft: '1px solid var(--border-subtle)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Recovery Case: {selectedCase.case?.id}</h3>
                <span className="badge badge-neutral" style={{ marginTop: '4px' }}>Customer: {selectedCase.case?.customerId}</span>
              </div>
              <button 
                onClick={() => setSelectedCase(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Financial Context */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount At Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{((selectedCase.case?.amountAtRisk || 0) / 100).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Failure Reason: <strong>{selectedCase.case?.reason}</strong>
                </div>
              </div>

              {/* AI Diagnosis */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase' }}>AI Diagnosis & Strategy</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.4' }}>
                  {selectedCase.case?.diagnosis || 'No diagnosis generated yet. Click "Analyze with AI" below.'}
                </p>
                {selectedCase.case?.confidence && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    Confidence: <strong>{((selectedCase.case.confidence) * 100).toFixed(0)}%</strong> • Policy Decision: <span style={{ color: selectedCase.case.policyDecision === 'APPROVED' ? '#34d399' : '#f87171' }}>{selectedCase.case.policyDecision}</span>
                  </div>
                )}
              </div>

              {/* Actions & Execution */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleAnalyze(selectedCase.case?.id)}
                  disabled={actionLoading}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Zap size={14} />
                  <span>Analyze with AI</span>
                </button>

                <button 
                  className="btn btn-primary" 
                  onClick={() => handleExecute(selectedCase.case?.id)}
                  disabled={actionLoading}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Play size={14} />
                  <span>Execute Recovery</span>
                </button>
              </div>

              {/* Case Audit Timeline */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '10px' }}>Case Audit Events</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedCase.audits || []).map((a) => (
                    <div key={a.id} style={{ padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        <span>{a.actor} • {a.eventType}</span>
                        <span>{new Date(a.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{a.explanation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
