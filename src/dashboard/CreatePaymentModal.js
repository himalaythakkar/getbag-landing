import React, { useState } from 'react';
import axios from 'axios';

const CreatePaymentModal = ({ onClose }) => {
    const [step, setStep] = useState('select'); // 'select' or 'form'
    const [formData, setFormData] = useState({
        companyName: '',
        productName: '',
        description: '',
        price: '',
        paymentType: 'payment_link' // 'payment_link' or 'subscription'
    });
    const [loading, setLoading] = useState(false);
    const [createdLink, setCreatedLink] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, paymentType: type }));
        setStep('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = formData.paymentType === 'subscription'
                ? '/api/subscriptions'
                : '/api/create-payment-link';

            const response = await axios.post(endpoint, formData);

            if (response.data.checkout_url || response.data.invoice_url) {
                setCreatedLink(response.data.checkout_url || response.data.invoice_url);
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Failed to create payment link. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdLink);
        alert('URL copied to clipboard!');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#000',
                border: '1px solid #1a1a1a',
                borderRadius: '24px',
                padding: '40px',
                width: '500px',
                maxWidth: '95%',
                color: '#fff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                        {createdLink ? 'Link Created' : step === 'select' ? 'Create New Link' : 'Configure Details'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#444', fontSize: '2rem', cursor: 'pointer', linePadding: 0 }}>×</button>
                </div>

                {createdLink ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222', marginBottom: '24px', wordBreak: 'break-all' }}>
                            <code style={{ color: '#0070f3', fontSize: '0.9rem' }}>{createdLink}</code>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={copyToClipboard} style={{ flex: 1, padding: '14px', backgroundColor: '#fff', color: '#000', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                Copy URL
                            </button>
                            <button onClick={() => window.open(createdLink, '_blank')} style={{ flex: 1, padding: '14px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
                                Open Link
                            </button>
                        </div>
                    </div>
                ) : step === 'select' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => handleTypeSelect('payment_link')}
                            style={{
                                padding: '24px',
                                backgroundColor: '#111',
                                border: '1px solid #222',
                                borderRadius: '16px',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#0070f3'; e.currentTarget.style.backgroundColor = '#0a0a0a'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.backgroundColor = '#111'; }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>One-time Payment</span>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Perfect for single items, invoices, or simple checkouts.</span>
                        </button>
                        <button
                            onClick={() => handleTypeSelect('subscription')}
                            style={{
                                padding: '24px',
                                backgroundColor: '#111',
                                border: '1px solid #222',
                                borderRadius: '16px',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#0070f3'; e.currentTarget.style.backgroundColor = '#0a0a0a'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.backgroundColor = '#111'; }}
                        >
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Subscription (Recurring)</span>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Bill customers monthly for services or access.</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company Name</label>
                            <input
                                type="text"
                                name="companyName"
                                placeholder="e.g. Acme Corp"
                                value={formData.companyName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222',
                                    borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formData.paymentType === 'subscription' ? 'Plan' : 'Product'} Name</label>
                            <input
                                type="text"
                                name="productName"
                                placeholder={formData.paymentType === 'subscription' ? 'e.g. Pro Monthly' : 'e.g. Design Kit'}
                                value={formData.productName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222',
                                    borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                            <textarea
                                name="description"
                                placeholder="Tell the customer what they are buying..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222',
                                    borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', height: '80px', resize: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formData.paymentType === 'subscription' ? 'Monthly Price' : 'Price'} (USD)</label>
                            <input
                                type="number"
                                name="price"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '14px', backgroundColor: '#111', border: '1px solid #222',
                                    borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setStep('select')}
                                style={{
                                    flex: 1, padding: '14px', backgroundColor: 'transparent', border: '1px solid #222',
                                    borderRadius: '12px', color: '#fff', cursor: 'pointer', fontWeight: '600'
                                }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2, padding: '14px', backgroundColor: '#0070f3', border: 'none',
                                    borderRadius: '12px', color: 'white', cursor: 'pointer', fontWeight: '600',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Creating...' : `Create ${formData.paymentType === 'subscription' ? 'Plan' : 'Link'}`}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CreatePaymentModal;
