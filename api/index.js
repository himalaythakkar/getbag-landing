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

// --- ROUTES ---

app.post(['/api/create-payment-link', '/create-payment-link'], createPaymentLink);
app.get(['/api/products', '/products'], getProducts);
app.delete(['/api/products/:id', '/products/:id'], deleteProduct);

// Webhook placeholder
app.post(['/api/webhook/nowpayments', '/webhook/nowpayments'], (req, res) => {
    res.sendStatus(200);
});

module.exports = app;
