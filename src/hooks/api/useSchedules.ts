/**
 * Hook para gerenciamento de escalas
 * Segue o padrão de React Query para cache e sincronização
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/api/schedules';
import { dataMapper } from '@/utils/mappers/dataMapper';
import { MonthSchedule, ScheduleEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Chaves de cache padronizadas
const QUERY_KEYS = {
  all: ['schedules'] as const,
  byId: (id: string) => ['schedules', id] as const,
  byMonth: (month: number, year: number) => ['schedules', month, year] as const,
  active: ['schedules', 'active'] as const,
} as const;

/**
 * Hook para buscar todas as escalas
 */
export const useSchedules = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: async () => {
      try {
        const response = await scheduleApi.getAll();
        return response.map(dataMapper.toSchedule);
      } catch (error) {
        toast({
          title: 'Erro ao carregar escalas',
          description: error instanceof Error ? error.message : 'Tente novamente',
          variant: 'destructive',
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

/**
 * Hook para buscar escala por mês/ano
 */
export const useScheduleByMonth = (month: number, year: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.byMonth(month, year),
    queryFn: async () => {
      const response = await scheduleApi.getByMonth(month, year);
      return response ? dataMapper.toSchedule(response) : null;
    },
    enabled: !!month && !!year,
  });
};

/**
 * Hook para criar nova escala
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (schedule: Omit<MonthSchedule, 'id'>) => {
      const payload = dataMapper.toSupabaseSchedule(schedule);
      return scheduleApi.create(payload);
    },
    onSuccess: (_, variables) => {
      // Invalida cache relacionado
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.byMonth(variables.month, variables.year) 
      });
      
      toast({
        title: 'Escala criada',
        description: `Escala de ${variables.month}/${variables.year} criada com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar escala',
        description: error instanceof Error ? error.message : 'Tente novamente',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para atualizar escala existente
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      month, 
      year, 
      entries 
    }: { 
      month: number; 
      year: number; 
      entries: ScheduleEntry[] 
    }) => {
      return scheduleApi.update(month, year, entries);
    },
    onSuccess: (_, variables) => {
      // Atualiza cache imediatamente
      queryClient.setQueryData(
        QUERY_KEYS.byMonth(variables.month, variables.year),
        (old: MonthSchedule | undefined) => {
          if (!old) return old;
          return { ...old, entries: variables.entries };
        }
      );
    },
  });
};

/**
 * Hook para alternar escala ativa
 */
export const useToggleScheduleActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      return scheduleApi.toggleActive?.(month, year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.active });
    },
  });
};

/**
 * Hook para obter estatísticas da escala
 */
export const useScheduleStats = (month: number, year: number) => {
  const { data: schedule } = useScheduleByMonth(month, year);
  
  return {
    totalDays: schedule?.entries.length || 0,
    weekendsWorked: schedule?.entries.filter(e => 
      e.dayOfWeek === 'SÁBADO' || e.dayOfWeek === 'DOMINGO'
    ).length || 0,
    operatorsCount: new Set(schedule?.entries.flatMap(e => [e.meioPeriodo, e.fechamento])).size || 0,
  };
};
