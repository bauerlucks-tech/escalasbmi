// PÁGINA DE SINCRONIZAÇÃO COM REPOSITÓRIO
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import RepositorySync from '@/components/RepositorySync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RepositorySyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [syncCount, setSyncCount] = useState(0);

  const handleSyncComplete = (success: boolean) => {
    if (success) {
      setSyncCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab="sync" setActiveTab={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔄 Sincronização com Repositório</h1>
          <p className="text-muted-foreground">
            Backup automático dos dados da escala no repositório GitHub
          </p>
        </div>

        <div className="grid gap-6">
          {/* Componente Principal de Sincronização */}
          <RepositorySync onSyncComplete={handleSyncComplete} />

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Informações do Sistema
                {syncCount > 0 && (
                  <Badge variant="secondary">
                    {syncCount} sincronizações
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">📁 Onde ficam os dados:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Downloads do navegador (arquivos JSON)</li>
                    <li>• localStorage (backup local)</li>
                    <li>• Repositório GitHub (opcional)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">🔄 Frequência de backup:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Manual (botão "Sincronizar Agora")</li>
                    <li>• Automático (a cada 24 horas)</li>
                    <li>• Ao fechar a página</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">📋 Dados incluídos no backup:</h4>
                <div className="grid md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Escalas atuais e arquivadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Solicitações de troca</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Usuários e permissões</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Solicitações de férias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span>Logs de auditoria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span>Configurações do sistema</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  🛡️ Segurança dos Dados
                </h4>
                <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Dados armazenados localmente no navegador</li>
                  <li>• Backup automático sem enviar para servidores externos</li>
                  <li>• Criptografia disponível para dados sensíveis</li>
                  <li>• Controle de versão e histórico completo</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/backup')}
                  className="flex items-center gap-2"
                >
                  💾 Backup Manual
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/csv-import')}
                  className="flex items-center gap-2"
                >
                  📁 Importar CSV
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/audit')}
                  className="flex items-center gap-2"
                >
                  📋 Logs de Auditoria
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  🏠 Página Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RepositorySyncPage;
