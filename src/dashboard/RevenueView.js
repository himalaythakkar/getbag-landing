import React from 'react';

const RevenueView = () => {
  return (
    <div style={{ flex: 1, padding: '40px', backgroundColor: '#0a0a0a', color: '#fff' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Home</h1>
      
      <div style={{ 
        backgroundColor: '#0f0f0f', 
        borderRadius: '20px', 
        padding: '40px', 
        border: '1px solid #1a1a1a',
        position: 'relative'
      }}>
        <div style={{ color: '#888', marginBottom: '10px' }}>Revenue ⌵</div>
        <div style={{ fontSize: '4.5rem', fontWeight: '500', marginBottom: '10px' }}>$0</div>
        <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '0.9rem' }}>
          <span>● Jan 17, 2026</span>
          <span>○ Dec 17, 2025</span>
        </div>
        
        {/* Placeholder for the chart line */}
        <div style={{ height: '200px', marginTop: '40px', borderBottom: '1px solid #333', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '50%', width: '4px', height: '4px', backgroundColor: '#0070f3', borderRadius: '50%', boxShadow: '0 0 10px #0070f3' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RevenueView;