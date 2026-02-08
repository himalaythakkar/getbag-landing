import React, { useState } from 'react';
import axios from 'axios';

const CreatePaymentModal = ({ onClose }) => {
    const [step, setStep] = useState('selection'); // 'selection' or 'details'
    const [paymentType, setPaymentType] = useState(null); // 'subscription' or 'payment_link'
    const [formData, setFormData] = useState({
        companyName: '',
        productName: '',
        price: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSelection = (type) => {
        setPaymentType(type);
        setStep('details');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = paymentType === 'subscription'
            ? '/api/create-subscription'
            : '/api/create-payment-link';

        try {
            const response = await axios.post(endpoint, {
                ...formData,
                paymentType
            });

            console.log('Success:', response.data);

            if (response.data.invoice_url) {
                console.log('Invoice URL:', response.data.invoice_url);
                window.open(response.data.invoice_url, '_blank');
            } else {
                alert('Subscription Created Successfully!');
            }

            onClose();
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Failed to create payment. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#111',
                border: '1px solid #333',
                borderRadius: '16px',
                padding: '30px',
                width: '500px',
                maxWidth: '90%',
                color: '#fff',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Create Payment</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                {step === 'selection' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <button
                            onClick={() => handleSelection('subscription')}
                            style={{
                                padding: '30px',
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#0070f3'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#333'}
                        >
                            <span style={{ fontSize: '2rem' }}>↻</span>
                            <span style={{ fontWeight: '600' }}>Subscriptions</span>
                        </button>
                        <button
                            onClick={() => handleSelection('payment_link')}
                            style={{
                                padding: '30px',
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#0070f3'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#333'}
                        >
                            <span style={{ fontSize: '2rem' }}>🔗</span>
                            <span style={{ fontWeight: '600' }}>Payment Link</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#0070f3'}
                                onBlur={e => e.target.style.borderColor = '#333'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Product Name</label>
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#0070f3'}
                                onBlur={e => e.target.style.borderColor = '#333'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Price</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                onFocus={e => e.target.style.borderColor = '#0070f3'}
                                onBlur={e => e.target.style.borderColor = '#333'}
                            />
                        </div>

                        {paymentType === 'subscription' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Customer Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: '#0a0a0a',
                                        border: '1px solid #333',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#0070f3'}
                                    onBlur={e => e.target.style.borderColor = '#333'}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={() => setStep('selection')}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2,
                                    padding: '12px',
                                    backgroundColor: '#0070f3',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Processing...' : `Create ${paymentType === 'subscription' ? 'Subscription' : 'Link'}`}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreatePaymentModal;
