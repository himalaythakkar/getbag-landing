import React from 'react';

const MoRVsPG = () => {
    const comparisonData = [
        {
            feature: 'Legal Seller',
            mor: 'MoR',
            pg: 'Your Company'
        },
        {
            feature: 'Tax Collection & Remittance',
            mor: 'Handled by MoR',
            pg: 'You are responsible'
        },
        {
            feature: 'Compliance & Regulatory Burden',
            mor: 'MoR assumes liability',
            pg: 'You handle local laws and chargebacks'
        },
        {
            feature: 'Settlement Currency',
            mor: 'Fiat/Stables',
            pg: 'Fiat'
        },
        {
            feature: 'Risk Management',
            mor: 'KYT tools',
            pg: 'You set up your own tools (e.g. Stripe Radar)'
        },
        {
            feature: 'Payouts',
            mor: 'Fiat/Stables',
            pg: 'Direct from PG to you, with bank setup'
        }
    ];

    return (
        <div style={{ flexGrow: 1, padding: '48px', backgroundColor: '#000', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.03em' }}>
                        Having a reseller who understands crypto <span style={{ color: '#0070f3' }}>makes it easier</span>
                    </h1>
                    <p style={{ color: '#888', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '700px' }}>
                        Choose the right infrastructure for your global stablecoin payments. Get Em Bags handles the complexity of global commerce so you can focus on building.
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#0a0a0a',
                    borderRadius: '24px',
                    border: '1px solid #1a1a1a',
                    overflow: 'hidden',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                                <th style={{ padding: '24px', color: '#444', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Feature</th>
                                <th style={{ padding: '24px', backgroundColor: '#111' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#0070f3', fontSize: '1.2rem' }}>✦</span>
                                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>Get Em Bags (MoR)</span>
                                    </div>
                                </th>
                                <th style={{ padding: '24px', color: '#888', fontWeight: '600', fontSize: '1rem' }}>Standard PG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, index) => (
                                <tr key={index} style={{ borderBottom: index === comparisonData.length - 1 ? 'none' : '1px solid #1a1a1a' }}>
                                    <td style={{ padding: '24px', fontWeight: '600', color: '#fff', fontSize: '1rem' }}>{row.feature}</td>
                                    <td style={{ padding: '24px', backgroundColor: '#0c0c0c', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div style={{ color: '#0070f3', marginTop: '2px' }}>✓</div>
                                            <div style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.5' }}>{row.mor}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px', color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{row.pg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '48px', padding: '32px', backgroundColor: '#111', borderRadius: '20px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px' }}>Ready to Scale Globally?</h3>
                        <p style={{ color: '#888', margin: 0 }}>Stop worrying about VAT, sales tax, and global compliance.</p>
                    </div>
                    <button style={{
                        padding: '12px 24px',
                        backgroundColor: '#fff',
                        color: '#000',
                        borderRadius: '10px',
                        border: 'none',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoRVsPG;
