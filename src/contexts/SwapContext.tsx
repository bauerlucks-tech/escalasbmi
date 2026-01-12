import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SwapRequest } from '@/data/scheduleData';

interface SwapContextType {
  swapRequests: SwapRequest[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt'>) => void;
  respondToSwap: (requestId: string, accept: boolean) => void;
  getMyRequests: (userId: string) => SwapRequest[];
  getRequestsForMe: (userName: string) => SwapRequest[];
  getPendingCount: (userName: string) => number;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(() => {
    const saved = localStorage.getItem('escala_swapRequests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('escala_swapRequests', JSON.stringify(swapRequests));
  }, [swapRequests]);

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

  const getMyRequests = (userId: string) => {
    return swapRequests.filter(req => req.requesterId === userId);
  };

  const getRequestsForMe = (userName: string) => {
    return swapRequests.filter(req => req.targetName === userName && req.status === 'pending');
  };

  const getPendingCount = (userName: string) => {
    return swapRequests.filter(req => req.targetName === userName && req.status === 'pending').length;
  };

  return (
    <SwapContext.Provider value={{
      swapRequests,
      createSwapRequest,
      respondToSwap,
      getMyRequests,
      getRequestsForMe,
      getPendingCount,
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
