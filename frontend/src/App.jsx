import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Activity, 
  FileText, 
  PlayCircle, 
  BarChart3, 
  RefreshCw,
  Server,
  BookOpen
} from 'lucide-react';
import { api } from './services/api';
import DashboardView from './components/DashboardView';
import RecoveryCasesView from './components/RecoveryCasesView';
import AuditTrailView from './components/AuditTrailView';
import EvaluationView from './components/EvaluationView';
import DemoStudioView from './components/DemoStudioView';
import ArchitecturePdfSection from './components/ArchitecturePdfSection';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
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

  const handleSelectCaseFromDashboard = (caseId) => {
    setSelectedCaseId(caseId);
    setActiveTab('cases');
  };

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
                onClick={() => { setSelectedCaseId(null); setActiveTab('cases'); }}
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
                <span className="badge badge-neutral" style={{ fontSize: '0.6rem', padding: '1px 6px', marginLeft: 'auto' }}>Sim</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-link ${activeTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setActiveTab('architecture')}
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', textTransform: 'capitalize' }}>
              {activeTab === 'architecture' ? 'System Architecture & Defense Dossier' : 
               activeTab === 'cases' ? 'Recovery Cases' :
               activeTab === 'audit' ? 'Audit Trail' :
               activeTab === 'evaluation' ? 'Benchmark Evaluation' :
               activeTab === 'demo' ? 'Demo Studio' : 'Dashboard Overview'}
            </h2>
            <span className="badge badge-neutral">Razorpay Webhooks Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={fetchHealth}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          {activeTab === 'dashboard' && <DashboardView onSelectCase={handleSelectCaseFromDashboard} />}
          {activeTab === 'cases' && <RecoveryCasesView initialCaseId={selectedCaseId} />}
          {activeTab === 'audit' && <AuditTrailView />}
          {activeTab === 'evaluation' && <EvaluationView />}
          {activeTab === 'demo' && <DemoStudioView />}
          {activeTab === 'architecture' && <ArchitecturePdfSection />}
        </div>
      </main>
    </div>
  );
}
