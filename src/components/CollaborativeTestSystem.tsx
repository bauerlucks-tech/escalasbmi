/**
 * Sistema de Testes Colaborativos
 * Permite que um operador selecione outro para testar funcionalidades
 * O segundo operador deve confirmar para continuar o teste
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  TestTube,
  ArrowRight,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';

interface TestSession {
  id: string;
  initiatorId: string;
  initiatorName: string;
  targetId: string;
  targetName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  testType: 'swap' | 'vacation' | 'schedule' | 'admin' | 'full_system';
  currentStep: number;
  totalSteps: number;
  results: TestResult[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface TestResult {
  step: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  details?: string;
  timestamp: string;
}

const TEST_SCENARIOS = {
  swap: {
    name: 'Solicitação de Troca',
    steps: [
      'Acessar aba Solicitar Troca',
      'Preencher formulário de troca',
      'Verificar notificação do destinatário',
      'Destinatário aceitar/recusar troca',
      'Verificar atualização da escala'
    ]
  },
  vacation: {
    name: 'Solicitação de Férias',
    steps: [
      'Acessar aba Férias',
      'Preencher período de férias',
      'Submeter solicitação',
      'Verificar status pendente',
      'Admin aprovar/rejeitar (se aplicável)'
    ]
  },
  schedule: {
    name: 'Visualização de Escala',
    steps: [
      'Acessar aba Escala SBMIBZ',
      'Verificar escala do mês atual',
      'Navegar entre meses disponíveis',
      'Verificar informações pessoais',
      'Testar filtros e busca'
    ]
  },
  admin: {
    name: 'Painel Administrativo',
    steps: [
      'Acessar aba Administração',
      'Verificar usuários ativos',
      'Testar criação de usuário',
      'Verificar logs de auditoria',
      'Testar funcionalidades de admin'
    ]
  },
  full_system: {
    name: 'Sistema Completo',
    steps: [
      'Login e autenticação',
      'Navegação entre abas',
      'Visualização de escala',
      'Solicitação de troca',
      'Solicitação de férias',
      'Notificações',
      'Configurações de perfil',
      'Logout'
    ]
  }
};

const CollaborativeTestSystem: React.FC = () => {
  const { currentUser, users, operators } = useAuth();
  const { swapRequests } = useSwap();
  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [pendingRequests, setPendingRequests] = useState<TestSession[]>([]);
  const [myTestHistory, setMyTestHistory] = useState<TestSession[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Carregar sessões do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('collaborative_tests');
    if (stored) {
      const data = JSON.parse(stored);
      setPendingRequests(data.pending || []);
      setMyTestHistory(data.history || []);
    }
  }, []);

  // Salvar sessões no localStorage
  const saveSessions = (pending: TestSession[], history: TestSession[]) => {
    localStorage.setItem('collaborative_tests', JSON.stringify({
      pending,
      history,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Iniciar nova sessão de teste
  const startTestSession = (targetUserId: string, testType: TestSession['testType']) => {
    if (!currentUser) return;

    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return;

    const session: TestSession = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      initiatorId: currentUser.id,
      initiatorName: currentUser.name,
      targetId: targetUser.id,
      targetName: targetUser.name,
      status: 'pending',
      testType,
      currentStep: 0,
      totalSteps: TEST_SCENARIOS[testType].steps.length,
      results: [],
      createdAt: new Date().toISOString()
    };

    // Adicionar aos pendentes
    const updatedPending = [...pendingRequests, session];
    setPendingRequests(updatedPending);
    saveSessions(updatedPending, myTestHistory);

    // Notificar o usuário alvo
    toast.success(`Solicitação de teste enviada para ${targetUser.name}!`);

    // Simular notificação para o usuário alvo (em produção, usar WebSocket ou evento)
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('test_notifications');
      channel.postMessage({
        type: 'test_request',
        session,
        targetUserId: targetUser.id
      });
    }
  };

  // Responder à solicitação de teste
  const respondToTestRequest = (sessionId: string, accept: boolean) => {
    const session = pendingRequests.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSession: TestSession = {
      ...session,
      status: accept ? 'accepted' : 'rejected',
      startedAt: accept ? new Date().toISOString() : undefined
    };

    // Remover dos pendentes
    const updatedPending = pendingRequests.filter(s => s.id !== sessionId);
    setPendingRequests(updatedPending);

    if (accept) {
      // Iniciar o teste
      setActiveSession(updatedSession);
      setCurrentStep(0);
      setTestResults([]);
      toast.success(`Teste iniciado com ${updatedSession.initiatorName}!`);
    } else {
      // Adicionar ao histórico com status rejeitado
      const updatedHistory = [...myTestHistory, updatedSession];
      setMyTestHistory(updatedHistory);
      saveSessions(updatedPending, updatedHistory);
      toast.info('Solicitação de teste rejeitada');
    }
  };

  // Avançar para o próximo passo do teste
  const nextTestStep = () => {
    if (!activeSession) return;

    const scenario = TEST_SCENARIOS[activeSession.testType];
    const stepName = scenario.steps[currentStep];

    // Registrar resultado do passo atual
    const result: TestResult = {
      step: stepName,
      status: 'passed',
      timestamp: new Date().toISOString()
    };

    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);

    if (currentStep < activeSession.totalSteps - 1) {
      // Avançar para o próximo passo
      setCurrentStep(currentStep + 1);
      const updatedSession = {
        ...activeSession,
        currentStep: currentStep + 1,
        results: updatedResults
      };
      setActiveSession(updatedSession);
    } else {
      // Completar o teste
      completeTest(updatedResults);
    }
  };

  // Marcar passo como falha
  const failTestStep = (details?: string) => {
    if (!activeSession) return;

    const scenario = TEST_SCENARIOS[activeSession.testType];
    const stepName = scenario.steps[currentStep];

    const result: TestResult = {
      step: stepName,
      status: 'failed',
      details,
      timestamp: new Date().toISOString()
    };

    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);

    toast.error(`Passo "${stepName}" falhou: ${details || 'Erro desconhecido'}`);
  };

  // Completar o teste
  const completeTest = (finalResults?: TestResult[]) => {
    if (!activeSession) return;

    const results = finalResults || testResults;
    const completedSession: TestSession = {
      ...activeSession,
      status: 'completed',
      results,
      completedAt: new Date().toISOString()
    };

    // Adicionar ao histórico
    const updatedHistory = [...myTestHistory, completedSession];
    setMyTestHistory(updatedHistory);

    // Limpar sessão ativa
    setActiveSession(null);
    setCurrentStep(0);
    setTestResults([]);

    // Salvar no localStorage
    saveSessions(pendingRequests, updatedHistory);

    // Mostrar resultado
    const passedCount = results.filter(r => r.status === 'passed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const totalCount = results.length;

    if (failedCount === 0) {
      toast.success(`✅ Teste concluído com sucesso! (${passedCount}/${totalCount} passos)`);
    } else {
      toast.warning(`⚠️ Teste concluído com falhas! (${passedCount}/${totalCount} passos, ${failedCount} falhas)`);
    }
  };

  // Cancelar teste
  const cancelTest = () => {
    if (!activeSession) return;

    const cancelledSession: TestSession = {
      ...activeSession,
      status: 'cancelled',
      completedAt: new Date().toISOString()
    };

    const updatedHistory = [...myTestHistory, cancelledSession];
    setMyTestHistory(updatedHistory);
    saveSessions(pendingRequests, updatedHistory);

    setActiveSession(null);
    setCurrentStep(0);
    setTestResults([]);

    toast.info('Teste cancelado');
  };

  // Obter sessões pendentes para o usuário atual
  const myPendingRequests = pendingRequests.filter(s => s.targetId === currentUser?.id);
  const myInitiatedRequests = pendingRequests.filter(s => s.initiatorId === currentUser?.id);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Faça login para acessar o sistema de testes colaborativos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sessão Ativa */}
      {activeSession && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Teste em Progresso
                </CardTitle>
                <CardDescription>
                  {activeSession.initiatorName} ↔ {activeSession.targetName}
                </CardDescription>
              </div>
              <Badge variant="outline">
                Passo {currentStep + 1} de {activeSession.totalSteps}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barra de Progresso */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / activeSession.totalSteps) * 100}%` }}
              />
            </div>

            {/* Passo Atual */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">
                Passo Atual: {TEST_SCENARIOS[activeSession.testType].steps[currentStep]}
              </h4>
              <div className="flex gap-2">
                <Button onClick={nextTestStep} size="sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Passou
                </Button>
                <Button onClick={() => failTestStep('Usuário reportou falha')} variant="destructive" size="sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Falhou
                </Button>
                <Button onClick={cancelTest} variant="outline" size="sm">
                  <Pause className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Resultados Parciais */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Resultados:</h4>
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-background rounded">
                    {result.status === 'passed' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.step}</span>
                    {result.details && (
                      <span className="text-xs text-muted-foreground">({result.details})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Solicitações Pendentes */}
      {myPendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Solicitações de Teste Pendentes
            </CardTitle>
            <CardDescription>
              Você foi selecionado para participar em testes colaborativos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myPendingRequests.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {session.initiatorName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.initiatorName}</p>
                    <p className="text-sm text-muted-foreground">
                      Teste: {TEST_SCENARIOS[session.testType].name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => respondToTestRequest(session.id, true)}
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aceitar
                  </Button>
                  <Button 
                    onClick={() => respondToTestRequest(session.id, false)}
                    variant="outline"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Recusar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Iniciar Novo Teste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Iniciar Teste Colaborativo
          </CardTitle>
          <CardDescription>
            Selecione um operador e o tipo de teste para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selecionar Operador */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selecionar Operador:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {operators
                .filter(op => op.id !== currentUser.id)
                .map(operator => (
                  <Button
                    key={operator.id}
                    variant="outline"
                    onClick={() => {
                      const targetUserId = operator.id;
                      const testType = 'full_system'; // Pode ser dinâmico
                      startTestSession(targetUserId, testType);
                    }}
                    className="justify-start"
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {operator.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {operator.name}
                  </Button>
                ))}
            </div>
          </div>

          {/* Tipos de Teste Disponíveis */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tipos de Teste:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(TEST_SCENARIOS).map(([key, scenario]) => (
                <Card key={key} className="p-3">
                  <h4 className="font-medium text-sm">{scenario.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {scenario.steps.length} passos
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Testes */}
      {myTestHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Histórico de Testes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myTestHistory.slice(-5).reverse().map(session => (
                <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      session.status === 'completed' ? 'default' :
                      session.status === 'rejected' ? 'destructive' :
                      session.status === 'cancelled' ? 'outline' : 'secondary'
                    }>
                      {session.status}
                    </Badge>
                    <span className="text-sm">
                      {session.initiatorName} ↔ {session.targetName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {TEST_SCENARIOS[session.testType].name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CollaborativeTestSystem;
