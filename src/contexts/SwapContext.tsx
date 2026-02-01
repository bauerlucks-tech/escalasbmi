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
    // FORÇAR DADOS DE JANEIRO DIRETAMENTE - Sem verificação
    console.log('� FORÇANDO JANEIRO DIRETAMENTE NO ESTADO INICIAL...');
    try {
      // Importar dados completos de Janeiro diretamente
      const januaryData = [
        { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "CARLOS" },
        { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
        { date: "03/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
        { date: "04/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
        { date: "05/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "ROSANA", fechamento: "KELLY" },
        { date: "06/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
        { date: "07/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
        { date: "08/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
        { date: "09/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
        { date: "10/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
        { date: "11/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
        { date: "12/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "LUCAS", fechamento: "ROSANA" },
        { date: "13/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
        { date: "14/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
        { date: "15/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
        { date: "16/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
        { date: "17/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
        { date: "18/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
        { date: "19/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
        { date: "20/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
        { date: "21/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
        { date: "22/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
        { date: "23/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
        { date: "24/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
        { date: "25/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
        { date: "26/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
        { date: "27/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
        { date: "28/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
        { date: "29/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
        { date: "30/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
        { date: "31/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "CARLOS", fechamento: "ROSANA" }
      ];
      
      console.log('✅ JANEIRO APLICADO DIRETAMENTE:', januaryData.length, 'dias');
      console.log('👥 Operadores:', [...new Set(januaryData.map(d => d.meioPeriodo).concat(januaryData.map(d => d.fechamento)))].filter(n => n && n !== '').join(', '));
      
      // Salvar imediatamente no localStorage para persistência
      localStorage.setItem('escala_scheduleData', JSON.stringify(januaryData));
      console.log('� Janeiro salvo no localStorage');
      
      return januaryData;
    } catch (error) {
      console.error('❌ Erro ao forçar Janeiro:', error);
      // Fallback absoluto
      return [
        { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "CARLOS" },
        { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
        { date: "03/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" }
      ];
    }
  });

  const [currentSchedules, setCurrentSchedules] = useState<MonthSchedule[]>(() => {
    return getCurrentSchedules();
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

  // Forçar restauração imediata de Janeiro para operadores
  useEffect(() => {
    console.log('🚀 RESTAURAÇÃO IMEDIATA DE JANEIRO PARA OPERADORES...');
    try {
      // IMPORTANTE: Forçar restauração completa independentemente do estado atual
      console.log('🔄 Forçando restauração completa de Janeiro...');
      
      // Importar dados completos de Janeiro
      const { scheduleData: completeJanuaryData } = require('@/data/scheduleData');
      console.log('📦 Dados completos de Janeiro:', completeJanuaryData.length);
      
      // Criar entrada completa de Janeiro
      const completeJanuarySchedule = {
        month: 1,
        year: 2026,
        entries: completeJanuaryData,
        importedAt: new Date().toISOString(),
        importedBy: 'immediate_restore_for_operators',
        isActive: true
      };
      
      // Forçar atualização do storage
      const storage = require('@/data/scheduleData').createScheduleStorage();
      const existingJanuaryIndex = storage.current.findIndex(s => s.month === 1 && s.year === 2026);
      
      if (existingJanuaryIndex >= 0) {
        console.log('🔄 Atualizando Janeiro existente...');
        storage.current[existingJanuaryIndex] = completeJanuarySchedule;
      } else {
        console.log('➕ Adicionando novo Janeiro...');
        storage.current.push(completeJanuarySchedule);
      }
      
      // Salvar imediatamente no localStorage
      require('@/data/scheduleData').saveScheduleStorage(storage);
      console.log('💾 Janeiro salvo no localStorage para operadores');
      
      // Forçar atualização imediata do estado
      console.log('✅ Aplicando Janeiro como escala ativa imediatamente');
      setScheduleData(completeJanuaryData);
      
      // Forçar refresh dos schedules
      setTimeout(() => {
        refreshSchedules();
        console.log('🔄 Refresh forçado concluído');
      }, 100);
      
      console.log('🎉 JANEIRO RESTAURADO E APLICADO PARA OPERADORES!');
      console.log('📊 Total de dias:', completeJanuaryData.length);
      console.log('👥 Operadores visíveis:', [...new Set(completeJanuaryData.map(d => d.meioPeriodo).concat(completeJanuaryData.map(d => d.fechamento)))].filter(n => n && n !== '').join(', '));
      
    } catch (error) {
      console.error('❌ Erro na restauração imediata:', error);
      // Fallback: usar dados diretamente
      try {
        const { scheduleData: fallbackData } = require('@/data/scheduleData');
        setScheduleData(fallbackData);
        console.log('🛡️ Fallback aplicado:', fallbackData.length, 'dias');
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
      }
    }
  }, []);

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
    // Find the entries for both dates
    const originalEntry = scheduleData.find(e => e.date === request.originalDate);
    const targetEntry = scheduleData.find(e => e.date === request.targetDate);
    
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

    // Update the schedule - swap the agents
    const updatedSchedule = scheduleData.map(entry => {
      if (entry.date === request.originalDate) {
        // On the original date, replace requester with target
        return {
          ...entry,
          [requesterShift]: request.targetName
        };
      }
      if (entry.date === request.targetDate) {
        // On the target date, replace target with requester
        return {
          ...entry,
          [targetShift]: request.requesterName
        };
      }
      return entry;
    });

    // Update local state
    setScheduleData(updatedSchedule);
    
    // CRITICAL: Also update the month schedule in storage
    const originalDate = new Date(request.originalDate);
    const month = originalDate.getMonth() + 1; // JavaScript months are 0-based
    const year = originalDate.getFullYear();
    
    console.log('🔄 Atualizando escala mensal:', month, year);
    console.log('📅 Troca:', request.requesterName, '⇄', request.targetName);
    console.log('🔄 Datas:', request.originalDate, '⇄', request.targetDate);
    
    const success = updateMonthScheduleFunc(month, year, updatedSchedule);
    
    if (success) {
      console.log('✅ Escala mensal atualizada com sucesso!');
      // Forçar refresh para garantir que todos os usuários vejam a troca
      refreshSchedules();
      
      // Verificar se este é o schedule ativo e atualizar scheduleData
      const activeSchedule = currentSchedules.find(s => s.month === month && s.year === year && s.isActive !== false);
      if (activeSchedule) {
        console.log('🔄 Atualizando scheduleData ativo com as trocas');
        setScheduleData(updatedSchedule);
      }
      
      // Forçar atualização do localStorage para todos os usuários
      setTimeout(() => {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'escala_scheduleStorage',
          newValue: localStorage.getItem('escala_scheduleStorage')
        }));
      }, 100);
      
    } else {
      console.error('❌ Falha ao atualizar escala mensal');
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

  const importNewSchedule = (month: number, year: number, entries: ScheduleEntry[], importedBy: string, activate = true) => {
    const result = addNewMonthSchedule(month, year, entries, importedBy, activate);
    
    // Log de auditoria - Importação de escala
    logScheduleImport(
      'admin', // ID do admin (genérico)
      importedBy, 
      `Importação de escala: ${month}/${year} com ${entries.length} dias`
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
    // Forçar Janeiro como escala ativa para garantir visibilidade
    const januarySchedule = getScheduleByMonth(1, 2026);
    if (januarySchedule) {
      setScheduleData(januarySchedule.entries);
    } else {
      setScheduleData(getCurrentSchedule());
    }
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
