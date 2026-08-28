# 🚀 RecoverAI — Autonomous Revenue Recovery Agent

RecoverAI is an intelligent, autonomous dunning and revenue recovery system designed to reduce churn, recover failed subscription and invoice payments, and orchestrate omnichannel recovery workflows (Email, SMS, WhatsApp, Dynamic Checkout Links).

---

## ✨ Features

- **Autonomous Dunning Engine**: Smart retry schedules, intelligent payment links, and dynamic recovery sequences.
- **Multi-Channel Outreaches**: Automated multichannel escalation (Email, SMS, WhatsApp) with customizable escalation tiers.
- **Payment Gateway Integration**: Built-in integration with Razorpay and webhooks for real-time payment reconciliation.
- **Real-Time Recovery Dashboard**: Visual analytics tracking recovery rate, recovered revenue, active dunning cases, and customer interactions.
- **Auditing & Event Logging**: Complete audit trail of customer communication, webhook triggers, and payment status transitions.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js (ES Modules), Express.js, Razorpay SDK, JSON/File-based or DB persistence.
- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS with modern responsive design.
- **Automation & Webhooks**: Real-time webhook listeners for invoice payment events and automated retry workers.

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & API configurations
│   │   ├── models/          # Data models (RecoveryCase, etc.)
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express route handlers
│   │   ├── utils/           # Helper utilities
│   │   ├── app.js           # Express app definition
│   │   └── server.js        # Server entrypoint
│   ├── tests/               # Backend test suites
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components & views
│   │   ├── App.jsx          # Main application component
│   │   └── index.css        # Global design system & styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/                    # Seed and persistence storage
├── .env.example             # Environment template
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
PORT=5000
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
WEBHOOK_SECRET=your_webhook_secret
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

The frontend dashboard will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

---

## 📄 License
MIT License.
