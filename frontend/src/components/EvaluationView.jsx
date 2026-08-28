import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Play, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function EvaluationView() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runEvaluation = async () => {
    try {
      setLoading(true);
      const res = await api.runEvaluation();
      setResults(res);
    } catch (err) {
      alert(`Evaluation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadLatestResults = async () => {
    try {
      const res = await api.getEvaluationResults();
      if (res && res.evaluatedCases) {
        setResults(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLatestResults();
  }, []);

  return (
    <div>
      {/* Benchmark Header Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#34d399" />
              Empirical Evaluation & Benchmark Engine
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Benchmark the RecoverAI Autonomous Engine against traditional static dunning on 100+ failed payment samples from the synthetic dataset.
            </p>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={runEvaluation} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={16} />
            <span>{loading ? 'Running Benchmark...' : 'Run Benchmark'}</span>
          </button>
        </div>
      </div>

      {results ? (
        <div>
          {/* Comparison Cards */}
          <div className="grid-cards" style={{ marginBottom: '24px' }}>
            <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Evaluated Dataset Sample</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '6px' }}>
                {results.evaluatedCases} Cases
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total at risk: <strong>₹{results.totalRiskINR?.toLocaleString()}</strong>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Traditional Static Dunning</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginTop: '6px' }}>
                ₹{results.baselineRecoveredINR?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Standard 18% recovery baseline
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase' }}>RecoverAI Autonomous Engine</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34d399', marginTop: '6px' }}>
                ₹{results.aiRecoveredINR?.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowUpRight size={14} />
                <span><strong>+{results.liftPercent}% Revenue Lift</strong></span>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Autonomous Policy Guardrails</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24', marginTop: '6px' }}>
                {results.guardrailBlocked} Escalated
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {results.autoApproved} approved autonomously
              </div>
            </div>
          </div>

          {/* Breakdown Chart / Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="card-title">Channel Selection Split</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {Object.entries(results.channelCounts || {}).map(([chan, count]) => (
                  <div key={chan} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem' }}>{chan}</span>
                    <span className="badge badge-neutral">{count} Actions</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <div className="card-title">Failure Diagnosis Classification</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {Object.entries(results.categoryCounts || {}).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.85rem' }}>{cat}</span>
                    <span className="badge badge-neutral">{count} Cases</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-surface)' }}>
          <BarChart3 size={36} color="var(--color-brand)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>No Benchmark Run Yet</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '460px', margin: '8px auto 20px auto' }}>
            Click the button below to evaluate the autonomous agent against 100+ failed payment samples from the synthetic dataset.
          </p>
          <button className="btn btn-primary" onClick={runEvaluation} disabled={loading}>
            <Play size={16} />
            <span>Run Benchmark Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
