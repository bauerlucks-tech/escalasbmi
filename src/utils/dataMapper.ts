// Utilitário para converter entre camelCase (frontend) e snake_case (Supabase)
import { MonthSchedule, VacationRequest } from '@/data/scheduleData';

// Converter snake_case para camelCase
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Converter camelCase para snake_case
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Converter chaves de um objeto de snake_case para camelCase
export const objectToCamelCase = <T>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => objectToCamelCase(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        result[camelKey] = objectToCamelCase(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};

// Converter chaves de um objeto de camelCase para snake_case
export const objectToSnakeCase = <T>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => objectToSnakeCase(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        result[snakeKey] = objectToSnakeCase(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};

// Mapeador específico para MonthSchedule
export const monthScheduleFromSupabase = (supabaseData: any): MonthSchedule => {
  return {
    month: supabaseData.month,
    year: supabaseData.year,
    entries: supabaseData.entries || [],
    importedAt: supabaseData.imported_at || supabaseData.importedAt,
    importedBy: supabaseData.imported_by || supabaseData.importedBy,
    isArchived: supabaseData.is_archived || supabaseData.isArchived,
    archivedAt: supabaseData.archived_at || supabaseData.archivedAt,
    isActive: supabaseData.is_active !== undefined ? supabaseData.is_active : supabaseData.isActive,
    createdAt: supabaseData.created_at || supabaseData.createdAt,
    updatedAt: supabaseData.updated_at || supabaseData.updatedAt,
  };
};

// Mapeador para enviar para Supabase
export const monthScheduleToSupabase = (schedule: MonthSchedule): any => {
  return {
    month: schedule.month,
    year: schedule.year,
    entries: schedule.entries,
    imported_at: schedule.importedAt,
    imported_by: schedule.importedBy,
    is_archived: schedule.isArchived,
    archived_at: schedule.archivedAt,
    is_active: schedule.isActive,
    created_at: schedule.createdAt,
    updated_at: schedule.updatedAt,
  };
};

// Mapeador para VacationRequest
export const vacationRequestFromSupabase = (supabaseData: any): VacationRequest => {
  return {
    id: supabaseData.id,
    operatorId: supabaseData.operator_id,
    operatorName: supabaseData.operator_name,
    startDate: supabaseData.start_date,
    endDate: supabaseData.end_date,
    totalDays: supabaseData.total_days,
    reason: supabaseData.reason,
    status: supabaseData.status,
    requestedAt: supabaseData.requested_at,
    approvedBy: supabaseData.approved_by,
    approvedAt: supabaseData.approved_at,
    rejectionReason: supabaseData.rejection_reason,
    month: supabaseData.month,
    year: supabaseData.year,
  };
};

export const vacationRequestToSupabase = (request: VacationRequest): any => {
  return {
    operator_id: request.operatorId,
    operator_name: request.operatorName,
    start_date: request.startDate,
    end_date: request.endDate,
    total_days: request.totalDays,
    reason: request.reason,
    status: request.status,
    requested_at: request.requestedAt,
    approved_by: request.approvedBy,
    approved_at: request.approvedAt,
    rejection_reason: request.rejectionReason,
    month: request.month,
    year: request.year,
  };
};
