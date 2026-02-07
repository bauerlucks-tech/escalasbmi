import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StitchLoginScreen } from '@/components/StitchLoginScreen';
import { StitchOperatorView } from '@/components/StitchOperatorView';
import Dashboard from '@/components/Dashboard';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);
  const [initialTab, setInitialTab] = useState('schedule');

  // Se não estiver autenticado, mostrar tela de login do Stitch
  if (!currentUser) {
    // Limpar possíveis resíduos de login antigo
    if (localStorage.getItem('directAuth_currentUser')) {
      localStorage.removeItem('directAuth_currentUser');
    }
    return (
      <StitchLoginScreen 
        onLoginSuccess={() => {
          console.log('Login realizado com sucesso, atualizando visualização');
        }} 
      />
    );
  }

  // Função para abrir o dashboard em uma aba específica
  const openDashboardAt = (tab: string) => {
    setInitialTab(tab);
    setShowDashboard(true);
  };

  // Se estiver autenticado mas não no dashboard, mostrar Operator View
  if (!showDashboard) {
    return (
      <StitchOperatorView
        user={{ name: currentUser.name, role: currentUser.role }}
        onRequestSwap={() => openDashboardAt('swap')}
        onViewRequests={() => openDashboardAt('requests')}
        onRequestVacation={() => openDashboardAt('vacations')}
        onAdmin={() => openDashboardAt('admin')}
        onBackup={() => navigate('/backup')}
        onAudit={() => openDashboardAt('audit')}
      />
    );
  }

  // Mostrar dashboard principal
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-[#221013] to-[#3d1519] p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowDashboard(false)}
              className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
            >
              ← Voltar ao Menu
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{currentUser.name}</span>
            <button 
              onClick={logout}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      <Dashboard initialTab={initialTab} />
    </div>
  );
};

export default Index;
