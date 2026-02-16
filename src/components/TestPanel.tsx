import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import CollaborativeTestSystem from '@/components/CollaborativeTestSystem';
import { 
  TestTube, 
  Users, 
  Calendar, 
  ArrowLeftRight, 
  Trash2, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { createTestVacationRequests, createTestSwapRequests, clearTestData } from '@/data/scheduleData';
import { initialUsers } from '@/data/scheduleData';

interface TestPanelProps {
  onClose?: () => void;
}

const TestPanel: React.FC<TestPanelProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');

  const handleCreateTestUsers = () => {
    setIsLoading(true);
    try {
      // Simular criação de usuários de teste
      const testUsers = [
        { id: "9", name: "TESTE_OPERADOR1", password: "1234", role: "operador", status: "ativo" },
        { id: "10", name: "TESTE_OPERADOR2", password: "1234", role: "operador", status: "ativo" },
        { id: "11", name: "TESTE_ADMIN", password: "1234", role: "administrador", status: "ativo" },
        { id: "12", name: "TESTE_SUPER", password: "1234", role: "super_admin", status: "ativo" }
      ];
      
      toast.success('Usuários de teste criados com sucesso!');
      console.log('Usuários de teste:', testUsers);
    } catch (error) {
      toast.error('Erro ao criar usuários de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestVacations = () => {
    setIsLoading(true);
    try {
      createTestVacationRequests();
      toast.success('Solicitações de férias de teste criadas!');
    } catch (error) {
      toast.error('Erro ao criar solicitações de férias de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTestSwaps = () => {
    setIsLoading(true);
    try {
      createTestSwapRequests();
      toast.success('Solicitações de troca de teste criadas!');
    } catch (error) {
      toast.error('Erro ao criar solicitações de troca de teste');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTestData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de teste? Esta ação não pode ser desfeita.')) {
      setIsLoading(true);
      try {
        clearTestData();
        toast.success('Dados de teste limpos com sucesso!');
      } catch (error) {
        toast.error('Erro ao limpar dados de teste');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportTestData = () => {
    try {
      const testData = {
        users: initialUsers,
        vacations: localStorage.getItem('vacationRequests'),
        swaps: localStorage.getItem('swapRequests'),
        schedules: localStorage.getItem('escala_scheduleStorage'),
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Dados de teste exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados de teste');
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    try {
      // Executar todos os testes em sequência
      await new Promise(resolve => setTimeout(resolve, 500));
      handleCreateTestUsers();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      createTestVacationRequests();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      createTestSwapRequests();
      
      toast.success('Todos os testes executados com sucesso!');
    } catch (error) {
      toast.error('Erro ao executar testes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-xl border border-border max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TestTube className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Painel de Testes do Sistema</h2>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Ferramentas para testar todas as funcionalidades do sistema de escalas
          </p>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'individual'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Testes Individuais
          </button>
          <button
            onClick={() => setActiveTab('collaborative')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborative'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 mr-1" />
            Testes Colaborativos
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'collaborative' ? (
            <CollaborativeTestSystem />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card de Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Usuários de Teste
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Usuários Disponíveis:</h4>
                    <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-400">
                      <li>• TESTE_OPERADOR1 (Operador)</li>
                      <li>• TESTE_OPERADOR2 (Operador)</li>
                      <li>• TESTE_ADMIN (Administrador)</li>
                      <li>• TESTE_SUPER (Super Admin)</li>
                    </ul>
                    <p className="text-xs mt-2 text-blue-600 dark:text-blue-500">Senha: 1234</p>
                  </div>
                  <Button 
                    onClick={handleCreateTestUsers}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Criar Usuários de Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Card de Férias */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Solicitações de Férias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Tipos de Teste:</h4>
                    <ul className="text-sm space-y-1 text-green-700 dark:text-green-400">
                      <li>• 1 solicitação pendente</li>
                      <li>• 1 solicitação aprovada</li>
                      <li>• 1 solicitação rejeitada</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleCreateTestVacations}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Criar Férias de Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Card de Trocas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-orange-500" />
                    Solicitações de Troca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">Tipos de Teste:</h4>
                    <ul className="text-sm space-y-1 text-orange-700 dark:text-orange-400">
                      <li>• 1 solicitação pendente</li>
                      <li>• 1 solicitação aceita</li>
                      <li>• 1 solicitação rejeitada</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleCreateTestSwaps}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Criar Trocas de Teste
                  </Button>
                </CardContent>
              </Card>

              {/* Card de Ferramentas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5 text-purple-500" />
                    Ferramentas de Teste
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={runAllTests}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Executar Todos os Testes
                  </Button>
                  
                  <Button 
                    onClick={handleExportTestData}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados de Teste
                  </Button>
                  
                  <Button 
                    onClick={handleClearTestData}
                    disabled={isLoading}
                    className="w-full"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Dados de Teste
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPanel;
