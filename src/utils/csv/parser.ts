/**
 * Parser de CSV - Converte conteúdo CSV para objetos
 */
import { ScheduleEntry } from '@/types';

export interface ParseResult {
  data: ScheduleEntry[];
  errors: string[];
  totalRows: number;
}

/**
 * Parse conteúdo CSV
 */
export const parse = (content: string): ParseResult => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const errors: string[] = [];
  const data: ScheduleEntry[] = [];

  if (lines.length < 2) {
    return { data: [], errors: ['Arquivo CSV vazio'], totalRows: 0 };
  }

  const headers = parseLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length < 3) continue;

    try {
      const entry = parseEntry(headers, values);
      if (entry) data.push(entry);
    } catch (error) {
      errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  return { data, errors, totalRows: lines.length - 1 };
};

/**
 * Parse uma linha do CSV respeitando aspas
 */
const parseLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result.map((cell) => cell.replace(/^"|"$/g, '').trim());
};

/**
 * Converte valores em ScheduleEntry
 */
const parseEntry = (headers: string[], values: string[]): ScheduleEntry | null => {
  const getValue = (name: string): string => {
    const index = headers.findIndex(
      (h) => h.toLowerCase().trim() === name.toLowerCase()
    );
    return index >= 0 ? values[index] || '' : '';
  };

  const date = getValue('data');
  const posto = getValue('posto');
  const colaborador = getValue('colaborador');

  if (!date || !posto || !colaborador) {
    return null;
  }

  return {
    date: normalizeDate(date),
    dayOfWeek: calculateDayOfWeek(date),
    meioPeriodo: posto.toLowerCase().includes('meio') ? colaborador.toUpperCase() : '',
    fechamento: posto.toLowerCase().includes('fechamento') ? colaborador.toUpperCase() : '',
  };
};

/**
 * Normaliza data para formato DD/MM/YYYY
 */
const normalizeDate = (dateStr: string): string => {
  // Tenta diferentes formatos
  const patterns = [
    { regex: /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/, day: 1, month: 2, year: 3 },
    { regex: /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/, day: 1, month: 2, year: 3 },
  ];

  for (const pattern of patterns) {
    const match = dateStr.match(pattern.regex);
    if (match) {
      const day = match[pattern.day].padStart(2, '0');
      const month = match[pattern.month].padStart(2, '0');
      const year = match[pattern.year].length === 2 ? '20' + match[pattern.year] : match[pattern.year];
      return `${day}/${month}/${year}`;
    }
  }

  return dateStr;
};

/**
 * Calcula dia da semana a partir da data
 */
const calculateDayOfWeek = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  const days = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO',
  ];

  return days[date.getDay()];
};
