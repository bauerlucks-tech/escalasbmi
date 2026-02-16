/**
 * Utilitários de data
 * Formatação e manipulação de datas
 */

import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata o nome do mês
 */
export const formatMonthName = (month: number): string => {
  return format(new Date(2024, month, 1), 'MMMM', { locale: ptBR });
};

/**
 * Formata data completa
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parse(date, 'dd/MM/yyyy', new Date()) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Verifica se uma data é válida
 */
export const isValidDate = (date: string): boolean => {
  const parsed = parse(date, 'dd/MM/yyyy', new Date());
  return isValid(parsed);
};

/**
 * Obtém o primeiro dia do mês
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

/**
 * Obtém o número de dias no mês
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Formata data para exibição
 */
export const formatDisplayDate = (date: string): string => {
  const parsed = parse(date, 'dd/MM/yyyy', new Date());
  return format(parsed, "dd 'MMMM' 'yyyy", { locale: ptBR });
};
