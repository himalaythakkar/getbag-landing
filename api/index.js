const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Logger for debugging on Vercel
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
});

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.ORDERS_BASE_ID || process.env.SUBS_BASE_ID;
const PRODUCTS_TABLE = 'Orders';
const SUBS_TABLE = 'SubscriptionPlans';
const ORDERS_TABLE = 'Orders';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// Debugging environment variables arrival (without leaking full values)
console.log('--- Env Check ---');
console.log('BASE_ID exists:', !!AIRTABLE_BASE_ID, AIRTABLE_BASE_ID ? `(${AIRTABLE_BASE_ID.substring(0, 5)}...)` : 'MISSING');
console.log('PAT exists:', !!AIRTABLE_PAT, AIRTABLE_PAT ? `(${AIRTABLE_PAT.substring(0, 10)}...)` : 'MISSING');
console.log('PRODUCTS_TABLE:', PRODUCTS_TABLE);
console.log('-----------------');

// --- Helper: Airtable API ---
const airtableRequest = async (method, table, data = null, recordId = '') => {
    if (!AIRTABLE_BASE_ID) {
        console.error('[Airtable Error] AIRTABLE_BASE_ID is missing');
        throw new Error('AIRTABLE_BASE_ID is missing');
    }
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}${recordId ? '/' + recordId : ''}`;
    const headers = { Authorization: `Bearer ${AIRTABLE_PAT}`, 'Content-Type': 'application/json' };
    const config = { method, url, headers };
    if (data) config.data = { fields: data };

    console.log(`[Airtable] ${method} ${table} ${recordId ? '(ID: ' + recordId + ')' : ''}`);

    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : { message: error.message };
        console.error('[Airtable API Error Detail]:', JSON.stringify(errorData, null, 2));
        throw error;
    }
};

// --- API Logic ---

// 1. One-time Payment Flow
const createPaymentLink = async (req, res) => {
    const { companyName, productName, description, price } = req.body;
    if (!companyName || !productName || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Step A: Save to Airtable Orders table (using it for products)
        const record = await airtableRequest('POST', PRODUCTS_TABLE, {
            'Company Name': companyName,
            'Product Name': productName
        });

        const checkout_url = `${req.headers.origin || ''}/checkout/${record.id}`;

        // Update record with Checkout URL
        await airtableRequest('PATCH', PRODUCTS_TABLE, { 'Checkout URL': checkout_url }, record.id);

        res.json({ checkout_url, message: 'Payment link created' });
    } catch (error) {
        console.error('Airtable/NOWPayments Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
};

// 2. Subscription Flow
const createSubscriptionPlan = async (req, res) => {
    const { companyName, productName, description, price } = req.body;
    if (!companyName || !productName || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Step A: Save to Airtable SubscriptionPlans
        const record = await airtableRequest('POST', SUBS_TABLE, {
            'Company Name': companyName,
            'Plan Title': productName,
            'Description': description
        });

        const checkout_url = `${req.headers.origin || ''}/checkout/${record.id}?type=sub`;

        // Update record with Checkout URL
        await airtableRequest('PATCH', SUBS_TABLE, { 'Checkout URL': checkout_url }, record.id);

        res.json({ checkout_url, message: 'Subscription plan created' });
    } catch (error) {
        console.error('Airtable Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create subscription plan' });
    }
};

const getProductById = async (req, res) => {
    const { id } = req.params;
    const isSub = req.query.type === 'sub';
    const table = isSub ? SUBS_TABLE : PRODUCTS_TABLE;

    try {
        const record = await airtableRequest('GET', table, null, id);
        res.json({
            product: {
                id: record.id,
                productName: record.fields['Product Name'] || record.fields['Plan Title'] || 'Product',
                description: record.fields['Description'] || '',
                price: 0, // Price will be handled by Make.com
                companyName: record.fields['Company Name'] || 'Company',
                merchantLogo: record.fields['Logo URL'],
                type: isSub ? 'subscription' : 'one-time'
            }
        });
    } catch (error) {
        console.error('Airtable Error:', error.response ? error.response.data : error.message);
        res.status(404).json({ error: 'Product not found' });
    }
};

const handleCheckoutSubmit = async (req, res) => {
    const { productId, name, email, type } = req.body;

    if (!MAKE_WEBHOOK_URL) {
        console.error('MAKE_WEBHOOK_URL is not defined');
        return res.status(500).json({ error: 'Checkout automation not configured' });
    }

    try {
        // Send to Make.com which will:
        // 1. Save order to Airtable
        // 2. Create NOWPayments invoice/sub
        // 3. Return payment URL
        const response = await axios.post(MAKE_WEBHOOK_URL, {
            productId,
            customerName: name,
            customerEmail: email,
            paymentType: type === 'sub' ? 'Subscription' : 'One-time',
            timestamp: new Date().toISOString()
        });

        res.json(response.data);
    } catch (error) {
        console.error('Make.com Error:', error.message);
        res.status(500).json({ error: 'Failed to process checkout' });
    }
};

const getProductsList = async (req, res) => {
    try {
        const [oneTime, sub] = await Promise.all([
            airtableRequest('GET', PRODUCTS_TABLE),
            airtableRequest('GET', SUBS_TABLE)
        ]);

        const products = [
            ...(oneTime.records || []).map(r => ({
                id: r.id,
                type: 'payment_link',
                companyName: r.fields['Company Name'] || 'N/A',
                productName: r.fields['Product Name'] || 'N/A',
                price: 0,
                url: r.fields['Checkout URL'] || '',
                createdAt: r.createdTime
            })),
            ...(sub.records || []).map(r => ({
                id: r.id,
                type: 'subscription',
                companyName: r.fields['Company Name'] || 'N/A',
                productName: r.fields['Plan Title'] || 'N/A',
                price: 0,
                url: r.fields['Checkout URL'] || '',
                createdAt: r.createdTime
            }))
        ];

        res.json({ products: products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
    } catch (error) {
        console.error('Fetch error:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const isSub = req.query.type === 'sub';
    const table = isSub ? SUBS_TABLE : PRODUCTS_TABLE;

    try {
        await airtableRequest('DELETE', table, null, id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
};

// --- ROUTES ---

app.get(['/api/products/:id', '/products/:id'], getProductById);
app.post(['/api/checkout/submit', '/checkout/submit'], handleCheckoutSubmit);
app.post(['/api/create-payment-link', '/create-payment-link'], createPaymentLink);
app.post(['/api/subscriptions', '/subscriptions'], createSubscriptionPlan);
app.get(['/api/products', '/products'], getProductsList);
app.delete(['/api/products/:id', '/products/:id'], deleteProduct);

app.post(['/api/webhook/nowpayments', '/webhook/nowpayments'], (req, res) => {
    // Forward webhooks to Make.com as well if needed
    res.sendStatus(200);
});

module.exports = app;
