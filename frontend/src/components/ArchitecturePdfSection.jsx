import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Clock, 
  DollarSign, 
  ChevronDown, 
  ChevronUp,
  FileCode,
  ArrowRight,
  Sparkles,
  GitBranch
} from 'lucide-react';

export default function ArchitecturePdfSection() {
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePrint = () => {
    window.print();
  };

  const interviewQuestions = [
    {
      category: 'Product & Business Impact',
      question: 'What makes RecoverAI fundamentally different from traditional dunning systems (Stripe Billing, Chargebee)?',
      answer: 'Traditional dunning systems execute rigid, fixed-schedule retries (e.g., retrying blindly on Day 1, Day 3, Day 7 via generic email). RecoverAI is an autonomous, context-aware agent that parses exact Razorpay failure codes, determines the optimal communication channel (WhatsApp vs. SMS vs. Email for the Indian market), dynamically crafts personalized payment links, and intelligently avoids spamming users during transient bank outages.'
    },
    {
      category: 'Product & Business Impact',
      question: 'How does RecoverAI provide direct business ROI to merchants using Razorpay?',
      answer: 'Involuntary churn accounts for 20-40% of all lost subscription revenue. By recovering even 15-25% of failed transactions through dynamic retries and instant WhatsApp checkout links, RecoverAI directly increases merchant Net MRR/ARR without requiring ad spend or customer re-acquisition costs.'
    },
    {
      category: 'System Design & Architecture',
      question: 'How does the system ensure mathematical precision and prevent currency rounding errors?',
      answer: 'RecoverAI enforces Integer-Paise Precision throughout all internal calculations, state models, and database stores (1 INR = 100 paise). Floating-point math is strictly forbidden in the core domain to eliminate IEEE-754 binary floating-point errors (e.g., 0.1 + 0.2 != 0.3).'
    },
    {
      category: 'System Design & Architecture',
      question: 'How do you handle webhook spikes, network timeouts, and duplicate webhook delivery?',
      answer: 'Webhooks are authenticated via HMAC-SHA256 signature verification and recorded with a unique event idempotency key. Duplicate events are acknowledged with 200 OK but safely skipped. In production, webhooks are acknowledged in <200ms and placed onto a decoupled async worker queue.'
    },
    {
      category: 'AI Reasoning & Safety',
      question: 'How do you prevent the AI Agent from hallucinating or taking rogue financial actions?',
      answer: 'RecoverAI utilizes a Constrained Autonomous Execution pattern with deterministic guardrail layers: 1) Hard max recovery cap (₹10,000 max per autonomous action), 2) Max 3 retry attempts limit, 3) Confidence scoring threshold (decisions with <70% confidence automatically route to Human-in-the-Loop review), and 4) Strict JSON schema validation for all agent outputs.'
    },
    {
      category: 'AI Reasoning & Safety',
      question: 'What happens when an action fails or the failure reason is non-recoverable?',
      answer: 'If a payment fails due to hard fraud or permanent account closure (HARD_DECLINE), the AI suppresses retries to preserve merchant reputation score and flags the case as CLOSED_FAILED or requests payment method replacement from the customer.'
    },
    {
      category: 'Razorpay & India Fintech Stack',
      question: 'How does RecoverAI integrate with the Razorpay ecosystem?',
      answer: 'RecoverAI listens to Razorpay Webhooks (payment.failed, payment.captured, subscription.halted, invoice.paid) and leverages the Razorpay Payment Links API to issue authenticated, dynamic single-click UPI & Card recovery checkout links with automatic expiration.'
    },
    {
      category: 'Razorpay & India Fintech Stack',
      question: 'How does RecoverAI handle RBI e-Mandate and 2FA authentication requirements?',
      answer: 'When a recurring card or UPI autopay transaction fails due to missing AFA/2FA or expired mandate, RecoverAI autonomously issues a secure Razorpay Checkout Link prompting the customer to re-authenticate with their bank securely, complying fully with RBI guidelines.'
    }
  ];

  return (
    <div className="printable-document">
      {/* Header Banner with Print Button */}
      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px', 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#60a5fa" />
            System Architecture & Hackathon/Interview Defense Dossier
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Comprehensive technical breakdown, architecture diagrams, and 360° interview defense guide.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}
          >
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Document Sheet */}
      <div className="pdf-sheet">
        {/* Cover / Header Section */}
        <header className="pdf-header" style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#3b82f6', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <ShieldCheck size={24} />
                </div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>RecoverAI</h1>
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
                Autonomous Revenue Recovery Agent for Razorpay & SaaS Subscription Ecosystems
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Razorpay AI Buildathon Dossier</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Version 1.0.0 • Production Ready</div>
            </div>
          </div>
        </header>

        {/* Section 1: Executive Summary */}
        <section style={{ marginBottom: '28px' }}>
          <h2 className="section-title">
            <Zap size={18} color="#3b82f6" />
            1. Executive Summary & Problem Solved
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '16px' }}>
              <h4 style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> The Multi-Billion Dollar Problem
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong>20% to 40% of SaaS churn is involuntary</strong>—caused by expired cards, temporary bank server downtimes, or insufficient balances. Traditional dunning tools use dumb, fixed-schedule emails that irritate users and fail to recover revenue.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '16px' }}>
              <h4 style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> The RecoverAI Solution
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                An autonomous agent that intercepts Razorpay payment failure webhooks in real-time, classifies failure types, executes smart retries, and delivers instant, 1-click personalized checkout links across WhatsApp, SMS, and Email with strict safety guardrails.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Technology Stack */}
        <section style={{ marginBottom: '28px' }}>
          <h2 className="section-title">
            <Layers size={18} color="#8b5cf6" />
            2. Technology Stack & Component Architecture
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase' }}>Frontend UI</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginTop: '4px' }}>React 18 + Vite</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Vanilla CSS design tokens, Lucide icons, glassmorphism dashboard, printable PDF stylesheets.
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase' }}>Backend Core</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginTop: '4px' }}>Node.js + Express</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ES Modules, async event handling, cryptographic HMAC-SHA256 signature verification.
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '700', textTransform: 'uppercase' }}>Payment Gateway</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginTop: '4px' }}>Razorpay SDK</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Webhooks, Payment Links API, Subscriptions & Invoices management, UPI Autopay reconciliation.
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '14px' }}>
              <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700', textTransform: 'uppercase' }}>AI & Guardrails</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', marginTop: '4px' }}>Constrained Agent</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Paise safety, ₹10k max autonomous cap, 3-attempt retry ceiling, confidence gating (&ge;70%).
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: End-to-End Visual Architecture Diagram */}
        <section style={{ marginBottom: '28px' }}>
          <h2 className="section-title">
            <GitBranch size={18} color="#10b981" />
            3. End-to-End System Data Flow & State Pipeline
          </h2>

          <div style={{ 
            background: 'var(--bg-surface-elevated)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px', 
            marginTop: '12px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div className="flow-step">
                <span className="step-num">1</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Failed Payment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Razorpay Webhook</div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />

              <div className="flow-step">
                <span className="step-num">2</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>HMAC Verification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Idempotency Check</div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />

              <div className="flow-step">
                <span className="step-num">3</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Failure Classification</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Transient vs Hard vs Balance</div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />

              <div className="flow-step">
                <span className="step-num">4</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Policy Guardrail Check</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cap: ₹10k | Conf &ge; 70%</div>
                </div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />

              <div className="flow-step">
                <span className="step-num">5</span>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Autonomous Outreach</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WhatsApp / Email Link</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Hard Guardrails & Financial Precision */}
        <section style={{ marginBottom: '28px' }}>
          <h2 className="section-title">
            <Lock size={18} color="#f59e0b" />
            4. Fintech Safety, Policies & Edge-Case Protection
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginTop: '12px' }}>
            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#60a5fa' }}>
                <DollarSign size={16} /> Integer-Paise Precision
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                Guarantees zero floating-point arithmetic errors. ₹499.50 is stored as <code>49950 paise</code> and validated across all payload boundaries.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#34d399' }}>
                <ShieldCheck size={16} /> Cap & Retry Thresholds
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                Autonomous recovery is capped at ₹10,000 with a strict maximum of 3 retries. Over-cap transactions automatically route to Human-in-the-Loop review.
              </p>
            </div>

            <div className="card" style={{ background: 'var(--bg-surface-elevated)', margin: 0, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem', color: '#f59e0b' }}>
                <Clock size={16} /> Webhook Idempotency
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '8px' }}>
                Unique transaction event keys prevent duplicate charges or spamming customers when Razorpay repeats webhook deliveries.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Comprehensive Interview & Judge Q&A */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              <HelpCircle size={18} color="#ec4899" />
              5. Comprehensive Hackathon Defense & Technical Interview Q&A
            </h2>
            <span className="badge badge-neutral no-print">{interviewQuestions.length} Questions Ready</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {interviewQuestions.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="card faq-card"
                  style={{ 
                    margin: 0, 
                    padding: '14px 18px', 
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleFaq(index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        Q{index + 1}: {item.question}
                      </span>
                    </div>
                    <div className="no-print" style={{ color: 'var(--text-muted)' }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Answer visible by default in print, or collapsible in interactive UI */}
                  <div className={`faq-answer ${isOpen ? 'open' : ''}`} style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      <strong style={{ color: '#60a5fa' }}>Answer: </strong>
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PDF Footer */}
        <footer style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>RecoverAI • Built for Razorpay AI Buildathon</div>
          <div>Confidential & Proprietary • Engineering Architecture Specification</div>
        </footer>
      </div>
    </div>
  );
}
