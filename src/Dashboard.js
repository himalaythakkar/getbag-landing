import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Dashboard = () => {
  const { user, logout } = usePrivy();

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', padding: '40px' }}>
      {/* Sidebar / Header area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#2563eb', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}>B</div>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>Bag</span>
        </div>
        <button onClick={logout} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* Main Stats Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
          <p style={{ color: '#888', margin: '0' }}>Total Revenue</p>
          <h2 style={{ fontSize: '28px', margin: '10px 0' }}>$128,430.00</h2>
          <span style={{ color: '#10b981', fontSize: '12px' }}>+12.5% from last month</span>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
          <p style={{ color: '#888', margin: '0' }}>Active Subs</p>
          <h2 style={{ fontSize: '28px', margin: '10px 0' }}>1,240</h2>
          <span style={{ color: '#10b981', fontSize: '12px' }}>+3% from last week</span>
        </div>
        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
          <p style={{ color: '#888', margin: '0' }}>User</p>
          <h2 style={{ fontSize: '18px', margin: '10px 0', color: '#3b82f6' }}>{user?.google?.email || 'Founder'}</h2>
          <span style={{ color: '#888', fontSize: '12px' }}>Verified Merchant</span>
        </div>
      </div>

      {/* Placeholder for Chart/Activity */}
      <div style={{ background: '#111', height: '300px', borderRadius: '12px', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
        Activity Chart Coming Soon...
      </div>
    </div>
  );
};

export default Dashboard;