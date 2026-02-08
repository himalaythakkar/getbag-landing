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
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(12px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: '32px',
                padding: '48px',
                width: '540px',
                maxWidth: '95%',
                color: '#fff',
                boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.8)',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '32px',
                        right: '32px',
                        background: '#111',
                        border: '1px solid #222',
                        color: '#888',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                    }}
                >×</button>

                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        {createdLink ? 'Ready to share!' : step === 'select' ? 'Create a link' : 'Details'}
                    </h2>
                    <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
                        {createdLink ? 'Your payment link is live and secure.' : step === 'select' ? 'Choose the payment flow for your customers.' : 'Configure your product and pricing.'}
                    </p>
                </div>

                {createdLink ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            backgroundColor: '#000',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid #222',
                            marginBottom: '32px',
                            wordBreak: 'break-all',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '0.7rem', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment URL</span>
                            <code style={{ color: '#0070f3', fontSize: '0.95rem', fontWeight: '600' }}>{createdLink}</code>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button onClick={copyToClipboard} style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#111',
                                color: '#fff',
                                borderRadius: '14px',
                                border: '1px solid #222',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#111'}
                            >
                                Copy URL
                            </button>
                            <button onClick={() => window.open(createdLink, '_blank')} style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#fff',
                                color: '#000',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                Open Link
                            </button>
                        </div>
                    </div>
                ) : step === 'select' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => handleTypeSelect('payment_link')}
                            style={{
                                padding: '32px',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                borderRadius: '24px',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#0070f380'; e.currentTarget.style.backgroundColor = '#111'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.backgroundColor = '#0a0a0a'; }}
                        >
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#0070f315', color: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>✦</div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '4px' }}>One-time Payment</div>
                                <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>Perfect for single items, invoices, or simple checkouts worldwide.</div>
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '8px', fontWeight: '600' }}>⚠️ Airtable error - fixing soon</div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleTypeSelect('subscription')}
                            style={{
                                padding: '32px',
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #1a1a1a',
                                borderRadius: '24px',
                                color: '#fff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                            onMouseOver={e => { e.currentTarget.style.borderColor = '#0070f380'; e.currentTarget.style.backgroundColor = '#111'; }}
                            onMouseOut={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.backgroundColor = '#0a0a0a'; }}
                        >
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#0070f315', color: '#0070f3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold' }}>↻</div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em', marginBottom: '4px' }}>Recurring Subscription</div>
                                <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>Bill customers monthly for services or access to your platform.</div>
                            </div>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#444', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="Acme Corp"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: '100%', padding: '16px', backgroundColor: '#000', border: '1px solid #1a1a1a',
                                        borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#0070f3'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#444', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (USD)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 32px', backgroundColor: '#000', border: '1px solid #1a1a1a',
                                            borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = '#0070f3'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#444', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formData.paymentType === 'subscription' ? 'Plan' : 'Product'} Name</label>
                            <input
                                type="text"
                                name="productName"
                                placeholder={formData.paymentType === 'subscription' ? 'Pro Monthly' : 'Standard Product'}
                                value={formData.productName}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '16px', backgroundColor: '#000', border: '1px solid #1a1a1a',
                                    borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#0070f3'}
                                onBlur={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#444', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</label>
                            <textarea
                                name="description"
                                placeholder="A brief description of what's included..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%', padding: '16px', backgroundColor: '#000', border: '1px solid #1a1a1a',
                                    borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none', height: '100px', resize: 'none', transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#0070f3'}
                                onBlur={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                            <button
                                type="button"
                                onClick={() => setStep('select')}
                                style={{
                                    flex: 1, padding: '16px', backgroundColor: 'transparent', border: '1px solid #222',
                                    borderRadius: '14px', color: '#666', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444'; }}
                                onMouseOut={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#222'; }}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2, padding: '16px', backgroundColor: '#0070f3', border: 'none',
                                    borderRadius: '14px', color: 'white', cursor: 'pointer', fontWeight: '700',
                                    opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { if (!loading) e.currentTarget.style.backgroundColor = '#0060d3'; }}
                                onMouseOut={e => { if (!loading) e.currentTarget.style.backgroundColor = '#0070f3'; }}
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
