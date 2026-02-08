// CONTEXT SUPABASE - SUBSTITUIR O SwapContext
// Gerenciar estado do sistema com Supabase

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseAPI, User, MonthSchedule, SwapRequest, VacationRequest, AuditLog } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface SupabaseContextType {
  // Dados
  users: User[];
  schedules: MonthSchedule[];
  swapRequests: SwapRequest[];
  vacationRequests: VacationRequest[];
  auditLogs: AuditLog[];
  currentUser: User | null;
  
  // Estados
  loading: boolean;
  
  // Funções de Usuários
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getUsers: () => Promise<void>;
  createUser: (user: any) => Promise<void>;
  updateUser: (id: string, updates: any) => Promise<void>;
  
  // Funções de Escalas
  getSchedules: () => Promise<void>;
  getScheduleByMonth: (month: number, year: number) => Promise<MonthSchedule | null>;
  createSchedule: (schedule: any) => Promise<void>;
  updateSchedule: (id: string, updates: any) => Promise<void>;
  replaceSchedule: (month: number, year: number, entries: any[], importedBy: string) => Promise<void>;
  
  // Funções de Trocas
  getSwapRequests: () => Promise<void>;
  createSwapRequest: (request: any) => Promise<void>;
  updateSwapRequest: (id: string, updates: any) => Promise<void>;
  applySwapToSchedule: (request: SwapRequest) => Promise<void>;
  
  // Funções de Férias
  getVacationRequests: () => Promise<void>;
  createVacationRequest: (request: any) => Promise<void>;
  updateVacationRequest: (id: string, updates: any) => Promise<void>;
  
  // Funções de Auditoria
  createAuditLog: (log: any) => Promise<void>;
  getAuditLogs: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<MonthSchedule[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Inicialização
  useEffect(() => {
    initializeData();
    
    // Configurar subscriptions real-time
    const schedulesSub = SupabaseAPI.subscribeToSchedules((payload) => {
      console.log('Mudança nas escalas:', payload);
      getSchedules();
    });
    
    const swapsSub = SupabaseAPI.subscribeToSwaps((payload) => {
      console.log('Mudança nas trocas:', payload);
      getSwapRequests();
    });
    
    const vacationsSub = SupabaseAPI.subscribeToVacations((payload) => {
      console.log('Mudança nas férias:', payload);
      getVacationRequests();
    });
    
    // Verificar usuário atual
    checkCurrentUser();
    
    return () => {
      schedulesSub.unsubscribe();
      swapsSub.unsubscribe();
      vacationsSub.unsubscribe();
    };
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        getUsers(),
        getSchedules(),
        getSwapRequests(),
        getVacationRequests(),
        getAuditLogs()
      ]);
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados iniciais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value: SupabaseContextType = {
    // Dados
    users,
    schedules,
    swapRequests,
    vacationRequests,
    auditLogs,
    currentUser,
    
    // Estados
    loading,
    
    // Funções
    getUsers,
    createUser,
    updateUser,
    getSchedules,
    getScheduleByMonth,
    createSchedule,
    updateSchedule,
    replaceSchedule,
    getSwapRequests,
    createSwapRequest,
    updateSwapRequest,
    applySwapToSchedule,
    getVacationRequests,
    createVacationRequest,
    updateVacationRequest,
    createAuditLog,
    getAuditLogs,
  };

  // Funções de Usuários
  const getUsers = async () => {
    try {
      const data = await SupabaseAPI.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  };

  const createUser = async (user: any) => {
    try {
      const newUser = await SupabaseAPI.createUser(user);
      setUsers(prev => [...prev, newUser]);
      
      toast({
        title: "✅ Usuário criado",
        description: `Usuário ${user.name} criado com sucesso`,
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'CREATE_USER',
        details: `Criação do usuário ${user.name}`
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao criar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateUser = async (id: string, updates: any) => {
    try {
      const updatedUser = await SupabaseAPI.updateUser(id, updates);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      toast({
        title: "✅ Usuário atualizado",
        description: `Usuário ${updatedUser.name} atualizado com sucesso`,
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'UPDATE_USER',
        details: `Atualização do usuário ${updatedUser.name}`
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar usuário",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Funções de Escalas
  const getSchedules = async () => {
    try {
      const data = await SupabaseAPI.getMonthSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Erro ao buscar escalas:', error);
      throw error;
    }
  };

  const getScheduleByMonth = async (month: number, year: number): Promise<MonthSchedule | null> => {
    try {
      return await SupabaseAPI.getScheduleByMonth(month, year);
    } catch (error) {
      console.error('Erro ao buscar escala:', error);
      throw error;
    }
  };

  const createSchedule = async (schedule: any) => {
    try {
      const newSchedule = await SupabaseAPI.createSchedule(schedule);
      setSchedules(prev => [...prev, newSchedule]);
      
      toast({
        title: "✅ Escala criada",
        description: `Escala ${schedule.month}/${schedule.year} criada com sucesso`,
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'CREATE_SCHEDULE',
        details: `Criação da escala ${schedule.month}/${schedule.year}`
      });
    } catch (error) {
      console.error('Erro ao criar escala:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao criar escala",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSchedule = async (id: string, updates: any) => {
    try {
      const updatedSchedule = await SupabaseAPI.updateSchedule(id, updates);
      setSchedules(prev => prev.map(s => s.id === id ? updatedSchedule : s));
      
      toast({
        title: "✅ Escala atualizada",
        description: `Escala atualizada com sucesso`,
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'UPDATE_SCHEDULE',
        details: `Atualização da escala ${updatedSchedule.month}/${updatedSchedule.year}`
      });
    } catch (error) {
      console.error('Erro ao atualizar escala:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar escala",
        variant: "destructive"
      });
      throw error;
    }
  };

  const replaceSchedule = async (month: number, year: number, entries: any[], importedBy: string) => {
    try {
      const updatedSchedule = await SupabaseAPI.replaceSchedule(month, year, entries, importedBy);
      setSchedules(prev => {
        const existing = prev.find(s => s.month === month && s.year === year);
        if (existing) {
          return prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
        } else {
          return [...prev, updatedSchedule];
        }
      });
      
      const action = schedules.find(s => s.month === month && s.year === year) ? 'substituída' : 'importada';
      
      toast({
        title: "✅ Escala " + action,
        description: `Escala ${month}/${year} ${action} com sucesso`,
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'REPLACE_SCHEDULE',
        details: `${action === 'substituída' ? 'Substituição' : 'Importação'} da escala ${month}/${year} por ${importedBy}`
      });
    } catch (error) {
      console.error('Erro ao substituir escala:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao substituir escala",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Funções de Trocas
  const getSwapRequests = async () => {
    try {
      const data = await SupabaseAPI.getSwapRequests();
      setSwapRequests(data);
    } catch (error) {
      console.error('Erro ao buscar trocas:', error);
      throw error;
    }
  };

  const createSwapRequest = async (request: any) => {
    try {
      const newRequest = await SupabaseAPI.createSwapRequest(request);
      setSwapRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "✅ Solicitação criada",
        description: "Solicitação de troca criada com sucesso",
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'CREATE_SWAP_REQUEST',
        details: `Criação da solicitação de troca: ${request.requester_name} ⇄ ${request.target_name}`
      });
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao criar solicitação",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSwapRequest = async (id: string, updates: any) => {
    try {
      const updatedRequest = await SupabaseAPI.updateSwapRequest(id, updates);
      setSwapRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));
      
      toast({
        title: "✅ Solicitação atualizada",
        description: "Solicitação atualizada com sucesso",
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'UPDATE_SWAP_REQUEST',
        details: `Atualização da solicitação ${id} - ${updates.status}`
      });
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar solicitação",
        variant: "destructive"
      });
      throw error;
    }
  };

  const applySwapToSchedule = async (request: SwapRequest) => {
    try {
      await SupabaseAPI.applySwapToSchedule(request);
      
      toast({
        title: "✅ Troca aplicada",
        description: "Troca aplicada na escala com sucesso",
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'APPLY_SWAP',
        details: `Aplicação da troca: ${request.requester_name} ⇄ ${request.target_name}`
      });
    } catch (error) {
      console.error('Erro ao aplicar troca:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao aplicar troca",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Funções de Férias
  const getVacationRequests = async () => {
    try {
      const data = await SupabaseAPI.getVacationRequests();
      setVacationRequests(data);
    } catch (error) {
      console.error('Erro ao buscar férias:', error);
      throw error;
    }
  };

  const createVacationRequest = async (request: any) => {
    try {
      const newRequest = await SupabaseAPI.createVacationRequest(request);
      setVacationRequests(prev => [...prev, newRequest]);
      
      toast({
        title: "✅ Solicitação criada",
        description: "Solicitação de férias criada com sucesso",
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'CREATE_VACATION_REQUEST',
        details: `Criação da solicitação de férias: ${request.operator_name}`
      });
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao criar solicitação",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateVacationRequest = async (id: string, updates: any) => {
    try {
      const updatedRequest = await SupabaseAPI.updateVacationRequest(id, updates);
      setVacationRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));
      
      toast({
        title: "✅ Solicitação atualizada",
        description: "Solicitação atualizada com sucesso",
      });
      
      await createAuditLog({
        user_name: currentUser?.name || 'system',
        action: 'UPDATE_VACATION_REQUEST',
        details: `Atualização da solicitação ${id} - ${updates.status}`
      });
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar solicitação",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Funções de Auditoria
  const createAuditLog = async (log: any) => {
    try {
      const newLog = await SupabaseAPI.createAuditLog(log);
      setAuditLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error('Erro ao criar log:', error);
    }
  };

  const getAuditLogs = async () => {
    try {
      const data = await SupabaseAPI.getAuditLogs(100);
      setAuditLogs(data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  };

  const value: SupabaseContextType = {
    // Dados
    users,
    schedules,
    swapRequests,
    vacationRequests,
    auditLogs,
    currentUser,
    
    // Estados
    loading,
    
    // Funções
    signIn,
    signOut,
    getUsers,
    createUser,
    updateUser,
    getSchedules,
    getScheduleByMonth,
    createSchedule,
    updateSchedule,
    replaceSchedule,
    getSwapRequests,
    createSwapRequest,
    updateSwapRequest,
    applySwapToSchedule,
    getVacationRequests,
    createVacationRequest,
    updateVacationRequest,
    createAuditLog,
    getAuditLogs,
  };

  const checkCurrentUser = async () => {
    try {
      const user = await SupabaseAPI.getCurrentUser();
      if (user) {
        // Buscar dados completos do usuário
        const userData = await SupabaseAPI.getUserById(user.id);
        setCurrentUser(userData || null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário atual:', error);
    }
  };

  // Funções de Autenticação
  const signIn = async (email: string, password: string) => {
    try {
      // Para login com nome de usuário, precisamos buscar o email
      const user = users.find(u => u.name === email);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      // Simular login (em produção, usar autenticação real)
      setCurrentUser(user);
      
      toast({
        title: "✅ Login realizado",
        description: `Bem-vindo, ${user.name}!`, 
      });
      
      await createAuditLog({
        user_name: user.name,
        action: 'LOGIN',
        details: `Login do usuário ${user.name}`
      });
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "❌ Erro no login",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (currentUser) {
        await createAuditLog({
          user_name: currentUser.name,
          action: 'LOGOUT',
          details: `Logout do usuário ${currentUser.name}`
        });
      }
      
      setCurrentUser(null);
      
      toast({
        title: "👋 Logout realizado",
        description: "Você saiu do sistema",
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};
