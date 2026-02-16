/**
 * Serviço de Escalas - Regras de negócio
 * Contém toda a lógica de processamento de escalas
 */
import { scheduleApi } from '@/api/schedules';
import { dataMapper } from '@/utils/mappers/dataMapper';
import { csvParser } from '@/utils/csv';
import { MonthSchedule, ScheduleEntry, ScheduleStats } from '@/types/schedule';

export interface ImportScheduleOptions {
  month: number;
  year: number;
  file: File;
  activate?: boolean;
  importedBy: string;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  entries?: ScheduleEntry[];
  stats?: ScheduleStats[];
}

export const scheduleService = {
  /**
   * Obtém a escala atual (mês corrente)
   */
  getCurrentMonth: async (): Promise<MonthSchedule | null> => {
    const now = new Date();
    const response = await scheduleApi.getByMonth(
      now.getMonth() + 1,
      now.getFullYear()
    );
    return response ? dataMapper.toSchedule(response) : null;
  },

  /**
   * Obtém escala ativa (a que está em uso)
   */
  getActiveSchedule: async (): Promise<MonthSchedule | null> => {
    const allSchedules = await scheduleApi.getAll();
    const active = allSchedules.find((s: any) => s.is_active);
    return active ? dataMapper.toSchedule(active) : null;
  },

  /**
   * Valida arquivo CSV antes de importar
   */
  validateImport: async (
    file: File,
    options: { month: number; year: number; operators: string[] }
  ): Promise<ImportValidationResult> => {
    try {
      const content = await file.text();
      const result = csvParser.validateAndParse(
        content,
        options.operators,
        options.month,
        options.year
      );

      if (!result.isValid) {
        return {
          isValid: false,
          errors: result.errors,
          warnings: result.warnings,
        };
      }

      // Calcula estatísticas
      const stats = calculateScheduleStats(result.data);

      return {
        isValid: true,
        errors: [],
        warnings: result.warnings,
        entries: result.data,
        stats,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Erro ao processar arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido')],
        warnings: [],
      };
    }
  },

  /**
   * Importa escala de arquivo CSV
   */
  importFromCSV: async ({
    month,
    year,
    file,
    activate = true,
    importedBy,
  }: ImportScheduleOptions): Promise<MonthSchedule> => {
    const content = await file.text();
    const parsed = csvParser.parse(content);

    const schedule: Omit<MonthSchedule, 'id'> = {
      month,
      year,
      entries: parsed.data,
      importedAt: new Date().toISOString(),
      importedBy,
      isActive: activate,
    };

    const response = await scheduleApi.create(
      dataMapper.toSupabaseSchedule(schedule)
    );

    return dataMapper.toSchedule(response);
  },

  /**
   * Obtém estatísticas de um operador específico
   */
  getOperatorStats: async (
    operatorName: string,
    month: number,
    year: number
  ): Promise<ScheduleStats | null> => {
    const schedule = await scheduleApi.getByMonth(month, year);
    if (!schedule) return null;

    const entries = schedule.entries.filter(
      (e: ScheduleEntry) =>
        e.meioPeriodo === operatorName || e.fechamento === operatorName
    );

    const totalDays = entries.length;
    const meioPeriodo = entries.filter((e: ScheduleEntry) => e.meioPeriodo === operatorName).length;
    const fechamento = entries.filter((e: ScheduleEntry) => e.fechamento === operatorName).length;
    const weekends = entries.filter(
      (e: ScheduleEntry) => e.dayOfWeek === 'SÁBADO' || e.dayOfWeek === 'DOMINGO'
    ).length;

    return {
      operatorName,
      totalDays,
      daysOff: 0, // Calcular baseado no mês
      meioPeriodo,
      fechamento,
      weekends,
    };
  },

  /**
   * Verifica se operador está escalado em uma data
   */
  isOperatorScheduled: async (
    operatorName: string,
    date: string,
    month: number,
    year: number
  ): Promise<{ meioPeriodo: boolean; fechamento: boolean }> => {
    const schedule = await scheduleApi.getByMonth(month, year);
    if (!schedule) return { meioPeriodo: false, fechamento: false };

    const entry = schedule.entries.find((e: ScheduleEntry) => e.date === date);
    if (!entry) return { meioPeriodo: false, fechamento: false };

    return {
      meioPeriodo: entry.meioPeriodo === operatorName,
      fechamento: entry.fechamento === operatorName,
    };
  },
};

/**
 * Calcula estatísticas da escala
 */
function calculateScheduleStats(entries: ScheduleEntry[]): ScheduleStats[] {
  const operatorMap = new Map<string, ScheduleStats>();

  entries.forEach((entry) => {
    // Meio período
    if (entry.meioPeriodo) {
      const stats = operatorMap.get(entry.meioPeriodo) || {
        operatorName: entry.meioPeriodo,
        totalDays: 0,
        daysOff: 0,
        meioPeriodo: 0,
        fechamento: 0,
        weekends: 0,
      };
      stats.totalDays++;
      stats.meioPeriodo++;
      if (entry.dayOfWeek === 'SÁBADO' || entry.dayOfWeek === 'DOMINGO') {
        stats.weekends++;
      }
      operatorMap.set(entry.meioPeriodo, stats);
    }

    // Fechamento
    if (entry.fechamento) {
      const stats = operatorMap.get(entry.fechamento) || {
        operatorName: entry.fechamento,
        totalDays: 0,
        daysOff: 0,
        meioPeriodo: 0,
        fechamento: 0,
        weekends: 0,
      };
      stats.totalDays++;
      stats.fechamento++;
      if (entry.dayOfWeek === 'SÁBADO' || entry.dayOfWeek === 'DOMINGO') {
        stats.weekends++;
      }
      operatorMap.set(entry.fechamento, stats);
    }
  });

  return Array.from(operatorMap.values()).sort((a, b) =>
    a.operatorName.localeCompare(b.operatorName)
  );
}
