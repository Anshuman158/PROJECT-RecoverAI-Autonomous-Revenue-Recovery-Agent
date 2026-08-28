import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../../data/synthetic');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seedable pseudo-random generator for deterministic dataset generation
let seed = 42;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function choice(arr) {
  return arr[Math.floor(seededRandom() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Aditi', 'Pari', 'Avani', 'Rhea', 'Sneha', 'Pooja', 'Tanvi'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Gupta', 'Kumar', 'Singh', 'Nair', 'Iyer', 'Mehta', 'Kashyap', 'Chopra', 'Malhotra', 'Bhatia', 'Joshi', 'Deshmukh'];
const TIERS = ['STANDARD', 'VIP', 'ENTERPRISE'];

const PAYMENT_AMOUNTS_PAISE = [
  49900,    // ₹499
  99900,    // ₹999
  149900,   // ₹1,499
  249900,   // ₹2,499
  499900,   // ₹4,999
  899900,   // ₹8,999
  1499900,  // ₹14,999 (High value - above autonomous cap)
  2999900   // ₹29,999 (High value - above autonomous cap)
];

const ERROR_CODES_REASONS = [
  { code: 'BAD_REQUEST_ERROR', desc: 'Payment was declined by customer bank due to temporary network spike', recoverable: true, type: 'NETWORK_SPIKE' },
  { code: 'GATEWAY_TIMEOUT', desc: 'Issuer bank server timed out during 3D secure validation', recoverable: true, type: 'TIMEOUT' },
  { code: 'INSUFFICIENT_FUNDS', desc: 'Customer account had insufficient balance at the time of charge', recoverable: true, type: 'BALANCE_LOW' },
  { code: 'CARD_EXPIRED', desc: 'Customer card expiry date has passed', recoverable: false, type: 'EXPIRED_INSTRUMENT' },
  { code: 'SUSPECTED_FRAUD', desc: 'Card issuer blocked transaction due to risk velocity trigger', recoverable: false, type: 'FRAUD_BLOCK' },
  { code: 'AUTHENTICATION_FAILED', desc: 'Customer entered wrong OTP or closed 3DS window', recoverable: true, type: 'USER_DROPOFF' }
];

export function generateSyntheticDataset() {
  console.log('Generating synthetic evaluation dataset (5,000+ events)...');

  // 1. Generate Customers (800)
  const customers = [];
  for (let i = 1; i <= 800; i++) {
    const custId = `cust_${String(i).padStart(4, '0')}`;
    const name = `${choice(FIRST_NAMES)} ${choice(LAST_NAMES)}`;
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}${randomInt(10, 99)}@example.com`;
    const phone = `+9198${randomInt(10000000, 99999999)}`;
    const tier = choice(TIERS);
    const pastCompletedOrders = tier === 'VIP' ? randomInt(5, 20) : tier === 'ENTERPRISE' ? randomInt(15, 50) : randomInt(0, 4);
    const ltvPaise = pastCompletedOrders * choice(PAYMENT_AMOUNTS_PAISE);

    customers.push({
      id: custId,
      name,
      email,
      phone,
      tier,
      pastCompletedOrders,
      ltvPaise,
      createdAt: new Date(Date.now() - randomInt(30, 365) * 86400000).toISOString()
    });
  }

  // 2. Generate Payments (2,500 events)
  const payments = [];
  for (let i = 1; i <= 2500; i++) {
    const customer = choice(customers);
    const amount = choice(PAYMENT_AMOUNTS_PAISE);
    const errorInfo = choice(ERROR_CODES_REASONS);
    const isSuccess = seededRandom() > 0.65; // 35% failures to analyze recovery
    const status = isSuccess ? 'captured' : 'failed';
    const daysAgo = randomInt(0, 60);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - randomInt(0, 86400000)).toISOString();

    payments.push({
      id: `evt_pay_${String(i).padStart(5, '0')}`,
      razorpayPaymentId: `pay_test_${randomInt(100000000, 999999999)}`,
      orderId: `order_test_${randomInt(100000, 999999)}`,
      customerId: customer.id,
      amount,
      currency: 'INR',
      status,
      errorCode: isSuccess ? null : errorInfo.code,
      errorDescription: isSuccess ? null : errorInfo.desc,
      failureType: isSuccess ? null : errorInfo.type,
      recoverableGroundTruth: isSuccess ? false : errorInfo.recoverable,
      createdAt,
      source: 'RAZORPAY_WEBHOOK'
    });
  }

  // 3. Generate Checkouts / Abandonments (1,500 events)
  const checkouts = [];
  for (let i = 1; i <= 1500; i++) {
    const customer = choice(customers);
    const amount = choice(PAYMENT_AMOUNTS_PAISE);
    const isHighIntent = customer.pastCompletedOrders > 1 || amount >= 249900;
    const daysAgo = randomInt(0, 30);
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

    checkouts.push({
      id: `chk_${String(i).padStart(5, '0')}`,
      customerId: customer.id,
      amount,
      currency: 'INR',
      status: 'abandoned',
      cartItemsCount: randomInt(1, 6),
      minutesElapsed: randomInt(15, 240),
      isHighIntentGroundTruth: isHighIntent,
      createdAt,
      source: 'CHECKOUT_SYSTEM'
    });
  }

  // 4. Generate Subscriptions (1,000 events)
  const subscriptions = [];
  for (let i = 1; i <= 1000; i++) {
    const customer = choice(customers);
    const planAmount = choice([49900, 99900, 199900, 499900]);
    const retryAttemptCount = randomInt(1, 4);
    const errorInfo = choice(ERROR_CODES_REASONS);
    const daysAgo = randomInt(0, 45);
    const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString();

    subscriptions.push({
      id: `sub_${String(i).padStart(5, '0')}`,
      subscriptionId: `sub_rzp_${randomInt(100000, 999999)}`,
      customerId: customer.id,
      amount: planAmount,
      currency: 'INR',
      status: 'subscription_failed',
      billingCycle: 'MONTHLY',
      retryAttemptCount,
      errorCode: errorInfo.code,
      errorDescription: errorInfo.desc,
      createdAt,
      source: 'SUBSCRIPTION_ENGINE'
    });
  }

  // Write datasets to disk
  fs.writeFileSync(path.join(DATA_DIR, 'customers.json'), JSON.stringify(customers, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'payments.json'), JSON.stringify(payments, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'checkouts.json'), JSON.stringify(checkouts, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'subscriptions.json'), JSON.stringify(subscriptions, null, 2));

  console.log(`Generated:
  - ${customers.length} Customers
  - ${payments.length} Payments
  - ${checkouts.length} Checkouts
  - ${subscriptions.length} Subscriptions
  Total: ${payments.length + checkouts.length + subscriptions.length} Revenue-loss & evaluation events.`);

  return { customers, payments, checkouts, subscriptions };
}

// Allow direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSyntheticDataset();
}
