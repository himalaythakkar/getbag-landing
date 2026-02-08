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
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

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
            'Product Name': productName,
            'Product Price': parseFloat(price)
        });

        const checkout_url = `${req.headers.origin || ''}/checkout/${record.id}`;

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
            'Description': description,
            'Recurring Price': parseFloat(price)
        });

        const checkout_url = `${req.headers.origin || ''}/checkout/${record.id}?type=sub`;

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
                price: record.fields['Product Price'] || record.fields['Recurring Price'] || 0,
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
    const isSub = type === 'sub';
    const table = isSub ? SUBS_TABLE : PRODUCTS_TABLE;

    if (!NOWPAYMENTS_API_KEY) {
        console.error('NOWPAYMENTS_API_KEY is not defined');
        return res.status(500).json({ error: 'Payment gateway not configured' });
    }

    try {
        // 1. Get Product Details from Airtable to get the price
        const productRecord = await airtableRequest('GET', table, null, productId);
        const productName = productRecord.fields['Product Name'] || productRecord.fields['Plan Title'];
        const price = productRecord.fields['Product Price'] || productRecord.fields['Recurring Price'] || 0;

        if (!price || price <= 0) {
            throw new Error('Invalid product price');
        }

        // 2. Create NOWPayments Invoice
        const nowPaymentsHeader = {
            'x-api-key': NOWPAYMENTS_API_KEY,
            'Content-Type': 'application/json'
        };

        const invoiceData = {
            price_amount: price,
            price_currency: 'usd',
            order_id: `${productId.substring(0, 8)}-${Date.now()}`,
            order_description: `${productName} - Customer: ${name}`,
            success_url: `${req.headers.origin || ''}/dashboard`,
            cancel_url: `${req.headers.origin || ''}/checkout/${productId}${isSub ? '?type=sub' : ''}`
        };

        console.log('[NOWPayments] Creating invoice for:', invoiceData.order_description);

        const npResponse = await axios.post('https://api.nowpayments.io/v1/invoice', invoiceData, {
            headers: nowPaymentsHeader
        });

        // 3. Return the invoice URL to the frontend
        res.json({ invoice_url: npResponse.data.invoice_url });

    } catch (error) {
        const errorDetail = error.response ? error.response.data : error.message;
        console.error('Checkout Error:', errorDetail);
        res.status(500).json({
            error: 'Failed to process checkout',
            details: typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail
        });
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
                price: r.fields['Product Price'] || 0,
                url: r.fields['Checkout URL'] || '',
                createdAt: r.createdTime
            })),
            ...(sub.records || []).map(r => ({
                id: r.id,
                type: 'subscription',
                companyName: r.fields['Company Name'] || 'N/A',
                productName: r.fields['Plan Title'] || 'N/A',
                price: r.fields['Recurring Price'] || 0,
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
