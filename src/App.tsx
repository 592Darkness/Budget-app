/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider } from './context';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Envelopes } from './components/Envelopes';
import { Transactions } from './components/Transactions';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Advisor } from './components/Advisor';
import { QuickAddModal } from './components/QuickAddModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'envelopes':
        return <Envelopes />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      case 'advisor':
        return <Advisor />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onQuickAdd={() => setIsQuickAddOpen(true)}
    >
      {renderContent()}
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
