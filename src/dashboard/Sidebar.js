import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Sidebar = () => {
  const { logout } = usePrivy();
  const menuItems = ["Home", "Products", "Customers", "Analytics", "Sales", "Finance", "Settings"];

  return (
    <div style={{ width: '260px', backgroundColor: '#000', height: '100vh', padding: '24px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a1a' }}>
      <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px' }}>✦ Arthek LLP</div>

      {/* Search Bar - Visual Polish */}
      <div style={{ backgroundColor: '#111', padding: '8px', borderRadius: '6px', color: '#666', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #222' }}>
        Search... <span style={{ float: 'right' }}>⌘ K</span>
      </div>

      <nav style={{ flexGrow: 1 }}>
        {menuItems.map(item => (
          <div key={item} style={{
            padding: '10px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            color: item === "Home" ? "#fff" : "#888",
            backgroundColor: item === "Home" ? "#1a1a1a" : "transparent",
            marginBottom: '4px',
            fontSize: '0.95rem'
          }}>
            {item}
          </div>
        ))}
      </nav>

      {/* Helio Redirect Button */}
      <button
        onClick={() => window.location.href = 'https://hel.io'}
        style={{
          padding: '12px',
          backgroundColor: '#0070f3', // Highlighted Blue
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          marginTop: '20px'
        }}
      >
        Create Payment Link
      </button>

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