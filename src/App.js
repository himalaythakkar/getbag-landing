import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import './App.css';

// The Navigation Bar with your working Sign In button
function Navbar() {
  const { login, authenticated, logout, user } = usePrivy();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 60px', alignItems: 'center', backgroundColor: '#000' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold' }}>B</div>
        <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>Bag</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <a href="#docs" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Docs</a>
        {authenticated ? (
          <button onClick={logout} style={{ backgroundColor: '#111', color: 'white', padding: '8px 20px', borderRadius: '20px', border: '1px solid #333', cursor: 'pointer' }}>
            Logout ({user.google?.email?.split('@')[0]})
          </button>
        ) : (
          <button onClick={login} style={{ backgroundColor: '#111', color: 'white', padding: '10px 24px', borderRadius: '25px', border: '1px solid #333', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

// Your "Secure the Bag" Hero Section
function Hero() {
  return (
    <div style={{ textAlign: 'center', color: 'white', marginTop: '120px', padding: '0 20px' }}>
      <div style={{ display: 'inline-block', border: '1px solid #1e3a8a', color: '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '24px' }}>
        MERCHANT OF RECORD FOR STABLES
      </div>
      <h1 style={{ fontSize: '80px', fontWeight: '800', margin: '0', letterSpacing: '-2px' }}>
        Secure the <span style={{ color: '#3b82f6' }}>Bag.</span>
      </h1>
      <p style={{ color: '#888', fontSize: '20px', maxWidth: '650px', margin: '24px auto', lineHeight: '1.6' }}>
        Automated billing, global tax compliance, and instant off-ramps for crypto teams. Scale your business, not your accounting.
      </p>
      <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
        <input type="email" placeholder="founder@company.com" style={{ padding: '16px 24px', width: '300px', borderRadius: '12px 0 0 12px', border: '1px solid #333', backgroundColor: '#0a0a0a', color: 'white', fontSize: '16px' }} />
        <button style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px 32px', borderRadius: '0 12px 12px 0', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
          Join Waitlist
        </button>
      </div>
      <p style={{ color: '#444', fontSize: '12px', marginTop: '40px', letterSpacing: '2px', fontWeight: 'bold' }}>JOIN 50+ FOUNDERS IN THE QUEUE</p>
    </div>
  );
}

export default function App() {
  return (
    <PrivyProvider
      appId="cml7qeu8h03a7l80b0ys65ilk" // Your ID from the dashboard
      config={{
        loginMethods: ['google'], //
        appearance: { 
          theme: 'dark',
          accentColor: '#3b82f6',
          showWalletLoginFirst: false 
        }
      }}
    >
      <div style={{ backgroundColor: '#000', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <Navbar />
        <Hero />
      </div>
    </PrivyProvider>
  );
}