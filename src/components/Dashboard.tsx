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
import AuditLogsView from '@/components/AuditLogsView';
import ReportsDashboard from '@/components/ReportsDashboard';
import PWAInstaller from '@/components/PWAInstaller';
import CalendarIntegration from '@/components/CalendarIntegration';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import WidgetDashboard from '@/components/WidgetDashboard';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import AnimationEngine from '@/components/AnimationEngine';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

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
      case 'audit':
        return <AuditLogsView />;
      case 'vacations':
        return isAdmin(currentUser) ? <VacationAdminView /> : <VacationRequestView />;
      case 'reports':
        return <ReportsDashboard />;
      case 'calendar':
        return <CalendarIntegration />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'widgets':
        return <WidgetDashboard />;
      case 'performance':
        return <PerformanceMonitor />;
      case 'animations':
        return <AnimationEngine />;
      case 'test':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Painel de Testes</h2>
            <p className="text-muted-foreground mb-6">
              Clique na aba "Testes" no header para acessar o painel completo de testes do sistema.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Funcionalidades Disponíveis:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700 dark:text-blue-400">
                <div>✓ Criação de usuários de teste</div>
                <div>✓ Geração de solicitações de férias</div>
                <div>✓ Criação de solicitações de troca</div>
                <div>✓ Exportação de dados de teste</div>
                <div>✓ Limpeza de dados de teste</div>
                <div>✓ Testes automatizados</div>
              </div>
            </div>
          </div>
        );
      default:
        return <ScheduleView />;
    }
  };

  return (
    <div className="min-h-screen">
      <PWAInstaller />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
