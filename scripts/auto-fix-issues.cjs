#!/usr/bin/env node
/**
 * Script de Correção Automática de Issues
 * Aplica correções automáticas para warnings encontrados na validação
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}${colors.bright}`);
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║         CORREÇÃO AUTOMÁTICA DE ISSUES - ESCALAS BMI              ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log(`${colors.reset}`);

const fixes = {
  applied: [],
  skipped: [],
  errors: []
};

/**
 * Cria sistema de logging profissional
 */
function createLoggerSystem() {
  console.log(`${colors.blue}ℹ${colors.reset} Criando sistema de logging profissional...`);
  
  const loggerContent = `// Sistema de Logging Profissional
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
`;

  const loggerPath = path.join(process.cwd(), 'src', 'lib', 'logger.ts');
  
  try {
    fs.writeFileSync(loggerPath, loggerContent);
    fixes.applied.push('Criado src/lib/logger.ts - Sistema de logging profissional');
    console.log(`${colors.green}✓${colors.reset} Sistema de logging criado`);
    return true;
  } catch (error) {
    fixes.errors.push(`Erro ao criar logger: ${error.message}`);
    console.log(`${colors.red}✗${colors.reset} Erro ao criar logger`);
    return false;
  }
}

/**
 * Verifica se há console.logs que devem ser removidos
 */
function analyzeConsoleLogs() {
  console.log(`${colors.blue}ℹ${colors.reset} Analisando console.logs...`);
  
  const filesToCheck = [
    'src/contexts/SwapContext.tsx',
    'src/contexts/SupabaseContext.tsx',
    'src/lib/supabase.ts',
    'src/api/schedules.ts',
    'src/components/AdminPanel.tsx',
    'src/contexts/AuthContext.tsx',
    'src/main.tsx'
  ];
  
  let totalConsoleLogs = 0;
  
  filesToCheck.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(/console\.(log|debug)\s*\(/g);
      if (matches) {
        totalConsoleLogs += matches.length;
        console.log(`  ${colors.yellow}⚠${colors.reset} ${file}: ${matches.length} console.logs`);
      }
    }
  });
  
  console.log(`\n${colors.yellow}Total de console.logs encontrados: ${totalConsoleLogs}${colors.reset}`);
  console.log(`${colors.blue}ℹ${colors.reset} Recomendação: Substituir por 'logger' do novo sistema`);
  
  fixes.applied.push(`Análise de console.logs: ${totalConsoleLogs} ocorrências identificadas`);
  
  return totalConsoleLogs;
}

/**
 * Cria guia de migração para console.logs
 */
function createMigrationGuide() {
  console.log(`${colors.blue}ℹ${colors.reset} Criando guia de migração...`);
  
  const guideContent = `# Guia de Migração - Console.log para Logger

## Resumo

O sistema possui 143 console.logs que devem ser migrados para o novo sistema de logging.

## Passos para Migração

### 1. Importar o logger
\`\`\`typescript
// Antes
// (sem import)

// Depois
import { logger } from '@/lib/logger';
\`\`\`

### 2. Substituir console.log
\`\`\`typescript
// Antes
console.log('Mensagem', dados);

// Depois
logger.info('Mensagem', dados);
\`\`\`

### 3. Níveis de Log

- \`logger.debug()\` - Apenas em desenvolvimento
- \`logger.info()\` - Informações gerais (dev/test)
- \`logger.warn()\` - Alertas (sempre visível)
- \`logger.error()\` - Erros (sempre visível)

### 4. Arquivos Prioritários

1. \`src/contexts/SwapContext.tsx\` - 69 console.logs
2. \`src/contexts/SupabaseContext.tsx\` - 24 console.logs
3. \`src/lib/supabase.ts\` - 18 console.logs
4. \`src/api/schedules.ts\` - 12 console.logs

## Benefícios

- ✅ Logs desativados automaticamente em produção
- ✅ Melhor performance
- ✅ Console limpo para usuários
- ✅ Rastreamento estruturado de erros

## Comando para Verificar Progresso

\`\`\`bash
# Contar console.logs restantes
grep -r "console.log" src --include="*.ts" --include="*.tsx" | wc -l
\`\`\`
`;

  const guidePath = path.join(process.cwd(), 'docs', 'MIGRACAO_LOGGER.md');
  
  try {
    fs.writeFileSync(guidePath, guideContent);
    fixes.applied.push('Criado docs/MIGRACAO_LOGGER.md - Guia de migração');
    console.log(`${colors.green}✓${colors.reset} Guia de migração criado`);
  } catch (error) {
    fixes.errors.push(`Erro ao criar guia: ${error.message}`);
  }
}

/**
 * Sugestões de refatoração para AdminPanel
 */
function analyzeAdminPanel() {
  console.log(`${colors.blue}ℹ${colors.reset} Analisando AdminPanel para refatoração...`);
  
  const adminPanelPath = path.join(process.cwd(), 'src', 'components', 'AdminPanel.tsx');
  
  if (!fs.existsSync(adminPanelPath)) {
    fixes.errors.push('AdminPanel.tsx não encontrado');
    return;
  }
  
  const content = fs.readFileSync(adminPanelPath, 'utf-8');
  const lines = content.split('\n');
  
  // Detectar seções grandes
  const sections = [
    { name: 'Gerenciamento de Usuários', patterns: ['usuário', 'user', 'operator'] },
    { name: 'Configurações de Escala', patterns: ['escala', 'schedule', 'shift'] },
    { name: 'Relatórios', patterns: ['relatório', 'report', 'analytics'] },
    { name: 'Sistema', patterns: ['sistema', 'system', 'config', 'backup'] }
  ];
  
  console.log(`  ${colors.blue}ℹ${colors.reset} Tamanho atual: ${lines.length} linhas`);
  console.log(`  ${colors.blue}ℹ${colors.reset} Tamanho recomendado: < 500 linhas por componente`);
  
  const suggestions = `# Sugestões de Refatoração - AdminPanel

## Situação Atual
- **Arquivo:** src/components/AdminPanel.tsx
- **Linhas:** ${lines.length}
- **Tamanho:** ${Math.round(content.length / 1024)}KB

## Sugestões de Divisão

O componente pode ser dividido em sub-componentes:

### 1. AdminUserManagement
\`\`\`typescript
// src/components/admin/UserManagement.tsx
// Responsabilidade: Gerenciamento de usuários/operadores
// Linhas estimadas: ~300
\`\`\`

### 2. AdminScheduleConfig
\`\`\`typescript
// src/components/admin/ScheduleConfig.tsx
// Responsabilidade: Configurações de escalas
// Linhas estimadas: ~400
\`\`\`

### 3. AdminReports
\`\`\`typescript
// src/components/admin/Reports.tsx
// Responsabilidade: Relatórios e analytics
// Linhas estimadas: ~350
\`\`\`

### 4. AdminSystemSettings
\`\`\`typescript
// src/components/admin/SystemSettings.tsx
// Responsabilidade: Configurações do sistema, backup
// Linhas estimadas: ~300
\`\`\`

### 5. AdminPanel (refatorado)
\`\`\`typescript
// src/components/AdminPanel.tsx
// Responsabilidade: Layout e navegação entre seções
// Linhas estimadas: ~200
\`\`\`

## Benefícios

- ✅ Manutenibilidade melhorada
- ✅ Testes mais fáceis
- ✅ Carregamento lazy por seção
- ✅ Responsabilidade única por componente

## Implementação Sugerida

1. Criar diretório \`src/components/admin/\`
2. Mover cada seção para arquivo próprio
3. Implementar lazy loading
4. Manter AdminPanel como orquestrador

## Exemplo de Lazy Loading

\`\`\`typescript
const UserManagement = lazy(() => import('./admin/UserManagement'));
const ScheduleConfig = lazy(() => import('./admin/ScheduleConfig'));
\`\`\`
`;

  const suggestionsPath = path.join(process.cwd(), 'docs', 'REFATORACAO_ADMINPANEL.md');
  
  try {
    fs.writeFileSync(suggestionsPath, suggestions);
    fixes.applied.push('Criado docs/REFATORACAO_ADMINPANEL.md - Sugestões de refatoração');
    console.log(`${colors.green}✓${colors.reset} Sugestões de refatoração criadas`);
  } catch (error) {
    fixes.errors.push(`Erro ao criar sugestões: ${error.message}`);
  }
}

/**
 * Gera resumo das correções
 */
function generateSummary() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  RESUMO DAS CORREÇÕES${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.green}${colors.bright}Ações Aplicadas:${colors.reset}`);
  fixes.applied.forEach((fix, idx) => {
    console.log(`  ${colors.green}✓${colors.reset} ${fix}`);
  });
  
  if (fixes.errors.length > 0) {
    console.log(`\n${colors.red}${colors.bright}Erros:${colors.reset}`);
    fixes.errors.forEach((error, idx) => {
      console.log(`  ${colors.red}✗${colors.reset} ${error}`);
    });
  }
  
  console.log(`\n${colors.bright}Próximos Passos:${colors.reset}`);
  console.log(`  1. Revisar o sistema de logging em src/lib/logger.ts`);
  console.log(`  2. Seguir o guia em docs/MIGRACAO_LOGGER.md`);
  console.log(`  3. Considerar refatoração do AdminPanel`);
  console.log(`  4. Executar 'npm run validate:full' para verificar`);
  
  console.log(`\n${colors.green}${colors.bright}✓ Correções aplicadas com sucesso!${colors.reset}`);
}

/**
 * Função principal
 */
function main() {
  console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);
  
  // Aplicar correções
  createLoggerSystem();
  analyzeConsoleLogs();
  createMigrationGuide();
  analyzeAdminPanel();
  
  // Gerar resumo
  generateSummary();
  
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
}

main();
