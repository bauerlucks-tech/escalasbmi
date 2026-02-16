/**
 * Validator de CSV - Valida dados antes de importar
 */
import { ScheduleEntry } from '@/types/schedule';
import { parse } from './parser';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: ScheduleEntry[];
}

/**
 * Valida e parseia conteúdo CSV
 */
export const validateAndParse = (
  content: string,
  registeredEmployees: string[],
  targetMonth: number,
  targetYear: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse inicial
  const { data, errors: parseErrors } = parse(content);

  if (parseErrors.length > 0) {
    errors.push(...parseErrors);
  }

  if (data.length === 0) {
    errors.push('Nenhum dado válido encontrado no arquivo');
    return { isValid: false, errors, warnings, data: [] };
  }

  // Validações adicionais
  const normalizedEmployees = registeredEmployees.map((e) => e.toUpperCase().trim());
  const seenDates = new Set<string>();

  data.forEach((entry, index) => {
    // Valida data
    if (!isValidDate(entry.date)) {
      errors.push(`Linha ${index + 2}: Data inválida "${entry.date}"`);
    }

    // Verifica datas duplicadas
    if (seenDates.has(entry.date)) {
      warnings.push(`Data ${entry.date} aparece múltiplas vezes`);
    }
    seenDates.add(entry.date);

    // Valida operadores
    if (entry.meioPeriodo && !normalizedEmployees.includes(entry.meioPeriodo.toUpperCase())) {
      errors.push(`Linha ${index + 2}: Operador "${entry.meioPeriodo}" não cadastrado`);
    }

    if (entry.fechamento && !normalizedEmployees.includes(entry.fechamento.toUpperCase())) {
      errors.push(`Linha ${index + 2}: Operador "${entry.fechamento}" não cadastrado`);
    }

    // Valifica mês/ano
    const entryMonth = getMonthFromDate(entry.date);
    const entryYear = getYearFromDate(entry.date);

    if (entryMonth !== targetMonth || entryYear !== targetYear) {
      warnings.push(`Data ${entry.date} não corresponde ao mês/ano alvo (${targetMonth}/${targetYear})`);
    }
  });

  // Verifica se todas as datas do mês estão presentes
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
  if (seenDates.size !== daysInMonth) {
    warnings.push(`Escala incompleta: ${seenDates.size} de ${daysInMonth} dias`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data,
  };
};

/**
 * Valida formato de data DD/MM/YYYY
 */
const isValidDate = (dateStr: string): boolean => {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
};

/**
 * Extrai mês da data DD/MM/YYYY
 */
const getMonthFromDate = (dateStr: string): number => {
  const parts = dateStr.split('/');
  return parseInt(parts[1], 10);
};

/**
 * Extrai ano da data DD/MM/YYYY
 */
const getYearFromDate = (dateStr: string): number => {
  const parts = dateStr.split('/');
  return parseInt(parts[2], 10);
};
