import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApiModal, setShowApiModal] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/products');
            setProducts(response.data.products || []);
            setError(null);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            if (type === 'subscription') {
                await axios.delete(`/api/products/plan/${id}`);
            }
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) return <div style={{ color: '#888', padding: '40px' }}>Loading products...</div>;

    return (
        <div style={{ flex: 1, padding: '40px', backgroundColor: '#0a0a0a', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Products</h1>
                <button
                    onClick={fetchProducts}
                    style={{ backgroundColor: 'transparent', color: '#888', border: '1px solid #333', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Refresh
                </button>
            </div>

            {error && <div style={{ color: '#ef4444', marginBottom: '20px' }}>{error}</div>}

            <div style={{ backgroundColor: '#0f0f0f', borderRadius: '12px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#666', fontSize: '0.85rem' }}>
                            <th style={{ padding: '16px' }}>PRODUCT</th>
                            <th style={{ padding: '16px' }}>COMPANY</th>
                            <th style={{ padding: '16px' }}>TYPE</th>
                            <th style={{ padding: '16px' }}>PRICE</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#444' }}>No products found</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #0a0a0a', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{product.productName}</td>
                                    <td style={{ padding: '16px', color: '#888' }}>{product.companyName}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            backgroundColor: product.type === 'subscription' ? '#1e1b4b' : '#064e3b',
                                            color: product.type === 'subscription' ? '#818cf8' : '#34d399',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {product.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>${product.price}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            {product.type === 'payment_link' && (
                                                <button
                                                    onClick={() => copyToClipboard(product.url)}
                                                    style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Copy Link
                                                </button>
                                            )}
                                            {product.type === 'subscription' && (
                                                <button
                                                    onClick={() => setShowApiModal(product)}
                                                    style={{ backgroundColor: '#1a1a1a', color: '#3b82f6', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    API
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(product.type, product.id)}
                                                style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                disabled={product.type === 'payment_link'}
                                                title={product.type === 'payment_link' ? "Invoices cannot be deleted via API" : ""}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showApiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #333', maxWidth: '600px', width: '90%'
                    }}>
                        <h2 style={{ marginTop: 0 }}>API Integration</h2>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>Use this Plan ID to integrate subscriptions into your own website's checkout flow.</p>

                        <div style={{ backgroundColor: '#000', padding: '15px', borderRadius: '8px', border: '1px solid #222', marginBottom: '20px' }}>
                            <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '5px' }}>PLAN ID</div>
                            <div style={{ fontFamily: 'monospace', color: '#34d399' }}>{showApiModal.id}</div>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#888' }}>
                            <strong>Endpoint:</strong> <code>POST /api/create-subscription</code><br />
                            <strong>Body:</strong>
                            <pre style={{ backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>
                                {JSON.stringify({
                                    subscription_plan_id: showApiModal.id,
                                    email: "customer@example.com"
                                }, null, 2)}
                            </pre>
                        </div>

                        <button
                            onClick={() => setShowApiModal(null)}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsList;
