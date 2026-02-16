/**
 * Tipos relacionados a Escalas
 */

export interface ScheduleEntry {
  date: string;           // Formato: DD/MM/YYYY
  dayOfWeek: string;      // Ex: SEGUNDA-FEIRA
  meioPeriodo: string;    // Operador do meio período
  fechamento: string;     // Operador do fechamento
}

export interface MonthSchedule {
  id?: string;
  month: number;          // 1-12
  year: number;
  entries: ScheduleEntry[];
  importedAt?: string;
  importedBy?: string;
  isActive?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArchivedSchedule extends MonthSchedule {
  archivedAt: string;
  archivedBy: string;
}

export interface ScheduleStats {
  operatorName: string;
  totalDays: number;
  daysOff: number;
  meioPeriodo: number;
  fechamento: number;
  weekends: number;
}

export interface ScheduleImportResult {
  success: boolean;
  message: string;
  archived?: ArchivedSchedule[];
}
