const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'your_api_key_here';
const IPN_SECRET = process.env.IPN_SECRET || 'your_ipn_secret_here';
const NOWPAYMENTS_EMAIL = process.env.NOWPAYMENTS_EMAIL;
const NOWPAYMENTS_PASSWORD = process.env.NOWPAYMENTS_PASSWORD;
const NOWPAYMENTS_API_URL = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';

// Helper to get JWT Token
let cachedToken = null;
let tokenExpiry = 0;

const getAuthToken = async () => {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) return cachedToken;

    if (!NOWPAYMENTS_EMAIL || !NOWPAYMENTS_PASSWORD) {
        throw new Error('NOWPAYMENTS_EMAIL or NOWPAYMENTS_PASSWORD is missing from environment. Run "vercel env pull .env.local" to sync secrets.');
    }

    try {
        const response = await axios.post(`${NOWPAYMENTS_API_URL}/auth`, {
            email: NOWPAYMENTS_EMAIL,
            password: NOWPAYMENTS_PASSWORD
        });
        cachedToken = response.data.token;
        tokenExpiry = now + (4 * 60 * 1000);
        return cachedToken;
    } catch (error) {
        console.error('Auth failed:', error.response ? error.response.data : error.message);
        throw new Error('Authentication with NOWPayments failed');
    }
};

// Helper to pack metadata
const packMetadata = (companyName, productName, price) => {
    return `${companyName}|${productName}|${price}`;
};

// 2. 'Payment Link' Flow
app.post('/create-payment-link', async (req, res) => {
    const { companyName, productName, price } = req.body;

    if (!companyName || !productName || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const order_id = packMetadata(companyName, productName, price);

    try {
        const response = await axios.post(
            `${NOWPAYMENTS_API_URL}/invoice`,
            {
                price_amount: price,
                price_currency: 'usd',
                order_id: order_id,
                order_description: `Payment for ${productName} by ${companyName}`,
                ipn_callback_url: 'http://localhost:3001/webhook/nowpayments' // Ngrok/public URL needed in prod
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ invoice_url: response.data.invoice_url });
    } catch (error) {
        console.error('Error creating payment link:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

// 3. 'Subscriptions' Flow
app.post('/create-subscription', async (req, res) => {
    const { companyName, productName, price, email } = req.body;

    if (!companyName || !productName || !price || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const packedMetadata = packMetadata(companyName, productName, price);

    try {
        const token = await getAuthToken();

        // Step A: Create Plan
        const planResponse = await axios.post(
            `${NOWPAYMENTS_API_URL}/subscriptions/plans`,
            {
                title: `${productName} (${companyName})`,
                interval_day: 30,
                amount: price,
                currency: 'usd',
                ipn_callback_url: req.headers.host ?
                    `http://${req.headers.host}/api/webhook/nowpayments?meta=${encodeURIComponent(packedMetadata)}` :
                    undefined
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const planId = planResponse.data.result.id;

        // Step B: Create Subscription (Removed order_id as it is not allowed)
        const subResponse = await axios.post(
            `${NOWPAYMENTS_API_URL}/subscriptions`,
            {
                subscription_plan_id: planId,
                email: email.trim()
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ message: 'Subscription created successfully', subscription_id: subResponse.data.id });
    } catch (error) {
        console.error('Error creating subscription:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// 4. 'Products' List
app.get('/api/products', async (req, res) => {
    try {
        const token = await getAuthToken();
        const [invoicesRes, plansRes] = await Promise.all([
            axios.get(`${NOWPAYMENTS_API_URL}/payment?limit=50`, { headers: { 'x-api-key': NOWPAYMENTS_API_KEY } }),
            axios.get(`${NOWPAYMENTS_API_URL}/subscriptions/plans`, {
                headers: { 'x-api-key': NOWPAYMENTS_API_KEY, 'Authorization': `Bearer ${token}` }
            })
        ]);

        const paymentLinks = (invoicesRes.data.data || []).map(inv => {
            const parts = (inv.order_id || '').split('|');
            return { id: inv.payment_id, type: 'payment_link', companyName: parts[0] || 'Unknown', productName: parts[1] || 'Product', price: inv.price_amount, url: inv.invoice_url, createdAt: inv.created_at };
        }).filter(p => p.companyName !== 'Unknown');

        const subscriptions = (plansRes.data.result || []).map(plan => {
            const titleMatch = plan.title.match(/(.*) \((.*)\)/);
            return { id: plan.id, type: 'subscription', companyName: titleMatch ? titleMatch[2] : 'Unknown', productName: titleMatch ? titleMatch[1] : plan.title, price: plan.amount, createdAt: plan.created_at };
        });

        res.json({ products: [...paymentLinks, ...subscriptions] });
    } catch (error) { res.status(500).json({ error: 'Failed to fetch' }); }
});

app.delete('/api/products/plan/:id', async (req, res) => {
    try {
        const token = await getAuthToken();
        await axios.delete(`${NOWPAYMENTS_API_URL}/subscriptions/plans/${req.params.id}`, {
            headers: { 'x-api-key': NOWPAYMENTS_API_KEY, 'Authorization': `Bearer ${token}` }
        });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// 4. Webhook (The 'Database' Replacer)
app.post('/api/webhook/nowpayments', (req, res) => {
    // Verification logic would go here using IPN_SECRET and HMAC
    // skipping strict verification for this zero-db prototype as requested,
    // but in prod effectively verify `sig` against `req.body` sorted.

    const { payment_status } = req.body;
    // Extract metadata from body (standard) or query (subscriptions)
    const order_id = req.body.order_id || req.query.meta;

    if (payment_status === 'finished' || payment_status === 'confirmed') {
        if (order_id) {
            const parts = order_id.split('|');
            if (parts.length === 3) {
                const [company, product, price] = parts;
                console.log('--- PAYMENT RECEIVED ---');
                console.log(`Company: ${company}`);
                console.log(`Product: ${product}`);
                console.log(`Price: $${price}`);
                console.log('------------------------');
            } else {
                console.log('Received payment with malformed metadata:', order_id);
            }
        }
    }

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`NOWPayments backend running on http://localhost:${port}`);
});
