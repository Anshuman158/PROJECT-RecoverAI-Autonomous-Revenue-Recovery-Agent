import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  Mail, 
  RefreshCw,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardView({ onSelectCase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = data?.metrics || {
    totalRiskINR: 0,
    totalRecoveredINR: 0,
    recoveryRate: 0,
    totalCases: 0,
    recoveredCases: 0,
    failedCases: 0,
    blockedCases: 0
  };

  return (
    <div>
      {/* Top Metrics Cards */}
      <div className="grid-cards" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recovered Revenue</span>
            <div style={{ background: 'var(--color-success-bg)', color: '#34d399', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            ₹{metrics.totalRecoveredINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            <span>Autonomous ARR retained</span>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02))', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recovery Rate</span>
            <div style={{ background: 'var(--color-brand-glow)', color: '#60a5fa', padding: '6px', borderRadius: '8px' }}>
              <Zap size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            {metrics.recoveryRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {metrics.recoveredCases} of {metrics.totalCases} cases recovered
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>At-Risk Revenue</span>
            <div style={{ background: 'var(--color-danger-bg)', color: '#f87171', padding: '6px', borderRadius: '8px' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            ₹{metrics.totalRiskINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f87171', marginTop: '6px' }}>
            Total failed transactions intercepted
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guardrails Triggered</span>
            <div style={{ background: 'var(--color-warning-bg)', color: '#fbbf24', padding: '6px', borderRadius: '8px' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px' }}>
            {metrics.blockedCases}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '6px' }}>
            Escalated to Human-in-the-Loop
          </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title">Recovery Channel Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="#34d399" />
                <span style={{ fontSize: '0.88rem' }}>WhatsApp (Single-Click UPI Link)</span>
              </div>
              <span className="badge badge-success">{data?.channelBreakdown?.WHATSAPP || 0} Sent</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#60a5fa" />
                <span style={{ fontSize: '0.88rem' }}>Silent Retry (Bank Downtime Window)</span>
              </div>
              <span className="badge badge-neutral">{data?.channelBreakdown?.SILENT_RETRY || 0} Scheduled</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#fbbf24" />
                <span style={{ fontSize: '0.88rem' }}>Email Checkout Invitation</span>
              </div>
              <span className="badge badge-warning">{data?.channelBreakdown?.EMAIL || 0} Sent</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="card-title">Problem Classification Split</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.88rem' }}>Failed Subscription Autopay</span>
              <span className="badge badge-neutral">{data?.casesByProblemType?.FAILED_SUBSCRIPTION || 0} Cases</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.88rem' }}>Failed One-Time Invoice Payment</span>
              <span className="badge badge-neutral">{data?.casesByProblemType?.FAILED_PAYMENT || 0} Cases</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.88rem' }}>Checkout Abandonment</span>
              <span className="badge badge-neutral">{data?.casesByProblemType?.CHECKOUT_ABANDONMENT || 0} Cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Intercepted Cases Table */}
      <div className="table-container">
        <div className="table-header">
          <div style={{ fontWeight: '700', fontSize: '1rem' }}>Recent Intercepted Payment Failures</div>
          <button className="btn btn-secondary" onClick={loadData} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Customer</th>
              <th>Amount (Paise/INR)</th>
              <th>Failure Code</th>
              <th>Status</th>
              <th>AI Decision</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentCases || []).length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No failure events intercepted yet. Trigger a simulated scenario in the Demo Studio or send a live Razorpay webhook.
                </td>
              </tr>
            ) : (
              data.recentCases.map((c) => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => onSelectCase && onSelectCase(c.id)}>
                  <td className="mono" style={{ color: 'var(--color-brand)' }}>{c.id}</td>
                  <td>{c.customerId}</td>
                  <td style={{ fontWeight: '700' }}>₹{(c.amountAtRisk / 100).toLocaleString()}</td>
                  <td><span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{c.reason}</span></td>
                  <td>
                    <span className={`badge badge-${c.status === 'RECOVERED' ? 'success' : c.status === 'BLOCKED' ? 'danger' : 'warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: c.policyDecision === 'APPROVED' ? '#34d399' : '#f87171' }}>
                      {c.policyDecision || 'EVALUATING'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
