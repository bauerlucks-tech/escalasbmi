/**
 * Exporter de CSV - Exporta escalas para formato CSV
 */
import { ScheduleEntry } from '@/types';

/**
 * Converte entradas da escala para CSV
 */
export const exportToCSV = (entries: ScheduleEntry[]): string => {
  const headers = ['data', 'dia_semana', 'meio_periodo', 'fechamento'];
  const rows = entries.map((entry) => [
    entry.date,
    entry.dayOfWeek,
    entry.meioPeriodo,
    entry.fechamento
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Gera template CSV para um mês específico
 */
export const generateCSVTemplate = (month: number, year: number): string => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const headers = ['data', 'dia_semana', 'meio_periodo', 'fechamento'];
  const rows = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
    const dateObj = new Date(year, month, day);
    const dayOfWeek = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'][dateObj.getDay()];
    
    rows.push([date, dayOfWeek, '', '']);
  }

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

/**
 * Baixa template CSV para um mês específico
 */
export const downloadCSVTemplate = (month: number, year: number): void => {
  const content = generateCSVTemplate(month, year);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `template-escala-${month}-${year}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Baixa escala em formato CSV
 */
export const downloadScheduleCSV = (entries: ScheduleEntry[]): void => {
  if (entries.length === 0) {
    return;
  }

  const content = exportToCSV(entries);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = `escala-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
