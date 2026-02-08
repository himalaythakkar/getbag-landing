import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const { productId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type'); // 'sub' for subscriptions

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/products/${productId}${type ? '?type=' + type : ''}`);
                setProduct(response.data.product);
            } catch (err) {
                setError('Product not found or error loading checkout.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // This calls our backend which proxies to Make.com
            const response = await axios.post('/api/checkout/submit', {
                productId,
                type,
                ...formData
            });

            if (response.data.invoice_url) {
                window.location.href = response.data.invoice_url;
            } else {
                alert('Success! Check your email for payment instructions.');
            }
        } catch (err) {
            alert('Checkout failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>Loading Checkout...</div>
        </div>
    );

    if (error || !product) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚠️</div>
                <div>{error || 'Product not found.'}</div>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#fff',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px 20px'
        }}>
            {/* Merchant Branding Section */}
            <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#111', borderRadius: '100px', border: '1px solid #222', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {product.companyName}
                    </h2>
                </div>
            </div>

            {/* Checkout Card */}
            <div style={{
                maxWidth: '480px',
                width: '100%',
                backgroundColor: '#111',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid #222',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.02em' }}>{product.productName}</h1>
                    <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
                    <div style={{ marginTop: '32px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>${product.price}</span>
                        <span style={{ fontSize: '1.1rem', color: '#444', fontWeight: '600' }}>USD {product.type === 'subscription' ? '/ MONTH' : ''}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Full Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #222',
                                backgroundColor: '#000', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                            onBlur={(e) => e.target.style.borderColor = '#222'}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', fontWeight: '600', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="john@example.com"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #222',
                                backgroundColor: '#000', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                            onBlur={(e) => e.target.style.borderColor = '#222'}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={submitting}
                        type="submit"
                        style={{
                            marginTop: '12px',
                            backgroundColor: '#fff',
                            color: '#000',
                            padding: '18px',
                            borderRadius: '14px',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'transform 0.2s, background-color 0.2s'
                        }}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        {submitting ? 'Processing...' : 'Complete Payment'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                        <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                        <p style={{ fontSize: '0.8rem', color: '#444', margin: 0, fontWeight: '500' }}>
                            Secure MoR Payment Layer
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
