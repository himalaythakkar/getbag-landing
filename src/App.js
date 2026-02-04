import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import './App.css';

// --- 1. THE NAVIGATION BAR ---
function Navbar() {
  const { login, authenticated, logout, user } = usePrivy();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 60px', alignItems: 'center', backgroundColor: '#000' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ backgroundColor: '#2563eb', color: 'white', padding: '5px 12px', borderRadius: '8px', fontWeight: 'bold' }}>B</div>
        <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>Bag</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        {authenticated && <button onClick={logout} style={{ backgroundColor: '#111', color: 'white', padding: '8px 20px', borderRadius: '20px', border: '1px solid #333', cursor: 'pointer' }}>Logout</button>}
      </div>
    </nav>
  );
}

// --- 2. THE DASHBOARD (What they see after login) ---
function Dashboard() {
  const { user } = usePrivy();
  return (
    <div style={{ color: 'white', padding: '60px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px' }}>Founder Dashboard 💼</h1>
      <p style={{ color: '#888' }}>Welcome back, {user?.google?.email}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px', maxWidth: '800px', margin: '40px auto' }}>
        <div style={{ background: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #222' }}>
          <h3>Total Revenue</h3>
          <h2 style={{ color: '#3b82f6' }}>$0.00</h2>
        </div>
        <div style={{ background: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #222' }}>
          <h3>Active Subs</h3>
          <h2 style={{ color: '#3b82f6' }}>0</h2>
        </div>
      </div>
    </div>
  );
}

// --- 3. THE HERO (Your original Home Page) ---
function Hero() {
  const { login } = usePrivy();
  return (
    <div style={{ textAlign: 'center', color: 'white', marginTop: '120px', padding: '0 20px' }}>
      <div style={{ display: 'inline-block', border: '1px solid #1e3a8a', color: '#3b82f6', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', marginBottom: '24px' }}>
        MERCHANT OF RECORD FOR STABLES
      </div>
      <h1 style={{ fontSize: '80px', fontWeight: '800', margin: '0', letterSpacing: '-2px' }}>
        Secure the <span style={{ color: '#3b82f6' }}>Bag.</span>
      </h1>
      <p style={{ color: '#888', fontSize: '20px', maxWidth: '650px', margin: '24px auto', lineHeight: '1.6' }}>
        Automated billing, global tax compliance, and instant off-ramps for crypto teams.
      </p>
      <button onClick={login} style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px 40px', borderRadius: '40px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '18px' }}>
        Sign In to Get Started
      </button>
    </div>
  );
}

// --- 4. THE MAIN LOGIC ---
function MainContent() {
  const { authenticated, ready } = usePrivy();
  if (!ready) return null;
  // If logged in, show Dashboard. Otherwise, show Hero.
  return authenticated ? <Dashboard /> : <Hero />;
}

export default function App() {
  return (
    <PrivyProvider
      appId="cml7qeu8h03a7l80b0ys65ilk"
      config={{
        loginMethods: ['google'],
        appearance: { theme: 'dark', accentColor: '#3b82f6' }
      }}
    >
      <div style={{ backgroundColor: '#000', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <Navbar />
        <MainContent />
      </div>
    </PrivyProvider>
  );
}
<PrivyProvider
  appId="cml7qeu8h03a7l80b0ys65ilk"
  onSuccess={() => window.location.reload()} // <--- Add this line!
  config={{
    loginMethods: ['google'],
    appearance: { theme: 'dark', accentColor: '#3b82f6' }
  }}
></PrivyProvider>