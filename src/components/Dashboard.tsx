import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ScheduleView from '@/components/ScheduleView';
import SwapRequestView from '@/components/SwapRequestView';
import RequestsView from '@/components/RequestsView';
import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const { currentUser } = useAuth();

  // Redireciona RICARDO se tentar acessar a aba de troca
  useEffect(() => {
    if (currentUser?.name === 'RICARDO' && activeTab === 'swap') {
      setActiveTab('schedule');
    }
  }, [currentUser, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleView />;
      case 'swap':
        return <SwapRequestView />;
      case 'requests':
        return <RequestsView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <ScheduleView />;
    }
  };

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
