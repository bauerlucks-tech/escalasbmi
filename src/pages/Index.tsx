import React from 'react';
import Dashboard from '@/components/Dashboard';

const Index: React.FC = () => {
  // Sempre mostrar Dashboard - nosso sistema de login externo controla o acesso
  return <Dashboard />;
};

export default Index;
