# 🚀 RecoverAI — Autonomous Revenue Recovery Agent

RecoverAI is an intelligent, autonomous dunning and revenue recovery system designed to eliminate involuntary SaaS subscription and invoice churn, recover failed transactions via Razorpay, and orchestrate omnichannel recovery workflows (WhatsApp 1-click checkout, Smart Retries, Dynamic Payment Links).

---

## ⚡ Live Production Webhook Integration

RecoverAI connects directly with Razorpay's Webhook infrastructure to intercept failed payments, auto-diagnose root causes, and trigger immediate autonomous recovery.

- **Production Webhook Endpoint**: `https://recoverai-backend.onrender.com/api/webhooks/razorpay`
- **Razorpay Webhooks Dashboard**: [Configure Webhook](https://dashboard.razorpay.com/app/webhooks/TVHgGAk8CcN6HN)
- **Subscribed Events**:
  - `payment.failed` — Triggers automated failure diagnosis & dynamic recovery link generation
  - `payment.captured` / `payment.authorized` — Confirms successful recovery and reconciles case
  - `subscription.halted` — Escalates critical recurring mandate failures
  - `invoice.payment_failed` — Intercepts invoice-level payment issues
  - `invoice.paid` — Automatically marks recovery cases as `RECOVERED`

### 🔒 Cryptographic Webhook Security
Incoming webhooks are verified using HMAC-SHA256 signature matching against the `x-razorpay-signature` header:
$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{Raw Request Body}, \text{RAZORPAY\_WEBHOOK\_SECRET})$$

---

## ✨ Features

- **Autonomous Dunning Engine**: Smart retry schedules, intelligent payment links, and dynamic recovery sequences.
- **Multi-Channel Outreaches**: Automated multichannel escalation (WhatsApp, Email, SMS) with single-click UPI/Card checkout URLs.
- **Razorpay Integration**: Native payment link creation, webhook listener, and subscription reconciliation.
- **Fintech Policy Guardrails**:
  - **Paise Precision**: All monetary calculations done in Integer Paise (`1 INR = 100 paise`).
  - **₹10,000 Cap**: Max autonomous recovery limit per action before escalating to Human-in-the-Loop.
  - **Confidence Threshold**: Any AI decision with $<70\%$ confidence automatically routes to merchant review.
  - **Max 3 Retries**: Strict hard limit to prevent bank score penalties.
- **Real-Time Recovery Dashboard**: Visual analytics tracking recovery rate, recovered revenue, active dunning cases, and customer interactions.
- **Interactive Demo Studio**: 1-click failure scenario simulator for testing and hackathon judging.
- **Auditing & Event Logging**: Immutable cryptographic audit trail of all webhook triggers, AI diagnoses, and recovery actions.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js (ES Modules), Express.js, Razorpay SDK, In-Memory & JSON persistence.
- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS with responsive glassmorphism design.
- **Deployment**: Hosted on Render with automated CI/CD.

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & policy limits
│   │   ├── models/          # Domain models (RecoveryCase, PaymentEvent, etc.)
│   │   ├── repositories/    # Data persistence layer & metrics
│   │   ├── routes/          # API & Webhook routes (webhooks, dashboard, demo, cases)
│   │   ├── services/        # AI Agent Strategy & Razorpay Services
│   │   ├── utils/           # Logger & dataset generator
│   │   ├── app.js           # Express app setup & raw body capture
│   │   └── server.js        # Server entrypoint
│   ├── tests/               # Backend test suites (100% passing)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Dashboard, Cases, Audit, Evaluation, Demo, Architecture PDF
│   │   ├── services/        # Centralized API client
│   │   ├── App.jsx          # Main navigation & views
│   │   └── index.css        # Design tokens & @media print styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/
│   └── ARCHITECTURE_AND_INTERVIEW_GUIDE.md # 360° Technical & Interview dossier
├── data/synthetic/          # 500+ realistic transaction test datasets
├── .env.example             # Documented environment variables template
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Environment Setup
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Configure your environment variables:
```env
PORT=5001
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend dashboard will be available at `http://localhost:5173` and the backend API at `http://localhost:5001`.

---

## 📄 License
MIT License.
