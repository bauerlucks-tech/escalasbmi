// Sistema de Logging Profissional
// Substitui console.log para ambiente de produção

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDev = import.meta.env.DEV;
const isTest = import.meta.env.MODE === 'test';

function createLogger(): Logger {
  const noop = () => {};
  
  return {
    debug: isDev ? console.debug.bind(console) : noop,
    info: isDev || isTest ? console.info.bind(console) : noop,
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };
}

export const logger = createLogger();

// Função utilitária para log estruturado
export function logStructured(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...metadata
  };
  
  if (isDev || level === 'error' || level === 'warn') {
    console[level](JSON.stringify(logEntry));
  }
}
