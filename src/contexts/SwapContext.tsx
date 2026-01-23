import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SwapRequest, ScheduleEntry } from '@/data/scheduleData';
import { scheduleData as initialScheduleData } from '@/data/scheduleData';

interface SwapContextType {
  swapRequests: SwapRequest[];
  scheduleData: ScheduleEntry[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt'>) => void;
  respondToSwap: (requestId: string, accept: boolean) => void;
  adminApproveSwap: (requestId: string, adminName: string) => void;
  getMyRequests: (userId: string) => SwapRequest[];
  getRequestsForMe: (userName: string) => SwapRequest[];
  getPendingCount: (userName: string) => number;
  getPendingAdminApproval: () => SwapRequest[];
  getApprovedSwaps: () => SwapRequest[];
  updateSchedule: (newSchedule: ScheduleEntry[]) => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(() => {
    const saved = localStorage.getItem('escala_swapRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem('escala_scheduleData');
    return saved ? JSON.parse(saved) : initialScheduleData;
  });

  useEffect(() => {
    localStorage.setItem('escala_swapRequests', JSON.stringify(swapRequests));
  }, [swapRequests]);

  useEffect(() => {
    localStorage.setItem('escala_scheduleData', JSON.stringify(scheduleData));
  }, [scheduleData]);

  const updateSchedule = (newSchedule: ScheduleEntry[]) => {
    setScheduleData(newSchedule);
  };

  const applySwapToSchedule = (request: SwapRequest) => {
    // Find the entries for both dates
    const originalEntry = scheduleData.find(e => e.date === request.originalDate);
    const targetEntry = scheduleData.find(e => e.date === request.targetDate);
    
    if (!originalEntry || !targetEntry) return;

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

    if (!requesterShift) return;

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

    setScheduleData(updatedSchedule);
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
        ? { ...req, status: accept ? 'accepted' : 'rejected' }
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

  return (
    <SwapContext.Provider value={{
      swapRequests,
      scheduleData,
      createSwapRequest,
      respondToSwap,
      adminApproveSwap,
      getMyRequests,
      getRequestsForMe,
      getPendingCount,
      getPendingAdminApproval,
      getApprovedSwaps,
      updateSchedule,
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
