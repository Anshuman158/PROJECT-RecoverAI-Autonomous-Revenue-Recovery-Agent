import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Sliders, 
  PlayCircle, 
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { api } from './services/api';
import ArchitecturePdfSection from './components/ArchitecturePdfSection';

export default function App() {
  const [activeTab, setActiveTab] = useState('architecture');
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="brand-text">
            <h1>RecoverAI</h1>
            <span>Revenue Recovery Agent</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'cases' ? 'active' : ''}`}
                onClick={() => setActiveTab('cases')}
              >
                <Activity size={18} />
                <span>Recovery Cases</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <FileText size={18} />
                <span>Audit Trail</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'evaluation' ? 'active' : ''}`}
                onClick={() => setActiveTab('evaluation')}
              >
                <BarChart3 size={18} />
                <span>Evaluation</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'demo' ? 'active' : ''}`}
                onClick={() => setActiveTab('demo')}
              >
                <PlayCircle size={18} />
                <span>Demo Studio</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
                style={{ position: 'relative' }}
              >
                <BookOpen size={18} color="#60a5fa" />
                <span style={{ fontWeight: '700', color: activeTab === 'architecture' ? '#fff' : '#93c5fd' }}>Architecture & PDF</span>
                <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '1px 6px', marginLeft: 'auto' }}>PDF</span>
              </button>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px 0 0 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Server size={14} />
            <span>Backend:</span>
            {health?.status === 'HEALTHY' ? (
              <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>ONLINE</span>
            ) : (
              <span className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>OFFLINE</span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'capitalize' }}>{activeTab}</h2>
            <span className="badge badge-neutral">Razorpay Test Mode</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={fetchHealth}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {activeTab === 'architecture' ? (
            <ArchitecturePdfSection />
          ) : (
            <>
              {/* Phase 1 Verification Card */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-title">
                  <span>System Health & Core Guardrails Status</span>
                  {health?.status === 'HEALTHY' ? (
                    <span className="badge badge-success">Operational</span>
                  ) : (
                    <span className="badge badge-warning">Connecting</span>
                  )}
                </div>

                {error ? (
                  <div style={{ padding: '16px', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', color: '#fca5a5' }}>
                    <AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                    Backend Connection Error: {error}
                  </div>
                ) : (
                  <div className="grid-cards" style={{ marginTop: '16px', marginBottom: 0 }}>
                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Auto Recovery Cap</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                        ₹{health?.policyLimits?.maxAutonomousRecoveryAmountINR?.toLocaleString() || '10,000'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {health?.policyLimits?.maxAutonomousRecoveryAmountPaise || 1000000} paise (Paise Safe)
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Retry Attempts</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                        {health?.policyLimits?.maxRetryAttempts || 3} Attempts
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Hard limit per recovery case
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min AI Confidence</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                        {((health?.policyLimits?.minAiConfidence || 0.7) * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Below threshold forces escalation
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Active Tab: <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{activeTab}</span>. Select <strong>Architecture & PDF</strong> in the sidebar to review the full architecture breakdown and interview Q&A.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
