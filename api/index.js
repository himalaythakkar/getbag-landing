const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const IPN_SECRET = process.env.IPN_SECRET;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

// Helper to pack metadata
const packMetadata = (companyName, productName, price) => {
    return `${companyName}|${productName}|${price}`;
};

// 2. 'Payment Link' Flow - mapped to /api/create-payment-link
app.post('/api/create-payment-link', async (req, res) => {
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
                // Note: You'll need to update this URL manually in production to your Vercel URL
                ipn_callback_url: req.headers.host ? `https://${req.headers.host}/api/webhook/nowpayments` : undefined
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

// 3. 'Subscriptions' Flow - mapped to /api/create-subscription
app.post('/api/create-subscription', async (req, res) => {
    const { companyName, productName, price, email } = req.body;

    if (!companyName || !productName || !price || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const packedMetadata = packMetadata(companyName, productName, price);

    try {
        // Step A: Create Plan
        const planResponse = await axios.post(
            `${NOWPAYMENTS_API_URL}/subscriptions/plans`,
            {
                title: productName,
                interval_day: 30,
                amount: price,
                currency: 'usd'
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const planId = planResponse.data.id;

        // Step B: Create Subscription
        const subResponse = await axios.post(
            `${NOWPAYMENTS_API_URL}/subscriptions`,
            {
                subscription_plan_id: planId,
                email: email,
                order_id: packedMetadata
            },
            {
                headers: {
                    'x-api-key': NOWPAYMENTS_API_KEY,
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

// 4. Webhook - mapped to /api/webhook/nowpayments
app.post('/api/webhook/nowpayments', (req, res) => {
    const { payment_status, order_id } = req.body;

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
            }
        }
    }

    res.sendStatus(200);
});

module.exports = app;
