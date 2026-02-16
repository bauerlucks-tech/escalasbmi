/**
 * Exporter de CSV - Exporta escalas para formato CSV
 */
import { ScheduleEntry } from '@/types/schedule';

/**
 * Converte entradas da escala para CSV
 */
export const exportToCSV = (entries: ScheduleEntry[]): string => {
  const headers = ['data', 'dia_semana', 'meio_periodo', 'fechamento'];
  const rows = entries.map((entry) => [
    entry.date,
    entry.dayOfWeek,
    entry.meioPeriodo,
    entry.fechamento,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
};

/**
 * Gera template CSV vazio para um mês
 */
export const generateTemplate = (month: number, year: number): string => {
  const headers = ['data', 'posto', 'colaborador'];
  const daysInMonth = new Date(year, month, 0).getDate();
  const rows: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    const dayOfWeek = getDayOfWeekName(date.getDay());

    // Meio período
    rows.push(`${dateStr},meio_periodo,`);
    // Fechamento
    rows.push(`${dateStr},fechamento,`);
  }

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Download CSV como arquivo
 */
export const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Obtém nome do dia da semana
 */
const getDayOfWeekName = (dayIndex: number): string => {
  const days = [
    'DOMINGO',
    'SEGUNDA-FEIRA',
    'TERÇA-FEIRA',
    'QUARTA-FEIRA',
    'QUINTA-FEIRA',
    'SEXTA-FEIRA',
    'SÁBADO',
  ];
  return days[dayIndex];
};
