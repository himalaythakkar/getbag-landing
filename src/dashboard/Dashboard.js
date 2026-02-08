import React from 'react';
import Sidebar from './Sidebar';
import RevenueView from './RevenueView';

import { useState } from 'react';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('revenue');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000' }}>
      <Sidebar setCurrentView={setCurrentView} currentView={currentView} />
      {<RevenueView />}
    </div>
  );
};

export default Dashboard;