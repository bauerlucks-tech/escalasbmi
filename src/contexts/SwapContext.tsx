import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SwapRequest, 
  ScheduleEntry, 
  getCurrentSchedule, 
  addNewMonthSchedule, 
  archiveSchedule, 
  restoreArchivedSchedule,
  getArchivedSchedules,
  getCurrentSchedules,
  getScheduleByMonth,
  toggleScheduleActivation,
  updateMonthSchedule,
  MonthSchedule,
  ArchivedSchedule
} from '@/data/scheduleData';
import { logSwapRequest, logSwapResponse, logSwapApproval, logScheduleImport } from '@/data/auditLogs';
import { SupabaseAPI, SwapRequestSupabase } from '@/lib/supabase';

interface SwapContextType {
  swapRequests: SwapRequest[];
  scheduleData: ScheduleEntry[];
  currentSchedules: MonthSchedule[];
  archivedSchedules: ArchivedSchedule[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt'>) => void;
  respondToSwap: (requestId: string, accept: boolean) => void;
  adminApproveSwap: (requestId: string, adminName: string) => void;
  applySwapToSchedule: (request: SwapRequest) => Promise<void>;
  getMyRequests: (userId: string) => SwapRequest[];
  getRequestsForMe: (userName: string) => SwapRequest[];
  getPendingCount: (userName: string) => number;
  getPendingAdminApproval: () => SwapRequest[];
  getApprovedSwaps: () => SwapRequest[];
  getMyNotifications: (userId: string, userName: string) => SwapRequest[];
  updateSchedule: (newSchedule: ScheduleEntry[]) => void;
  updateMonthSchedule: (month: number, year: number, entries: ScheduleEntry[]) => Promise<boolean>;
  importNewSchedule: (month: number, year: number, entries: ScheduleEntry[], importedBy: string, activate?: boolean) => { success: boolean; message: string; archived?: ArchivedSchedule[] };
  archiveCurrentSchedule: (month: number, year: number, archivedBy: string) => boolean;
  restoreArchivedSchedule: (month: number, year: number) => boolean;
  switchToSchedule: (month: number, year: number) => boolean;
  toggleScheduleActivation: (month: number, year: number) => boolean;
  refreshSchedules: () => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  // Carregar trocas do Supabase ao iniciar
  useEffect(() => {
    const loadSwapRequests = async () => {
      try {
        console.log('🔄 Carregando solicitações do Supabase...');
        const requests = await SupabaseAPI.getSwapRequests();
        console.log('📊 Solicitações recebidas:', requests);
        
        // Converter tipos do Supabase para o formato local
        const convertedRequests = requests.map(req => ({
          id: req.id,
          requesterId: req.requester_id,
          requesterName: req.requester_name,
          targetId: req.target_id,
          targetName: req.target_name,
          originalDate: req.original_date,
          originalShift: req.original_shift,
          targetDate: req.target_date,
          targetShift: req.target_shift,
          status: req.status,
          respondedAt: req.responded_at,
          respondedBy: req.responded_by,
          adminApproved: req.admin_approved,
          adminApprovedAt: req.admin_approved_at,
          adminApprovedBy: req.admin_approved_by,
          createdAt: req.created_at,
          // Manter campos originais também para compatibilidade
          requester_id: req.requester_id,
          requester_name: req.requester_name,
          target_id: req.target_id,
          target_name: req.target_name,
          original_date: req.original_date,
          original_shift: req.original_shift,
          target_date: req.target_date,
          target_shift: req.target_shift,
          created_at: req.created_at
        }));
        
        console.log('✅ Solicitações convertidas:', convertedRequests);
        setSwapRequests(convertedRequests);
      } catch (error) {
        console.error('❌ Erro ao carregar trocas do Supabase:', error);
        // Fallback para localStorage se Supabase falhar
        console.log('🔄 Usando fallback localStorage...');
        const saved = localStorage.getItem('escala_swapRequests');
        if (saved) {
          const localRequests = JSON.parse(saved);
          console.log('📊 Solicitações do localStorage:', localRequests);
          setSwapRequests(localRequests);
        }
      }
    };
    
    loadSwapRequests();
    
    // Configurar intervalo para recarregar dados a cada 10 segundos
    const interval = setInterval(loadSwapRequests, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(() => {
    // Carregar dados do Supabase via localStorage ou usar dados ativos do sistema
    try {
      // Buscar do Supabase (escala_scheduleStorage)
      const saved = localStorage.getItem('escala_scheduleStorage');
      if (saved) {
        const schedules = JSON.parse(saved);
        if (Array.isArray(schedules)) {
          // Encontrar schedule ativo mais recente
          const activeSchedule = schedules.find(s => s.is_active !== false);
          if (activeSchedule && activeSchedule.entries) {
            console.log('📅 Dados carregados do Supabase:', activeSchedule.entries.length, 'dias');
            return activeSchedule.entries;
          }
        }
      }
      
      // Fallback: buscar do schedule ativo local
      const currentSchedule = getCurrentSchedule();
      if (currentSchedule && currentSchedule.entries.length > 0) {
        console.log('📅 Dados carregados do schedule ativo local:', currentSchedule.entries.length, 'dias');
        return currentSchedule.entries;
      }
      
      console.log('📅 Nenhum dado encontrado, iniciando com array vazio');
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      return [];
    }
  });

  const [currentSchedules, setCurrentSchedules] = useState<MonthSchedule[]>([]);

  // Carregar escalas do Supabase ao iniciar
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        console.log('🔄 Carregando escalas do Supabase...');
        const schedules = await SupabaseAPI.getMonthSchedules();
        console.log('📅 Escalas recebidas:', schedules);
        
        setCurrentSchedules(schedules);
        
        // Encontrar schedule ativo mais recente
        const activeSchedule = schedules.find(s => s.is_active !== false);
        if (activeSchedule && activeSchedule.entries) {
          console.log('📅 Schedule ativo encontrado:', activeSchedule.month, '/', activeSchedule.year);
          setScheduleData(activeSchedule.entries);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar escalas do Supabase:', error);
        // Fallback para localStorage
        const schedules = getCurrentSchedules();
        setCurrentSchedules(schedules);
      }
    };
    
    loadSchedules();
  }, []);

  const [archivedSchedules, setArchivedSchedules] = useState<ArchivedSchedule[]>(() => {
    return getArchivedSchedules();
  });

  useEffect(() => {
    localStorage.setItem('escala_swapRequests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  // NÃO salvar mais em escala_scheduleData - isso estava sobrescrevendo dados do Supabase
  // useEffect(() => {
  //   localStorage.setItem('escala_scheduleData', JSON.stringify(scheduleData));
  // }, [scheduleData]);

  // Sincronizar scheduleData com o schedule ativo atual
  useEffect(() => {
    const activeSchedule = currentSchedules.find(s => s.isActive !== false);
    if (activeSchedule && activeSchedule.entries.length > 0) {
      console.log('🔄 Sincronizando scheduleData com schedule ativo:', activeSchedule.month, activeSchedule.year);
      setScheduleData(activeSchedule.entries);
    }
  }, [currentSchedules]);

  const updateSchedule = (newSchedule: ScheduleEntry[]) => {
    setScheduleData(newSchedule);
  };

  const refreshSchedules = async () => {
    try {
      console.log('🔄 Recarregando escalas do Supabase...');
      const schedules = await SupabaseAPI.getMonthSchedules();
      setCurrentSchedules(schedules);
      setArchivedSchedules(getArchivedSchedules());
    } catch (error) {
      console.error('❌ Erro ao recarregar escalas:', error);
      // Fallback para localStorage
      setCurrentSchedules(getCurrentSchedules());
      setArchivedSchedules(getArchivedSchedules());
    }
  };

  const updateMonthScheduleFunc = async (month: number, year: number, entries: ScheduleEntry[]) => {
    try {
      console.log('🔄 Atualizando schedule no Supabase:', { month, year });
      await SupabaseAPI.updateMonthSchedule(month, year, entries);
      
      // Recarregar schedules do Supabase
      await refreshSchedules();
      
      // Update current schedule data if this is the active schedule
      const currentSchedule = currentSchedules.find(s => s.month === month && s.year === year);
      if (currentSchedule && currentSchedule.is_active !== false) {
        setScheduleData(entries);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar schedule no Supabase:', error);
      // Fallback para localStorage
      const success = updateMonthSchedule(month, year, entries);
      if (success) {
        refreshSchedules();
        const currentSchedule = currentSchedules.find(s => s.month === month && s.year === year);
        if (currentSchedule && currentSchedule.is_active !== false) {
          setScheduleData(entries);
        }
      }
      return success;
    }
  };

  const applySwapToSchedule = async (request: SwapRequest) => {
    console.log('🚀 INICIANDO applySwapToSchedule para:', request);
    
    // Get the month and year for both dates
    const originalDate = new Date(request.originalDate);
    const targetDate = new Date(request.targetDate);
    const originalMonth = originalDate.getMonth() + 1;
    const originalYear = originalDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();
    
    console.log('📅 Datas processadas:', {
      originalDate: request.originalDate,
      targetDate: request.targetDate,
      originalMonth,
      originalYear,
      targetMonth,
      targetYear
    });
    
    // Find the correct month schedules
    const originalMonthSchedule = currentSchedules.find(s => s.month === originalMonth && s.year === originalYear);
    const targetMonthSchedule = currentSchedules.find(s => s.month === targetMonth && s.year === targetYear);
    
    console.log('📋 Schedules encontrados:', {
      originalSchedule: originalMonthSchedule ? `${originalMonth}/${originalYear}` : 'NÃO ENCONTRADO',
      targetSchedule: targetMonthSchedule ? `${targetMonth}/${targetYear}` : 'NÃO ENCONTRADO',
      totalSchedules: currentSchedules.length
    });
    
    if (!originalMonthSchedule || !targetMonthSchedule) {
      console.error('❌ Escalas mensais não encontradas para:', request.originalDate, request.targetDate);
      throw new Error('Escalas mensais não encontradas');
    }

    // Find the entries for both dates in their respective month schedules
    const originalEntry = originalMonthSchedule.entries.find(e => e.date === request.originalDate);
    const targetEntry = targetMonthSchedule.entries.find(e => e.date === request.targetDate);
    
    console.log('🔍 Entradas encontradas:', {
      originalEntry: originalEntry ? `${request.originalDate}: ${JSON.stringify(originalEntry)}` : 'NÃO ENCONTRADA',
      targetEntry: targetEntry ? `${request.targetDate}: ${JSON.stringify(targetEntry)}` : 'NÃO ENCONTRADA',
      totalOriginalEntries: originalMonthSchedule.entries.length,
      totalTargetEntries: targetMonthSchedule.entries.length,
      originalDates: originalMonthSchedule.entries.map(e => e.date).slice(0, 5),
      targetDates: targetMonthSchedule.entries.map(e => e.date).slice(0, 5)
    });
    
    if (!originalEntry || !targetEntry) {
      console.error('❌ Entradas não encontradas para as datas:', request.originalDate, request.targetDate);
      throw new Error('Entradas não encontradas para as datas');
    }

    // Determine which shift the requester has on their original date
    const requesterShift = originalEntry.meioPeriodo === request.requesterName 
      ? 'meioPeriodo' 
      : originalEntry.fechamento === request.requesterName 
        ? 'fechamento' 
        : null;
    
    // Determine which shift the target has on their target date
    const targetShift = request.targetShift || 
      (targetEntry.meioPeriodo === request.targetName 
        ? 'meioPeriodo' 
        : 'fechamento');

    console.log('🔄 Turnos identificados:', {
      requesterShift,
      targetShift,
      originalEntryMeio: originalEntry.meioPeriodo,
      originalEntryFech: originalEntry.fechamento,
      targetEntryMeio: targetEntry.meioPeriodo,
      targetEntryFech: targetEntry.fechamento
    });

    if (!requesterShift) {
      console.error('❌ Turno do solicitante não encontrado:', request.requesterName);
      throw new Error('Turno do solicitante não encontrado na escala');
    }

    console.log('🔄 Aplicando troca:', {
      originalDate: request.originalDate,
      targetDate: request.targetDate,
      requesterName: request.requesterName,
      targetName: request.targetName,
      requesterShift,
      targetShift
    });

    // Update both month schedules
    let updatedOriginalSchedule = [...originalMonthSchedule.entries];
    let updatedTargetSchedule = [...targetMonthSchedule.entries];
    
    // Update original date - replace requester with target
    updatedOriginalSchedule = updatedOriginalSchedule.map(entry => {
      if (entry.date === request.originalDate) {
        return {
          ...entry,
          [requesterShift]: request.targetName
        };
      }
      return entry;
    });
    
    // Update target date - replace target with requester
    updatedTargetSchedule = updatedTargetSchedule.map(entry => {
      if (entry.date === request.targetDate) {
        return {
          ...entry,
          [targetShift]: request.requesterName
        };
      }
      return entry;
    });

    // Update both months in Supabase storage
    console.log('🔄 Atualizando escalas no Supabase...');
    try {
      const originalSuccess = await updateMonthScheduleFunc(originalMonth, originalYear, updatedOriginalSchedule);
      const targetSuccess = await updateMonthScheduleFunc(targetMonth, targetYear, updatedTargetSchedule);
      
      console.log('📊 Resultados das atualizações:', {
        originalSuccess,
        targetSuccess,
        originalMonth: `${originalMonth}/${originalYear}`,
        targetMonth: `${targetMonth}/${targetYear}`
      });
      
      if (originalSuccess && targetSuccess) {
        console.log('✅ Ambas as escalas mensais atualizadas com sucesso no Supabase!');
        
        // Forçar refresh dos schedules para pegar os dados atualizados do Supabase
        console.log('🔄 Forçando refresh dos schedules...');
        await refreshSchedules();
        
        // Atualizar scheduleData após refresh para garantir dados atualizados
        setTimeout(() => {
          // Buscar o schedule atualizado do mês correto
          const updatedSchedule = getScheduleByMonth(originalMonth, originalYear);
          if (updatedSchedule && updatedSchedule.entries) {
            console.log('🔄 Atualizando scheduleData com dados mais recentes:', updatedSchedule.month, updatedSchedule.year);
            setScheduleData(updatedSchedule.entries);
          }
          
          // Forçar atualização do localStorage para todos os usuários
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'escala_scheduleStorage',
            newValue: localStorage.getItem('escala_scheduleStorage')
          }));
        }, 200);
        
      } else {
        console.error('❌ Falha ao atualizar escalas mensais no Supabase');
        throw new Error('Falha ao atualizar escalas no Supabase');
      }
    } catch (error) {
      console.error('❌ Erro durante atualização das escalas:', error);
      throw error;
    }
  };

  const createSwapRequest = async (request: Omit<SwapRequest, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Creating swap request:', request);
      
      // Validate required fields
      if (!request.requesterId || !request.requesterName || !request.targetId || !request.targetName ||
          !request.originalDate || !request.targetDate || !request.originalShift || !request.targetShift) {
        console.error('❌ Invalid swap request data:', request);
        throw new Error('Dados da solicitação de troca inválidos');
      }
      
      // Mapear nomes para UUIDs - usando IDs reais do Supabase
      const userUUIDs: { [key: string]: string } = {
        'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
        'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
        'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
        'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
        'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc'
      };
      
      const requesterUUID = userUUIDs[request.requesterName] || request.requesterId;
      const targetUUID = userUUIDs[request.targetName] || request.targetId;
      
      // Converter formato local para formato Supabase
      const supabaseRequest = {
        requester_id: requesterUUID,
        requester_name: request.requesterName,
        target_id: targetUUID,
        target_name: request.targetName,
        original_date: request.originalDate,
        original_shift: request.originalShift,
        target_date: request.targetDate,
        target_shift: request.targetShift,
        status: request.status || 'pending',
        responded_at: request.respondedAt,
        responded_by: request.respondedBy,
        admin_approved: request.adminApproved,
        admin_approved_at: request.adminApprovedAt,
        admin_approved_by: request.adminApprovedBy
      };
      
      console.log('📝 Enviando para Supabase:', supabaseRequest);
      
      // Criar no Supabase
      const newRequest = await SupabaseAPI.createSwapRequest(supabaseRequest);
      console.log('✅ Swap request created in Supabase:', newRequest);
      
      // Converter resposta de volta para formato local
      const convertedRequest = {
        id: newRequest.id,
        requesterId: newRequest.requester_id,
        requesterName: newRequest.requester_name,
        targetId: newRequest.target_id,
        targetName: newRequest.target_name,
        originalDate: newRequest.original_date,
        originalShift: newRequest.original_shift,
        targetDate: newRequest.target_date,
        targetShift: newRequest.target_shift,
        status: newRequest.status,
        respondedAt: newRequest.responded_at,
        respondedBy: newRequest.responded_by,
        adminApproved: newRequest.admin_approved,
        adminApprovedAt: newRequest.admin_approved_at,
        adminApprovedBy: newRequest.admin_approved_by,
        createdAt: newRequest.created_at
      };
      
      // Atualizar estado local
      setSwapRequests(prev => [...prev, convertedRequest]);
      
      // Forçar refresh dos dados do Supabase para garantir sincronização
      setTimeout(async () => {
        try {
          console.log('🔄 Forçando refresh dos dados do Supabase...');
          const requests = await SupabaseAPI.getSwapRequests();
          const convertedRequests = requests.map(req => ({
            id: req.id,
            requesterId: req.requester_id,
            requesterName: req.requester_name,
            targetId: req.target_id,
            targetName: req.target_name,
            originalDate: req.original_date,
            originalShift: req.original_shift,
            targetDate: req.target_date,
            targetShift: req.target_shift,
            status: req.status,
            respondedAt: req.responded_at,
            respondedBy: req.responded_by,
            adminApproved: req.admin_approved,
            adminApprovedAt: req.admin_approved_at,
            adminApprovedBy: req.admin_approved_by,
            createdAt: req.created_at,
          }));
          setSwapRequests(convertedRequests);
          console.log('✅ Dados sincronizados após criação da solicitação');
        } catch (error) {
          console.error('❌ Erro ao sincronizar dados:', error);
        }
      }, 1000); // Aguardar 1 segundo para garantir que o Supabase processou
      
      // Log de auditoria
      await SupabaseAPI.addAuditLog(
        request.requesterId || 'unknown',
        request.requesterName,
        'SWAP_REQUEST',
        `SOLICITAÇÃO DE TROCA: ${request.requesterName} ⇄ ${request.targetName} - ${request.originalDate} ⇄ ${request.targetDate}`
      );
      
      console.log('✅ Swap request process completed successfully');
      return convertedRequest;
    } catch (error) {
      console.error('❌ Erro ao criar solicitação no Supabase:', error);
      
      // Fallback para localStorage
      const newRequest: SwapRequest = {
        ...request,
        id: `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
      };
      
      setSwapRequests(prev => [...prev, newRequest]);
      localStorage.setItem('escala_swapRequests', JSON.stringify([...swapRequests, newRequest]));
      
      return newRequest;
    }
  };

  const respondToSwap = async (requestId: string, accept: boolean) => {
    const request = swapRequests.find(req => req.id === requestId);
    
    try {
      // Atualizar no Supabase primeiro
      const updates = {
        status: accept ? 'accepted' as const : 'rejected' as const,
        responded_at: new Date().toISOString(),
        responded_by: request?.targetName || ''
      };
      
      await SupabaseAPI.updateSwapRequest(requestId, updates);
      
      // Atualizar estado local
      setSwapRequests(prev => prev.map(req =>
        req.id === requestId
          ? { 
              ...req, 
              status: accept ? 'accepted' : 'rejected',
              respondedAt: new Date().toISOString(),
              respondedBy: req.targetName
            }
          : req
      ));
      
      // Log de auditoria - Resposta à troca
      if (request) {
        await SupabaseAPI.addAuditLog(
          request.targetId, 
          request.targetName, 
          'SWAP_RESPONSE',
          `Resposta à solicitação de troca: ${accept ? 'ACEITA' : 'REJEITADA'} - ${request.originalDate} ⇄ ${request.targetDate} com ${request.requesterName}`
        );

        // NOTIFICAÇÃO PARA O SOLICITANTE sobre a resposta
        await SupabaseAPI.addAuditLog(
          request.requesterId || 'unknown',
          request.requesterName,
          'SWAP_RESPONSE',
          `${accept ? '✅ TROCA ACEITA' : '❌ TROCA REJEITADA'}: ${request.originalDate} ⇄ ${request.targetDate} com ${request.targetName} - ${accept ? 'Aguardando aprovação admin' : 'Solicitação rejeitada'}`
        );
      }
      
      console.log('✅ Troca respondida no Supabase:', { requestId, accept, status: updates.status });
    } catch (error) {
      console.error('❌ Erro ao responder troca no Supabase:', error);
      
      // Fallback - apenas atualizar local
      setSwapRequests(prev => prev.map(req =>
        req.id === requestId
          ? { 
              ...req, 
              status: accept ? 'accepted' : 'rejected',
              respondedAt: new Date().toISOString(),
              respondedBy: req.targetName
            }
          : req
      ));
    }
  };

  const adminApproveSwap = async (requestId: string, adminName: string) => {
    const request = swapRequests.find(r => r.id === requestId);
    
    try {
      // Atualizar no Supabase primeiro
      const updates = {
        status: 'approved' as const,
        admin_approved: true,
        admin_approved_at: new Date().toISOString(),
        admin_approved_by: adminName
      };
      
      await SupabaseAPI.updateSwapRequest(requestId, updates);
      
      // Atualizar estado local
      setSwapRequests(prev => prev.map(req =>
        req.id === requestId
          ? { 
              ...req, 
              status: 'approved' as const,
              adminApproved: true,
              adminApprovedAt: new Date().toISOString(),
              adminApprovedBy: adminName
            }
          : req
      ));

      // Função para notificar todos os participantes
      const notifyAllParticipants = async (request: SwapRequest, adminName: string, success: boolean, error?: any) => {
        if (success) {
          // NOTIFICAÇÃO PARA O SOLICITANTE - Troca aprovada e publicada (DEPOIS de aplicada)
          await SupabaseAPI.addAuditLog(
            request.requesterId || 'unknown',
            request.requesterName,
            'SWAP_APPROVAL',
            `✅ TROCA PUBLICADA: ${request.originalDate} ⇄ ${request.targetDate} com ${request.targetName} - Aprovada por ${adminName} - ESCALA ATUALIZADA`
          );

          // NOTIFICAÇÃO PARA O ACEITANTE - Troca aprovada e publicada (DEPOIS de aplicada)
          await SupabaseAPI.addAuditLog(
            request.targetId || 'unknown',
            request.targetName,
            'SWAP_APPROVAL',
            `✅ TROCA PUBLICADA: ${request.originalDate} ⇄ ${request.targetDate} com ${request.requesterName} - Aprovada por ${adminName} - ESCALA ATUALIZADA`
          );
        } else {
          // NOTIFICAÇÃO DE FALHA
          const errorMsg = error?.message || 'Erro desconhecido';
          await SupabaseAPI.addAuditLog(
            request.requesterId || 'unknown',
            request.requesterName,
            'SWAP_APPROVAL',
            `❌ FALHA NA PUBLICAÇÃO: ${request.originalDate} ⇄ ${request.targetDate} - Erro: ${errorMsg}`
          );
          
          await SupabaseAPI.addAuditLog(
            request.targetId || 'unknown',
            request.targetName,
            'SWAP_APPROVAL',
            `❌ FALHA NA PUBLICAÇÃO: ${request.originalDate} ⇄ ${request.targetDate} - Erro: ${errorMsg}`
          );
        }
      };

      // Apply the swap to the schedule FIRST - ANTES de notificar
      if (request) {
        console.log('🔄 Aplicando troca na escala ANTES das notificações...');
        try {
          await applySwapToSchedule({
            ...request,
            status: 'approved',
            adminApproved: true,
            adminApprovedAt: new Date().toISOString(),
            adminApprovedBy: adminName
          });
          console.log('✅ Troca aplicada na escala com sucesso!');
          
          // SÓ notificar SE a troca foi aplicada com sucesso
          await notifyAllParticipants(request, adminName, true);
          
        } catch (error) {
          console.error('❌ Falha ao aplicar troca na escala:', error);
          
          // Notificar sobre falha
          await notifyAllParticipants(request, adminName, false, error);
          
          // Não continuar com aprovação se falhou
          throw error;
        }
      }

      // Log de auditoria - Aprovação admin
      if (request) {
        await SupabaseAPI.addAuditLog(
          'admin', // ID do admin (genérico)
          adminName, 
          'SWAP_APPROVAL',
          `APROVAÇÃO DE TROCA: ${request.requesterName} ⇄ ${request.targetName} - ${request.originalDate} ⇄ ${request.targetDate}`
        );
        
        // Apply swap to schedule DEPOIS de aprovar no banco
        console.log('🔄 Aplicando troca na escala após aprovação admin...');
        try {
          await applySwapToSchedule({
            ...request,
            status: 'approved',
            adminApproved: true,
            adminApprovedAt: new Date().toISOString(),
            adminApprovedBy: adminName
          });
          console.log('✅ Troca aplicada na escala com sucesso!');
          
          // Notificar sucesso
          await SupabaseAPI.addAuditLog(
            request.requesterId || 'unknown',
            request.requesterName,
            'SWAP_APPROVAL',
            `✅ TROCA PUBLICADA: ${request.originalDate} ⇄ ${request.targetDate} com ${request.targetName} - Aprovada por ${adminName} - ESCALA ATUALIZADA`
          );
          
          await SupabaseAPI.addAuditLog(
            request.targetId || 'unknown',
            request.targetName,
            'SWAP_APPROVAL',
            `✅ TROCA PUBLICADA: ${request.originalDate} ⇄ ${request.targetDate} com ${request.requesterName} - Aprovada por ${adminName} - ESCALA ATUALIZADA`
          );
          
        } catch (error) {
          console.error('❌ Falha ao aplicar troca na escala:', error);
          
          // Notificar falha
          await SupabaseAPI.addAuditLog(
            request.requesterId || 'unknown',
            request.requesterName,
            'SWAP_APPROVAL',
            `❌ FALHA NA PUBLICAÇÃO: ${request.originalDate} ⇄ ${request.targetDate} - Erro: ${error}`
          );
          
          await SupabaseAPI.addAuditLog(
            request.targetId || 'unknown',
            request.targetName,
            'SWAP_APPROVAL',
            `❌ FALHA NA PUBLICAÇÃO: ${request.originalDate} ⇄ ${request.targetDate} - Erro: ${error}`
          );
        }
      }
      
      console.log('✅ Troca aprovada no Supabase:', { requestId, adminName });
    } catch (error) {
      console.error('❌ Erro ao aprovar troca no Supabase:', error);
      
      // Fallback - apenas atualizar local
      setSwapRequests(prev => prev.map(req =>
        req.id === requestId
          ? { 
              ...req, 
              status: 'approved' as const,
              adminApproved: true,
              adminApprovedAt: new Date().toISOString(),
              adminApprovedBy: adminName
            }
          : req
      ));
    }
  };

  const getMyRequests = (userId: string) => {
    return swapRequests.filter(req => req.requesterId === userId);
  };

  const getRequestsForMe = (userName: string) => {
    const requests = swapRequests.filter(req => req.targetName === userName && req.status === 'pending');
    console.log('🔍 getRequestsForMe Debug:', {
      userName,
      totalSwapRequests: swapRequests.length,
      pendingRequests: requests.length,
      allRequestsForUser: swapRequests.filter(req => req.targetName === userName),
      pendingRequestsDetails: requests
    });
    return requests;
  };

  const getPendingCount = (userName: string) => {
    return swapRequests.filter(req => req.targetName === userName && req.status === 'pending').length;
  };

  const getPendingAdminApproval = () => {
    return swapRequests.filter(req => req.status === 'accepted');
  };

  const getApprovedSwaps = () => {
    return swapRequests.filter(req => req.status === 'approved');
  };

  // Função para obter notificações do usuário atual
  const getMyNotifications = (userId: string, userName: string) => {
    return swapRequests.filter(req => 
      (req.requesterId === userId && req.status === 'approved') || // Minhas solicitações aprovadas
      (req.targetName === userName && (req.status === 'pending' || req.status === 'accepted')) // Solicitações para mim
    );
  };

  const importNewSchedule = (month: number, year: number, entries: ScheduleEntry[], importedBy: string, activate = true, replace = false) => {
    const result = addNewMonthSchedule(month, year, entries, importedBy, activate, replace);
    
    // Log de auditoria - Importação de escala
    const action = replace ? 'Substituição' : 'Importação';
    logScheduleImport(
      'admin', // ID do admin (genérico)
      importedBy, 
      `${action} de escala: ${month}/${year} com ${entries.length} dias`
    );
    
    if (result.success) {
      refreshSchedules();
      // Switch to the newly imported schedule
      switchToSchedule(month, year);
    }
    return result;
  };

  const archiveCurrentSchedule = (month: number, year: number, archivedBy: string) => {
    const success = archiveSchedule(month, year, archivedBy);
    if (success) {
      refreshSchedules();
      // Switch to the most recent schedule
      const schedules = getCurrentSchedules();
      if (schedules.length > 0) {
        switchToSchedule(schedules[0].month, schedules[0].year);
      }
    }
    return success;
  };

  const restoreArchivedScheduleFunc = (month: number, year: number) => {
    const success = restoreArchivedSchedule(month, year);
    if (success) {
      refreshSchedules();
      switchToSchedule(month, year);
    }
    return success;
  };

  const switchToSchedule = (month: number, year: number) => {
    const schedule = getScheduleByMonth(month, year);
    if (schedule) {
      setScheduleData(schedule.entries);
      return true;
    }
    return false;
  };

  const toggleScheduleActivationFunc = (month: number, year: number) => {
    const success = toggleScheduleActivation(month, year);
    if (success) {
      refreshSchedules();
    }
    return success;
  };

  return (
    <SwapContext.Provider value={{
      swapRequests,
      scheduleData,
      currentSchedules,
      archivedSchedules,
      createSwapRequest,
      respondToSwap,
      adminApproveSwap,
      applySwapToSchedule,
      getMyRequests,
      getRequestsForMe,
      getPendingCount,
      getPendingAdminApproval,
      getApprovedSwaps,
      getMyNotifications,
      updateSchedule,
      updateMonthSchedule: updateMonthScheduleFunc,
      importNewSchedule,
      archiveCurrentSchedule,
      restoreArchivedSchedule: restoreArchivedScheduleFunc,
      switchToSchedule,
      toggleScheduleActivation: toggleScheduleActivationFunc,
      refreshSchedules,
    }}>
      {children}
    </SwapContext.Provider>
  );
};

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error('useSwap must be used within a SwapProvider');
  }
  return context;
};

// Função de teste para debugging - exposta globalmente
if (typeof window !== 'undefined') {
  (window as any).testApplySwap = async () => {
    console.log('🧪 INICIANDO TESTE MANUAL applySwapToSchedule');
    try {
      const { applySwapToSchedule } = useSwap();
      await applySwapToSchedule({
        id: '59590e15-adfe-4171-a3b0-8f8483d22bc6',
        requesterId: '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
        requesterName: 'LUCAS',
        targetId: 'fd38b592-2986-430e-98be-d9d104d90442',
        targetName: 'CARLOS',
        originalDate: '16/09/2026',
        originalShift: 'meioPeriodo',
        targetDate: '15/09/2026',
        targetShift: 'meioPeriodo',
        status: 'approved',
        adminApproved: true,
        adminApprovedAt: new Date().toISOString(),
        adminApprovedBy: 'TESTE',
        createdAt: new Date().toISOString()
      });
      console.log('✅ TESTE MANUAL CONCLUÍDO COM SUCESSO');
    } catch (error) {
      console.error('❌ ERRO NO TESTE MANUAL:', error);
    }
  };
}
