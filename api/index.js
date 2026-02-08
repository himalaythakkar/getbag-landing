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
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME || 'Products';
const SUBS_TABLE = process.env.SUBS_TABLE_NAME || 'Subscription Plans';
const ORDERS_TABLE = process.env.ORDERS_TABLE_NAME || 'Orders';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// --- Helper: Airtable API ---
const airtableRequest = async (method, table, data = null, recordId = '') => {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}${recordId ? '/' + recordId : ''}`;
    const headers = { Authorization: `Bearer ${AIRTABLE_PAT}`, 'Content-Type': 'application/json' };
    const config = { method, url, headers };
    if (data) config.data = { fields: data };
    const response = await axios(config);
    return response.data;
};

// --- API Logic ---

// 1. One-time Payment Flow
const createPaymentLink = async (req, res) => {
    const { companyName, productName, description, price } = req.body;
    if (!companyName || !productName || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Step A: Save to Airtable Products
        const record = await airtableRequest('POST', PRODUCTS_TABLE, {
            'Merchant Name': companyName,
            'Product Name': productName,
            'Description': description,
            'Price': parseFloat(price),
            'Status': 'Active'
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
            'Merchant Name': companyName,
            'Plan Title': productName,
            'Description': description,
            'Recurring Price': parseFloat(price),
            'Status': 'Active'
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
                productName: record.fields['Product Name'] || record.fields['Plan Title'],
                description: record.fields['Description'],
                price: record.fields['Price'] || record.fields['Recurring Price'],
                companyName: record.fields['Merchant Name'],
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
                companyName: r.fields['Merchant Name'],
                productName: r.fields['Product Name'],
                price: r.fields['Price'],
                url: r.fields['Checkout URL'],
                createdAt: r.createdTime
            })),
            ...(sub.records || []).map(r => ({
                id: r.id,
                type: 'subscription',
                companyName: r.fields['Merchant Name'],
                productName: r.fields['Plan Title'],
                price: r.fields['Recurring Price'],
                url: r.fields['Checkout URL'],
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
