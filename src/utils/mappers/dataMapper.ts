/**
 * Utilitário para converter entre camelCase (frontend) e snake_case (Supabase)
 */

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
export const toSchedule = (supabaseData: any): any => {
  if (!supabaseData) return null;
  
  return {
    id: supabaseData.id,
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
export const toSupabaseSchedule = (schedule: any): any => {
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

// Exportar como objeto consolidado
export const dataMapper = {
  toCamelCase,
  toSnakeCase,
  objectToCamelCase,
  objectToSnakeCase,
  toSchedule,
  toSupabaseSchedule,
};
