import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VacationRequest, VacationStatus } from '@/data/scheduleData';
import { SupabaseAPI } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useSwap } from './SwapContext';

interface VacationContextType {
  vacationRequests: VacationRequest[];
  loading: boolean;
  error: string | null;
  createVacationRequest: (request: Omit<VacationRequest, 'id' | 'requestedAt'>) => Promise<void>;
  updateVacationRequest: (id: string, updates: Partial<VacationRequest>) => Promise<void>;
  approveVacationRequest: (id: string, adminName: string) => Promise<void>;
  rejectVacationRequest: (id: string, adminName: string, reason: string) => Promise<void>;
  refreshVacations: () => Promise<void>;
  getVacationsByOperator: (operatorId: string) => VacationRequest[];
  getPendingVacations: () => VacationRequest[];
  getVacationsByDateRange: (startDate: string, endDate: string) => VacationRequest[];
  isDateRangeAvailable: (startDate: string, endDate: string, excludeId?: string) => boolean;
  getOperatorWithLeastDays: (month: number, year: number, excludeOperatorId?: string) => string | null;
}

const VacationContext = createContext<VacationContextType | undefined>(undefined);

export const useVacation = () => {
  const context = useContext(VacationContext);
  if (!context) {
    throw new Error('useVacation must be used within a VacationProvider');
  }
  return context;
};

interface VacationProviderProps {
  children: ReactNode;
}

export const VacationProvider: React.FC<VacationProviderProps> = ({ children }) => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { currentSchedules } = useSwap(); // Get schedules from SwapContext

  // Load vacation requests from Supabase
  const refreshVacations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const requests = await SupabaseAPI.getVacationRequests();
      
      // Convert Supabase snake_case to frontend camelCase
      const convertedRequests: VacationRequest[] = requests.map(req => ({
        id: req.id,
        operatorId: req.operator_id,
        operatorName: req.operator_name,
        startDate: req.start_date,
        endDate: req.end_date,
        totalDays: req.total_days,
        reason: req.reason,
        status: req.status,
        requestedAt: req.requested_at,
        approvedBy: req.approved_by,
        approvedAt: req.approved_at,
        rejectionReason: req.rejection_reason,
        month: req.month,
        year: req.year
      }));
      
      setVacationRequests(convertedRequests);
      console.log('✅ Férias carregadas do Supabase:', convertedRequests.length);
    } catch (error) {
      console.error('❌ Erro ao carregar férias:', error);
      setError('Falha ao carregar solicitações de férias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshVacations();
  }, []);

  // Create vacation request
  const createVacationRequest = async (request: Omit<VacationRequest, 'id' | 'requestedAt'>) => {
    try {
      setError(null);
      
      // Check if date range is available
      const isAvailable = isDateRangeAvailable(request.startDate, request.endDate);
      if (!isAvailable) {
        throw new Error('Período já possui férias aprovadas para outro operador');
      }

      // Convert to Supabase format with validation
      // Mapear nomes para UUIDs - usando IDs reais do Supabase
      const userUUIDs: { [key: string]: string } = {
        'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
        'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
        'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
        'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
        'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc'
      };
      
      const operatorUUID = userUUIDs[request.operatorName] || request.operatorId;
      
      const supabaseRequest = {
        operator_id: operatorUUID,
        operator_name: request.operatorName || '',
        start_date: request.startDate,
        end_date: request.endDate,
        total_days: request.totalDays,
        reason: request.reason || null,
        status: request.status,
        month: request.month,
        year: request.year
      };

      // Validate required fields
      if (!supabaseRequest.operator_id || !supabaseRequest.operator_name || 
          !supabaseRequest.start_date || !supabaseRequest.end_date || 
          !supabaseRequest.status || supabaseRequest.total_days <= 0) {
        console.error('❌ Invalid vacation request data:', supabaseRequest);
        throw new Error('Dados da solicitação inválidos. Verifique todos os campos.');
      }

      console.log('📝 Enviando solicitação de férias:', supabaseRequest);

      // Create request in Supabase
      const newRequest = await SupabaseAPI.createVacationRequest(supabaseRequest);
      
      // Convert back to frontend format
      const convertedRequest: VacationRequest = {
        id: newRequest.id,
        operatorId: newRequest.operator_id,
        operatorName: newRequest.operator_name,
        startDate: newRequest.start_date,
        endDate: newRequest.end_date,
        totalDays: newRequest.total_days,
        reason: newRequest.reason,
        status: newRequest.status,
        requestedAt: newRequest.requested_at,
        approvedBy: newRequest.approved_by,
        approvedAt: newRequest.approved_at,
        rejectionReason: newRequest.rejection_reason,
        month: newRequest.month,
        year: newRequest.year
      };
      
      // Update local state
      setVacationRequests(prev => [convertedRequest, ...prev]);
      
      // Add audit log
      await SupabaseAPI.addAuditLog(
        request.operatorId,
        request.operatorName,
        'VACATION_REQUEST',
        `Solicitação de férias: ${request.startDate} até ${request.endDate} (${request.totalDays} dias)`
      );
      
      console.log('✅ Solicitação de férias criada:', convertedRequest);
    } catch (error) {
      console.error('❌ Erro ao criar solicitação de férias:', error);
      setError(error instanceof Error ? error.message : 'Falha ao criar solicitação');
      throw error;
    }
  };

  // Update vacation request
  const updateVacationRequest = async (id: string, updates: Partial<VacationRequest>) => {
    try {
      setError(null);
      
      // Convert to Supabase format
      const supabaseUpdates: Record<string, unknown> = {};
      if (updates.status) supabaseUpdates.status = updates.status;
      if (updates.approvedBy) supabaseUpdates.approved_by = updates.approvedBy;
      if (updates.approvedAt) supabaseUpdates.approved_at = updates.approvedAt;
      if (updates.rejectionReason) supabaseUpdates.rejection_reason = updates.rejectionReason;
      
      const updatedRequest = await SupabaseAPI.updateVacationRequest(id, supabaseUpdates);
      
      // Convert back to frontend format
      const convertedRequest: VacationRequest = {
        id: updatedRequest.id,
        operatorId: updatedRequest.operator_id,
        operatorName: updatedRequest.operator_name,
        startDate: updatedRequest.start_date,
        endDate: updatedRequest.end_date,
        totalDays: updatedRequest.total_days,
        reason: updatedRequest.reason,
        status: updatedRequest.status,
        requestedAt: updatedRequest.requested_at,
        approvedBy: updatedRequest.approved_by,
        approvedAt: updatedRequest.approved_at,
        rejectionReason: updatedRequest.rejection_reason,
        month: updatedRequest.month,
        year: updatedRequest.year
      };
      
      // Update local state
      setVacationRequests(prev => 
        prev.map(req => req.id === id ? convertedRequest : req)
      );
      
      console.log('✅ Solicitação de férias atualizada:', convertedRequest);
    } catch (error) {
      console.error('❌ Erro ao atualizar solicitação de férias:', error);
      setError(error instanceof Error ? error.message : 'Falha ao atualizar solicitação');
      throw error;
    }
  };

  // Approve vacation request
  const approveVacationRequest = async (id: string, adminName: string) => {
    try {
      setError(null);
      
      const request = vacationRequests.find(req => req.id === id);
      if (!request) {
        throw new Error('Solicitação não encontrada');
      }

      // Update status
      await updateVacationRequest(id, {
        status: 'approved',
        approvedBy: adminName,
        approvedAt: new Date().toISOString()
      });

      // Apply vacation to schedule
      await applyVacationToSchedule(request, adminName);

      // Add audit log
      await SupabaseAPI.addAuditLog(
        request.operatorId,
        request.operatorName,
        'VACATION_APPROVAL',
        `Férias aprovadas: ${request.startDate} até ${request.endDate} - Aprovado por ${adminName}`
      );

      console.log('✅ Férias aprovadas e aplicadas na escala:', request);
    } catch (error) {
      console.error('❌ Erro ao aprovar férias:', error);
      setError(error instanceof Error ? error.message : 'Falha ao aprovar férias');
      throw error;
    }
  };

  // Reject vacation request
  const rejectVacationRequest = async (id: string, adminName: string, reason: string) => {
    try {
      setError(null);
      
      const request = vacationRequests.find(req => req.id === id);
      if (!request) {
        throw new Error('Solicitação não encontrada');
      }

      // Update status
      await updateVacationRequest(id, {
        status: 'rejected',
        approvedBy: adminName,
        approvedAt: new Date().toISOString(),
        rejectionReason: reason
      });

      // Add audit log
      await SupabaseAPI.addAuditLog(
        request.operatorId,
        request.operatorName,
        'VACATION_REJECTION',
        `Férias rejeitadas: ${request.startDate} até ${request.endDate} - Motivo: ${reason}`
      );

      console.log('✅ Férias rejeitadas:', request);
    } catch (error) {
      console.error('❌ Erro ao rejeitar férias:', error);
      setError(error instanceof Error ? error.message : 'Falha ao rejeitar férias');
      throw error;
    }
  };

  // Apply vacation to schedule
  const applyVacationToSchedule = async (request: VacationRequest, adminName: string) => {
    try {
      console.log('🏖️ Aplicando férias na escala:', request);
      
      // Get schedules for the vacation period
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      
      // For each day in the vacation period
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const [year, month, day] = dateStr.split('-');
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        const dayNum = parseInt(day);
        
        // Format as DD/MM/YYYY for schedule
        const scheduleDate = `${dayNum.toString().padStart(2, '0')}/${monthNum.toString().padStart(2, '0')}/${yearNum}`;
        
        // Get schedule for this month
        const monthSchedules = await SupabaseAPI.getMonthSchedules();
        const schedule = monthSchedules.find(s => s.month === monthNum && s.year === yearNum);
        
        if (schedule) {
          // Find entry for this date
          const entry = schedule.entries.find(e => e.date === scheduleDate);
          
          if (entry) {
            // Check if operator is scheduled
            const isScheduled = entry.meioPeriodo === request.operatorName || 
                              entry.fechamento === request.operatorName;
            
            if (isScheduled) {
              // Find replacement operator with least days
              const replacementOperator = getOperatorWithLeastDays(monthNum, yearNum, request.operatorId);
              
              if (replacementOperator) {
                // Replace operator in schedule
                const updatedEntries = schedule.entries.map(e => {
                  if (e.date === scheduleDate) {
                    return {
                      ...e,
                      meioPeriodo: e.meioPeriodo === request.operatorName ? replacementOperator : e.meioPeriodo,
                      fechamento: e.fechamento === request.operatorName ? replacementOperator : e.fechamento
                    };
                  }
                  return e;
                });
                
                // Update schedule in Supabase
                await SupabaseAPI.updateMonthSchedule(monthNum, yearNum, updatedEntries);
                
                // Add audit log for replacement
                await SupabaseAPI.addAuditLog(
                  replacementOperator,
                  replacementOperator,
                  'VACATION_REPLACEMENT',
                  `Substituição em ${scheduleDate}: Cobrindo férias de ${request.operatorName}`
                );
                
                console.log(`✅ Substituição aplicada: ${replacementOperator} substituindo ${request.operatorName} em ${scheduleDate}`);
              }
            }
          }
        }
      }
      
      console.log('✅ Férias aplicadas na escala com sucesso');
    } catch (error) {
      console.error('❌ Erro ao aplicar férias na escala:', error);
      throw error;
    }
  };

  // Helper functions
  const getVacationsByOperator = (operatorId: string): VacationRequest[] => {
    return vacationRequests.filter(req => req.operatorId === operatorId);
  };

  const getPendingVacations = (): VacationRequest[] => {
    return vacationRequests.filter(req => req.status === 'pending');
  };

  const getVacationsByDateRange = (startDate: string, endDate: string): VacationRequest[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return vacationRequests.filter(req => {
      const reqStart = new Date(req.startDate);
      const reqEnd = new Date(req.endDate);
      
      // Check if date ranges overlap
      return (start <= reqEnd && end >= reqStart);
    });
  };

  const isDateRangeAvailable = (startDate: string, endDate: string, excludeId?: string): boolean => {
    const overlappingVacations = getVacationsByDateRange(startDate, endDate);
    
    // Filter out the current request (for updates)
    const filtered = excludeId 
      ? overlappingVacations.filter(req => req.id !== excludeId)
      : overlappingVacations;
    
    // Check if any approved vacation overlaps
    return !filtered.some(req => req.status === 'approved');
  };

  const getOperatorWithLeastDays = (month: number, year: number, excludeOperatorId?: string): string | null => {
    try {
      // Get all operators from the system
      const operators = ['LUCAS', 'CARLOS', 'ROSANA', 'HENRIQUE', 'KELLY', 'GUILHERME'];
      
      // Get schedule for this month
      const monthSchedules = currentSchedules.find(s => s.month === month && s.year === year);
      if (!monthSchedules) return null;
      
      // Count working days for each operator (excluding the one on vacation)
      const operatorDays: { [key: string]: number } = {};
      
      operators.forEach(op => {
        if (op === excludeOperatorId) return; // Skip the operator on vacation
        
        let days = 0;
        monthSchedules.entries.forEach(entry => {
          if (entry.meioPeriodo === op || entry.fechamento === op) {
            days++;
          }
        });
        
        operatorDays[op] = days;
      });
      
      // Find operator with least days
      let minDays = Infinity;
      let bestOperator = null;
      
      Object.entries(operatorDays).forEach(([operator, days]) => {
        if (days < minDays) {
          minDays = days;
          bestOperator = operator;
        }
      });
      
      console.log('📊 Contagem de dias dos operadores:', { month, year, excludeOperatorId, operatorDays, bestOperator });
      return bestOperator;
    } catch (error) {
      console.error('❌ Erro ao calcular operador com menos dias:', error);
      return null;
    }
  };

  const value: VacationContextType = {
    vacationRequests,
    loading,
    error,
    createVacationRequest,
    updateVacationRequest,
    approveVacationRequest,
    rejectVacationRequest,
    refreshVacations,
    getVacationsByOperator,
    getPendingVacations,
    getVacationsByDateRange,
    isDateRangeAvailable,
    getOperatorWithLeastDays,
  };

  return (
    <VacationContext.Provider value={value}>
      {children}
    </VacationContext.Provider>
  );
};
