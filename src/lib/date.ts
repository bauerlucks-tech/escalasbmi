// Utilitários de data - Funções auxiliares para formatação e manipulação de datas

/**
 * Formata número do mês para nome por extenso
 */
export const formatMonthName = (month: number): string => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month - 1] || '';
};

/**
 * Formata data para exibição
 */
export const formatDate = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/');
  return `${day}/${month}/${year}`;
};

/**
 * Converte data DD/MM/YYYY para objeto Date
 */
export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formata data para API (ISO string)
 */
export const toISODate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  return date.toISOString().split('T')[0];
};

/**
 * Verifica se data é fim de semana
 */
export const isWeekend = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Obtém dia da semana por extenso
 */
export const getDayOfWeek = (dateStr: string): string => {
  const date = parseDate(dateStr);
  const days = [
    'Domingo', 'Segunda-feira', 'Terça-feira',
    'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];
  return days[date.getDay()];
};
