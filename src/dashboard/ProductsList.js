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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        console.log('Copied:', text);
    };

    if (loading) return <div style={{ color: '#888', padding: '40px' }}>Loading products...</div>;

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this link?')) return;
        try {
            const isSub = type === 'subscription';
            await axios.delete(`/api/products/${id}${isSub ? '?type=sub' : ''}`);
            fetchProducts();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete product.');
        }
    };

    return (
        <div style={{ flex: 1, padding: '40px', backgroundColor: '#0a0a0a', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, letterSpacing: '-0.02em' }}>Your Links</h1>
                <button
                    onClick={fetchProducts}
                    style={{ backgroundColor: 'transparent', color: '#888', border: '1px solid #222', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                    onMouseOver={e => e.target.style.borderColor = '#444'}
                    onMouseOut={e => e.target.style.borderColor = '#222'}
                >
                    Refresh List
                </button>
            </div>

            {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}

            <div style={{ backgroundColor: '#000', borderRadius: '20px', border: '1px solid #111', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: '#444', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '20px 24px', borderBottom: '1px solid #111' }}>Product / Service</th>
                            <th style={{ padding: '20px 24px', borderBottom: '1px solid #111' }}>Merchant</th>
                            <th style={{ padding: '20px 24px', borderBottom: '1px solid #111' }}>Amount</th>
                            <th style={{ padding: '20px 24px', borderBottom: '1px solid #111' }}>Type</th>
                            <th style={{ padding: '20px 24px', borderBottom: '1px solid #111', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#444', fontSize: '1rem' }}>No links created yet. Click "Create Link" to get started.</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ fontSize: '0.95rem', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #050505', fontWeight: '600' }}>{product.productName}</td>
                                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #050505', color: '#666' }}>{product.companyName}</td>
                                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #050505' }}>
                                        <span style={{ fontWeight: '700' }}>${product.price}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#444', marginLeft: '4px' }}>USD</span>
                                    </td>
                                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #050505' }}>
                                        <span style={{
                                            backgroundColor: product.type === 'subscription' ? '#1e1b4b' : '#064e3b',
                                            color: product.type === 'subscription' ? '#818cf8' : '#34d399',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}>
                                            {product.type === 'subscription' ? 'Recurring' : 'One-time'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', borderBottom: '1px solid #050505', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => copyToClipboard(product.url)}
                                                style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #222', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                                                title="Copy checkout URL"
                                            >
                                                Link
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, product.type)}
                                                style={{ backgroundColor: 'transparent', color: '#444', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
                                                onMouseOver={e => e.target.style.color = '#ef4444'}
                                                onMouseOut={e => e.target.style.color = '#444'}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => window.open(product.url, '_blank')}
                                                style={{ backgroundColor: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsList;
