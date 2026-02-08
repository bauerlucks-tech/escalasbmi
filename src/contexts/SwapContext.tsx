import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SwapRequest } from '@/data/scheduleData';
import { useAuth } from './AuthContext';

interface SwapContextType {
  swapRequests: SwapRequest[];
  loading: boolean;
  error: string | null;
  createSwapRequest: (data: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateSwapRequest: (id: string, data: Partial<SwapRequest>) => Promise<void>;
  approveSwapRequest: (id: string) => Promise<void>;
  rejectSwapRequest: (id: string, reason: string) => Promise<void>;
  getSwapRequests: () => Promise<void>;
  getSwapRequestsByUser: (userId: string) => Promise<SwapRequest[]>;
  getPendingSwapRequests: () => Promise<SwapRequest[]>;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error('useSwap must be used within a SwapProvider');
  }
  return context;
};

interface SwapProviderProps {
  children: ReactNode;
}

export const SwapProvider: React.FC<SwapProviderProps> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const getSwapRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Por enquanto, usar localStorage
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      setSwapRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações de troca');
    } finally {
      setLoading(false);
    }
  };

  const getSwapRequestsByUser = async (userId: string): Promise<SwapRequest[]> => {
    try {
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      return requests.filter((req: SwapRequest) => 
        req.requesterId === userId || req.targetId === userId
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações do usuário');
      return [];
    }
  };

  const getPendingSwapRequests = async (): Promise<SwapRequest[]> => {
    try {
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      return requests.filter((req: SwapRequest) => req.status === 'pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações pendentes');
      return [];
    }
  };

  const createSwapRequest = async (data: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newRequest: SwapRequest = {
        ...data,
        id: String(Date.now()),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      requests.push(newRequest);
      localStorage.setItem('swapRequests', JSON.stringify(requests));
      
      setSwapRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar solicitação de troca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSwapRequest = async (id: string, data: Partial<SwapRequest>) => {
    setLoading(true);
    setError(null);
    
    try {
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      
      const updatedRequests = requests.map((request: SwapRequest) => 
        request.id === id ? { ...request, ...data } : request
      );
      
      localStorage.setItem('swapRequests', JSON.stringify(updatedRequests));
      setSwapRequests(updatedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar solicitação de troca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveSwapRequest = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      
      const updatedRequests = requests.map((request: SwapRequest) => 
        request.id === id ? { 
          ...request, 
          status: 'approved' as const,
          approvedBy: currentUser?.id || null,
          approvedAt: new Date().toISOString()
        } : request
      );
      
      localStorage.setItem('swapRequests', JSON.stringify(updatedRequests));
      setSwapRequests(updatedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar solicitação de troca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectSwapRequest = async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const stored = localStorage.getItem('swapRequests');
      const requests = stored ? JSON.parse(stored) : [];
      
      const updatedRequests = requests.map((request: SwapRequest) => 
        request.id === id ? { 
          ...request, 
          status: 'rejected' as const,
          rejectedBy: currentUser?.id || null,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        } : request
      );
      
      localStorage.setItem('swapRequests', JSON.stringify(updatedRequests));
      setSwapRequests(updatedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar solicitação de troca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSwapRequests();
  }, []);

  const value: SwapContextType = {
    swapRequests,
    loading,
    error,
    createSwapRequest,
    updateSwapRequest,
    approveSwapRequest,
    rejectSwapRequest,
    getSwapRequests,
    getSwapRequestsByUser,
    getPendingSwapRequests,
  };

  return (
    <SwapContext.Provider value={value}>
      {children}
    </SwapContext.Provider>
  );
};