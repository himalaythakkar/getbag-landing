const express = require('express');
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

// --- MOCK DATA STORE (Local to this instance) ---
let mockProducts = [
    {
        id: 'mock-1',
        type: 'payment_link',
        companyName: 'Acme Corp',
        productName: 'Premium Subscription',
        price: '99',
        currency: 'usd',
        url: 'https://example.com/pay/mock-1',
        status: 'finished',
        createdAt: new Date().toISOString()
    },
    {
        id: 'mock-2',
        type: 'payment_link',
        companyName: 'Global Tech',
        productName: 'Digital Content Pack',
        price: '25',
        currency: 'usd',
        url: 'https://example.com/pay/mock-2',
        status: 'waiting',
        createdAt: new Date().toISOString()
    }
];

// --- API Logic (Mocked for Hackathon) ---

const createPaymentLink = async (req, res) => {
    const { companyName, productName, price } = req.body;
    if (!companyName || !productName || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLink = {
        id: `mock-${Date.now()}`,
        type: 'payment_link',
        companyName,
        productName,
        price,
        currency: 'usd',
        url: `https://example.com/pay/${Date.now()}`,
        status: 'waiting',
        createdAt: new Date().toISOString()
    };

    // Add to our mock list for the demo session
    mockProducts.unshift(newLink);

    console.log('Mock Payment Link Created:', newLink);
    res.json({ invoice_url: newLink.url, message: 'Mock link created successfully' });
};

const getProducts = async (req, res) => {
    console.log('Fetching mock products...');
    res.json({ products: mockProducts });
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    console.log('Mock Delete Product:', id);
    mockProducts = mockProducts.filter(p => p.id !== id);
    res.json({ message: 'Mock product deleted' });
};

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Products';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

const getProductById = async (req, res) => {
    const { id } = req.params;

    // If Airtable keys are missing, return mock for dev
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
        const mock = mockProducts.find(p => p.id === id) || mockProducts[0];
        return res.json({ product: { ...mock, companyName: 'Arthek LLP (Mock)', description: 'Mock description from Airtable fallback' } });
    }

    try {
        const response = await axios.get(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${id}`,
            { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }
        );

        const record = response.data;
        res.json({
            product: {
                id: record.id,
                productName: record.fields['Product Name'],
                description: record.fields['Description'],
                price: record.fields['Price'],
                companyName: record.fields['Merchant Name'] || 'Bag Merchant',
                merchantLogo: record.fields['Logo URL']
            }
        });
    } catch (error) {
        console.error('Airtable Error:', error.response ? error.response.data : error.message);
        res.status(404).json({ error: 'Product not found' });
    }
};

const handleCheckoutSubmit = async (req, res) => {
    const { productId, name, email } = req.body;

    if (!MAKE_WEBHOOK_URL) {
        console.log('Mock Submission (No Make.com URL):', { productId, name, email });
        return res.json({ invoice_url: 'https://example.com/mock-payment' });
    }

    try {
        const response = await axios.post(MAKE_WEBHOOK_URL, {
            productId,
            customerName: name,
            customerEmail: email,
            timestamp: new Date().toISOString()
        });

        // Make.com should return the NOWPayments invoice_url
        res.json(response.data);
    } catch (error) {
        console.error('Make.com Error:', error.message);
        res.status(500).json({ error: 'Failed to process checkout' });
    }
};

// --- ROUTES ---

app.get(['/api/products/:id', '/products/:id'], getProductById);
app.post(['/api/checkout/submit', '/checkout/submit'], handleCheckoutSubmit);
app.post(['/api/create-payment-link', '/create-payment-link'], createPaymentLink);
app.get(['/api/products', '/products'], getProducts);
app.delete(['/api/products/:id', '/products/:id'], deleteProduct);

// Webhook placeholder
app.post(['/api/webhook/nowpayments', '/webhook/nowpayments'], (req, res) => {
    res.sendStatus(200);
});

module.exports = app;
