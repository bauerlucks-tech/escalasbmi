/**
 * Exporta todos os tipos da aplicação
 * Ponto único de importação para todos os tipos
 */

// Re-exporta tipos de scheduleData para compatibilidade
export type {
  ScheduleEntry,
  User,
  UserRole,
  UserStatus,
  MonthSchedule,
  VacationRequest,
  VacationStatus,
  SwapRequest,
} from '@/data/scheduleData';

// Tipos adicionais específicos da API
export interface ApiResponse<T> {
  data: T;
  error: null | {
    message: string;
    code?: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
