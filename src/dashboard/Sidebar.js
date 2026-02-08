import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Sidebar = ({ setCurrentView, currentView }) => {
  const { logout } = usePrivy();

  const mainMenuItems = [
    { id: 'Home', label: 'Home', view: 'revenue' },
    { id: 'Products', label: 'Products', view: 'products' },
    { id: 'Customers', label: 'Customers' },
    { id: 'Analytics', label: 'Analytics' },
    { id: 'Sales', label: 'Sales' },
    { id: 'Finance', label: 'MoR vs PG', view: 'mor-vs-pg', badge: '(new)' },
    { id: 'Settings', label: 'Settings' }
  ];

  const comingSoonItems = [
    { id: 'KYT Tools', label: 'KYT Tools' },
    { id: 'Billing Automation', label: 'Billing Automation' },
    { id: 'API Docs', label: 'API Docs' }
  ];

  return (
    <div style={{ width: '260px', backgroundColor: '#000', height: '100vh', padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a1a' }}>
      <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#0070f3' }}>✦</span> Get Em Bags LLP
      </div>

      {/* Search Bar - Visual Polish */}
      <div style={{ backgroundColor: '#0a0a0a', padding: '10px 14px', borderRadius: '10px', color: '#666', marginBottom: '24px', fontSize: '0.85rem', border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Search...</span>
        <span style={{ fontSize: '0.75rem', backgroundColor: '#1a1a1a', padding: '2px 6px', borderRadius: '4px', border: '1px solid #333' }}>⌘ K</span>
      </div>

      <nav style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mainMenuItems.map(item => (
          <div key={item.id}
            onClick={() => {
              if (item.view) setCurrentView(item.view);
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              cursor: item.view ? 'pointer' : 'default',
              color: currentView === item.view ? "#fff" : "#888",
              backgroundColor: currentView === item.view ? "#111" : "transparent",
              fontSize: '0.9rem',
              fontWeight: currentView === item.view ? '600' : '400',
              transition: 'all 0.2s ease',
              border: currentView === item.view ? '1px solid #222' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
            <span>{item.label}</span>
            {item.badge && (
              <span style={{
                fontSize: '0.65rem',
                backgroundColor: '#0070f320',
                color: '#0070f3',
                padding: '2px 6px',
                borderRadius: '6px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {item.badge}
              </span>
            )}
          </div>
        ))}

        <div style={{ margin: '16px 0 8px 12px', fontSize: '0.7rem', fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Extensions</div>

        {comingSoonItems.map(item => (
          <div key={item.id}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              color: '#444',
              fontSize: '0.9rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{item.label}</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#0070f3', fontWeight: '600' }}>Coming Soon</span>
          </div>
        ))}
      </nav>




      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #222' }}>
        <button
          onClick={logout}
          style={{
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#666',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;