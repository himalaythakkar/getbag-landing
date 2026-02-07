import React from 'react';
import Sidebar from './Sidebar';
import RevenueView from './RevenueView';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000' }}>
      <Sidebar />
      <RevenueView />
    </div>
  );
};

export default Dashboard;