/**
 * Utilitários para processamento de CSV
 * Exporta parser, validator e exporter
 */

// Exportar funções individualmente para garantir compatibilidade
export { parse } from './parser';
export { validateCSV, validateAndParse, validateAndParseCSV, ValidationResult } from './validator';
export { exportToCSV, generateCSVTemplate, downloadCSVTemplate, downloadScheduleCSV } from './exporter';

// Objeto consolidado para facilitar uso
import * as parser from './parser';
import * as validator from './validator';
import * as exporter from './exporter';

export const csvParser = {
  ...parser,
  ...validator,
  ...exporter,
};
