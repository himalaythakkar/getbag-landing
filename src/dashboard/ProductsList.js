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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`/api/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

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
                            <th style={{ padding: '16px' }}>PRICE</th>
                            <th style={{ padding: '16px' }}>STATUS</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#444' }}>No payment links found</td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #0a0a0a', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '16px', fontWeight: '500' }}>{product.productName}</td>
                                    <td style={{ padding: '16px', color: '#888' }}>{product.companyName}</td>
                                    <td style={{ padding: '16px' }}>${product.price}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            backgroundColor: '#064e3b',
                                            color: '#34d399',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase'
                                        }}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => copyToClipboard(product.url)}
                                                style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Copy
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => window.open(product.url, '_blank')}
                                                style={{ backgroundColor: '#0070f3', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Open
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
