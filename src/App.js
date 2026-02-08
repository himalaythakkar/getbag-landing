import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import './App.css';
import Dashboard from './dashboard/Dashboard';
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
          <button onClick={() => login()} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '25px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', maxWidth: '900px', margin: '80px auto 0 auto', borderTop: '1px solid #222', paddingTop: '40px' }}>
        <div>
          <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Merchant of Record</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>We handle the liability, sales tax, and compliance globally.</p>
        </div>
        <div>
          <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Global Tax</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>Automatic VAT/GST collection in over 150+ countries.</p>
        </div>
        <div>
          <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>Instant Off-ramps</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>Move funds from your bag to your bank account instantly.</p>
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  const { authenticated, ready } = usePrivy();
  if (!ready) return null;

  // If logged in, show ONLY the Dashboard. 
  // If not, show the Navbar AND the Hero together.
  return authenticated ? (
    <Dashboard />
  ) : (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
export default function App() {
  return (
    <PrivyProvider
      appId="cml7qeu8h03a7l80b0ys65ilk"
      onSuccess={() => window.location.reload()}
      config={{
        loginMethods: ['google'],
        appearance: { theme: 'dark', accentColor: '#3b82f6' },
        // Use redirect instead of popup to force it to work on Brave/Chrome
        loginMethod: 'redirect'
      }}
    >
      <div style={{ backgroundColor: '#000', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <MainContent />
      </div>
    </PrivyProvider>
  );
}