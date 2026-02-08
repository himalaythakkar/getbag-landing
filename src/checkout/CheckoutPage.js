import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const { productId } = useParams();
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
                const response = await axios.get(`/api/products/${productId}`);
                setProduct(response.data.product);
            } catch (err) {
                setError('Product not found or error loading checkout.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // This calls our backend which proxies to Make.com
            const response = await axios.post('/api/checkout/submit', {
                productId,
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
            Loading Checkout...
        </div>
    );

    if (error || !product) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
            {error || 'Product not found.'}
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            color: '#111',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px'
        }}>
            {/* Merchant Branding Section */}
            <div style={{ maxWidth: '450px', width: '100%', textAlign: 'center', marginBottom: '40px' }}>
                {product.merchantLogo && (
                    <img src={product.merchantLogo} alt="Logo" style={{ height: '50px', marginBottom: '20px', borderRadius: '8px' }} />
                )}
                <h2 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#666', margin: 0 }}>
                    {product.companyName}
                </h2>
            </div>

            {/* Checkout Card */}
            <div style={{
                maxWidth: '450px',
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                padding: '32px',
                border: '1px solid #eee'
            }}>
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{product.productName}</h1>
                    <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{product.description}</p>
                    <div style={{ marginTop: '20px', fontSize: '1.8rem', fontWeight: '700' }}>
                        ${product.price} <span style={{ fontSize: '1rem', color: '#999', fontWeight: '400' }}>USD</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                            FULL NAME
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
                                fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                            EMAIL ADDRESS
                        </label>
                        <input
                            required
                            type="email"
                            placeholder="john@example.com"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db',
                                fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <button
                        disabled={submitting}
                        type="submit"
                        style={{
                            marginTop: '10px',
                            backgroundColor: '#111',
                            color: '#fff',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#000'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#111'}
                    >
                        {submitting ? 'Processing...' : 'Pay Now'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: '10px' }}>
                        Securely processed via Merchant of Record layer
                    </p>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
