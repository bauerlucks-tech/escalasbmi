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
    // Forçar Janeiro como escala inicial para garantir visibilidade
    console.log('🔍 Inicializando scheduleData...');
    try {
      const januarySchedule = getScheduleByMonth(1, 2026);
      console.log('📅 Janeiro schedule encontrado:', januarySchedule);
      if (januarySchedule && januarySchedule.entries.length > 0) {
        console.log('✅ Usando Janeiro entries:', januarySchedule.entries.length);
        return januarySchedule.entries;
      }
      console.log('❌ Janeiro não encontrado ou vazio, usando getCurrentSchedule()');
      const fallback = getCurrentSchedule();
      console.log('🔄 Fallback entries:', fallback.length);
      return fallback;
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
      // Importar scheduleData padrão como último recurso
      const { scheduleData: defaultSchedule } = require('@/data/scheduleData');
      console.log('🛡️ Usando scheduleData padrão:', defaultSchedule.length);
      return defaultSchedule;
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

  // Forçar Janeiro como escala ativa na montagem
  useEffect(() => {
    console.log('🚀 useEffect de montagem - Forçando Janeiro...');
    try {
      let januarySchedule = getScheduleByMonth(1, 2026);
      console.log('📅 Janeiro no useEffect:', januarySchedule);
      
      // Se Janeiro não existe ou está vazio, recriá-lo
      if (!januarySchedule || januarySchedule.entries.length === 0) {
        console.log('🔄 Janeiro não encontrado ou vazio, recriando...');
        
        // Importar dados padrão de Janeiro
        const { scheduleData: defaultJanuaryData } = require('@/data/scheduleData');
        console.log('📦 Dados padrão de Janeiro:', defaultJanuaryData.length);
        
        // Criar nova entrada de Janeiro
        const newJanuarySchedule = {
          month: 1,
          year: 2026,
          entries: defaultJanuaryData,
          importedAt: new Date().toISOString(),
          importedBy: 'system_restore',
          isActive: true
        };
        
        // Adicionar ao storage
        const storage = require('@/data/scheduleData').createScheduleStorage();
        const existingJanuaryIndex = storage.current.findIndex(s => s.month === 1 && s.year === 2026);
        
        if (existingJanuaryIndex >= 0) {
          storage.current[existingJanuaryIndex] = newJanuarySchedule;
        } else {
          storage.current.push(newJanuarySchedule);
        }
        
        // Salvar no localStorage
        require('@/data/scheduleData').saveScheduleStorage(storage);
        console.log('💾 Janeiro recriado e salvo no localStorage');
        
        // Recarregar schedule
        januarySchedule = getScheduleByMonth(1, 2026);
        console.log('🔄 Janeiro após recriação:', januarySchedule);
      }
      
      if (januarySchedule && januarySchedule.entries.length > 0) {
        console.log('✅ Setando Janeiro no useEffect:', januarySchedule.entries.length);
        setScheduleData(januarySchedule.entries);
      } else {
        console.log('❌ Janeiro ainda não encontrado após tentativas');
      }
    } catch (error) {
      console.error('❌ Erro no useEffect:', error);
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
      // refreshSchedules() já é chamado dentro de updateMonthScheduleFunc
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
    setSwapRequests(prev => [...prev, newRequest]);
  };

  const respondToSwap = (requestId: string, accept: boolean) => {
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
