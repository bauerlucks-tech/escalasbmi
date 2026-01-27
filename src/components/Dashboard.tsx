import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ScheduleView from '@/components/ScheduleView';
import SwapRequestView from '@/components/SwapRequestView';
import RequestsView from '@/components/RequestsView';
import AdminPanel from '@/components/AdminPanel';
import VacationRequestView from '@/components/VacationRequestView';
import VacationAdminView from '@/components/VacationAdminView';
import OperatorHelp from '@/components/OperatorHelp';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redireciona RICARDO se tentar acessar as abas de troca ou solicitações
  useEffect(() => {
    if (currentUser?.name === 'RICARDO' && (activeTab === 'swap' || activeTab === 'requests')) {
      setActiveTab('schedule');
    }
  }, [currentUser, activeTab]);

  // Redireciona para página de backup se aba backup for selecionada
  useEffect(() => {
    if (activeTab === 'backup') {
      navigate('/backup');
    }
  }, [activeTab, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleView />;
      case 'swap':
        return <SwapRequestView />;
      case 'requests':
        return <RequestsView />;
      case 'help':
        return <OperatorHelp />;
      case 'admin':
        return <AdminPanel setActiveTab={setActiveTab} />;
      case 'vacations':
        return currentUser?.role === 'administrador' ? <VacationAdminView /> : <VacationRequestView />;
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
