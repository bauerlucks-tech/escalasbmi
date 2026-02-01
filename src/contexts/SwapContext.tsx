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

interface SwapContextType {
  swapRequests: SwapRequest[];
  scheduleData: ScheduleEntry[];
  currentSchedules: MonthSchedule[];
  archivedSchedules: ArchivedSchedule[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt'>) => void;
  respondToSwap: (requestId: string, accept: boolean) => void;
  adminApproveSwap: (requestId: string, adminName: string) => void;
  getMyRequests: (userId: string) => SwapRequest[];
  getRequestsForMe: (userName: string) => SwapRequest[];
  getPendingCount: (userName: string) => number;
  getPendingAdminApproval: () => SwapRequest[];
  getApprovedSwaps: () => SwapRequest[];
  updateSchedule: (newSchedule: ScheduleEntry[]) => void;
  updateMonthSchedule: (month: number, year: number, entries: ScheduleEntry[]) => boolean;
  importNewSchedule: (month: number, year: number, entries: ScheduleEntry[], importedBy: string, activate?: boolean) => { success: boolean; message: string; archived?: ArchivedSchedule[] };
  archiveCurrentSchedule: (month: number, year: number, archivedBy: string) => boolean;
  restoreArchivedSchedule: (month: number, year: number) => boolean;
  switchToSchedule: (month: number, year: number) => boolean;
  toggleScheduleActivation: (month: number, year: number) => boolean;
  refreshSchedules: () => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(() => {
    const saved = localStorage.getItem('escala_swapRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(() => {
    // Carregar dados do localStorage ou usar dados ativos do sistema
    try {
      const saved = localStorage.getItem('escala_scheduleData');
      if (saved) {
        const data = JSON.parse(saved);
        console.log('📅 Dados carregados do localStorage:', data.length, 'dias');
        return data;
      }
      
      // Se não houver dados no localStorage, tentar obter do schedule ativo
      const currentSchedule = getCurrentSchedule();
      if (currentSchedule && currentSchedule.entries.length > 0) {
        console.log('📅 Dados carregados do schedule ativo:', currentSchedule.entries.length, 'dias');
        return currentSchedule.entries;
      }
      
      console.log('📅 Nenhum dado encontrado, iniciando com array vazio');
      return [];
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      return [];
    }
  });

  const [currentSchedules, setCurrentSchedules] = useState<MonthSchedule[]>(() => {
    const schedules = getCurrentSchedules();
    console.log('📅 Schedules carregados:', schedules.length, 'meses');
    schedules.forEach(s => {
      console.log(`  - ${s.month}/${s.year}: ${s.entries.length} dias (ativo: ${s.isActive})`);
    });
    return schedules;
  });

  const [archivedSchedules, setArchivedSchedules] = useState<ArchivedSchedule[]>(() => {
    return getArchivedSchedules();
  });

  useEffect(() => {
    localStorage.setItem('escala_swapRequests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem('escala_scheduleData', JSON.stringify(scheduleData));
  }, [scheduleData]);

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

  const updateMonthScheduleFunc = (month: number, year: number, entries: ScheduleEntry[]) => {
    const success = updateMonthSchedule(month, year, entries);
    if (success) {
      refreshSchedules();
      // Update current schedule data if this is the active schedule
      const currentSchedule = currentSchedules.find(s => s.month === month && s.year === year);
      if (currentSchedule && currentSchedule.isActive !== false) {
        setScheduleData(entries);
      }
    }
    return success;
  };

  const applySwapToSchedule = (request: SwapRequest) => {
    // Get the month and year for both dates
    const originalDate = new Date(request.originalDate);
    const targetDate = new Date(request.targetDate);
    const originalMonth = originalDate.getMonth() + 1;
    const originalYear = originalDate.getFullYear();
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();
    
    // Find the correct month schedules
    const originalMonthSchedule = currentSchedules.find(s => s.month === originalMonth && s.year === originalYear);
    const targetMonthSchedule = currentSchedules.find(s => s.month === targetMonth && s.year === targetYear);
    
    if (!originalMonthSchedule || !targetMonthSchedule) {
      console.warn('❌ Escalas mensais não encontradas para:', request.originalDate, request.targetDate);
      return;
    }

    // Find the entries for both dates in their respective month schedules
    const originalEntry = originalMonthSchedule.entries.find(e => e.date === request.originalDate);
    const targetEntry = targetMonthSchedule.entries.find(e => e.date === request.targetDate);
    
    if (!originalEntry || !targetEntry) {
      console.warn('❌ Entradas não encontradas para as datas:', request.originalDate, request.targetDate);
      return;
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

    if (!requesterShift) {
      console.warn('❌ Turno do solicitante não encontrado:', request.requesterName);
      return;
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

    // Update both months in storage
    const originalSuccess = updateMonthScheduleFunc(originalMonth, originalYear, updatedOriginalSchedule);
    const targetSuccess = updateMonthScheduleFunc(targetMonth, targetYear, updatedTargetSchedule);
    
    if (originalSuccess && targetSuccess) {
      console.log('✅ Ambas as escalas mensais atualizadas com sucesso!');
      
      // Forçar refresh dos schedules para pegar os dados atualizados
      refreshSchedules();
      
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
      console.error('❌ Falha ao atualizar escalas mensais');
    }
  };

  const createSwapRequest = (request: Omit<SwapRequest, 'id' | 'createdAt'>) => {
    const newRequest: SwapRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    // Log de auditoria - Solicitação de troca
    logSwapRequest(
      request.requesterId, 
      request.requesterName, 
      `Solicitação de troca: ${request.originalDate} (${request.originalShift}) ⇄ ${request.targetDate} (${request.targetShift}) com ${request.targetName}`
    );
    
    setSwapRequests(prev => [...prev, newRequest]);
  };

  const respondToSwap = (requestId: string, accept: boolean) => {
    const request = swapRequests.find(req => req.id === requestId);
    
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
      logSwapResponse(
        request.targetId, 
        request.targetName, 
        `Resposta à solicitação de troca: ${accept ? 'ACEITA' : 'REJEITADA'} - ${request.originalDate} ⇄ ${request.targetDate} com ${request.requesterName}`
      );
    }
  };

  const adminApproveSwap = (requestId: string, adminName: string) => {
    const request = swapRequests.find(r => r.id === requestId);
    
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

    // Log de auditoria - Aprovação admin
    if (request) {
      logSwapApproval(
        'admin', // ID do admin (genérico)
        adminName, 
        `APROVAÇÃO DE TROCA: ${request.requesterName} ⇄ ${request.targetName} - ${request.originalDate} ⇄ ${request.targetDate}`
      );
    }

    // Apply the swap to the schedule when approved
    if (request) {
      applySwapToSchedule({
        ...request,
        status: 'approved',
        adminApproved: true,
        adminApprovedAt: new Date().toISOString(),
        adminApprovedBy: adminName
      });
    }
  };

  const getMyRequests = (userId: string) => {
    return swapRequests.filter(req => req.requesterId === userId);
  };

  const getRequestsForMe = (userName: string) => {
    return swapRequests.filter(req => req.targetName === userName && req.status === 'pending');
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

  const refreshSchedules = () => {
    setCurrentSchedules(getCurrentSchedules());
    setArchivedSchedules(getArchivedSchedules());
    // Manter o scheduleData atual, não forçar Janeiro
    // Isso permite que as trocas sejam mantidas
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
      getMyRequests,
      getRequestsForMe,
      getPendingCount,
      getPendingAdminApproval,
      getApprovedSwaps,
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
