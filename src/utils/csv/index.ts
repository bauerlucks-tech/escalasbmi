/**
 * Utilitários para processamento de CSV
 * Exporta parser, validator e exporter
 */
export * from './parser';
export * from './validator';
export * from './exporter';

// Objeto consolidado para facilitar uso
import * as parser from './parser';
import * as validator from './validator';
import * as exporter from './exporter';

export const csvParser = {
  ...parser,
  ...validator,
  ...exporter,
};
