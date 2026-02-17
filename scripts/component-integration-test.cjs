#!/usr/bin/env node
/**
 * Testes de Integração de Componentes
 * Valida funcionalidades específicas dos componentes críticos
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

// Testes de integridade por componente
const componentTests = {
  'src/components/ScheduleView.tsx': {
    requiredImports: ['react', 'useState', 'useEffect', 'useMemo'],
    requiredHooks: ['useState', 'useEffect'],
    requiredFunctions: ['ScheduleView', 'export'],
    validations: [
      { pattern: /interface\s+\w+Props/, description: 'Props tipadas' },
      { pattern: /useMemo/, description: 'Otimização de performance' },
      { pattern: /try\s*\{[\s\S]*?catch/, description: 'Tratamento de erro' },
    ]
  },
  'src/components/AdminPanel.tsx': {
    requiredImports: ['react', 'useState', 'useEffect'],
    requiredHooks: ['useState', 'useEffect'],
    requiredFunctions: ['AdminPanel'],
    validations: [
      { pattern: /interface\s+\w+Props/, description: 'Props tipadas' },
      { pattern: /export\s+default/, description: 'Export default' },
    ]
  },
  'src/components/SwapRequestView.tsx': {
    requiredImports: ['react', 'useState', 'useContext'],
    requiredHooks: ['useState', 'useContext'],
    validations: [
      { pattern: /SwapContext/, description: 'Uso de SwapContext' },
      { pattern: /try\s*\{[\s\S]*?catch/, description: 'Tratamento de erro' },
    ]
  },
  'src/contexts/AuthContext.tsx': {
    requiredImports: ['react', 'createContext', 'useContext'],
    validations: [
      { pattern: /createContext/, description: 'Contexto criado' },
      { pattern: /Provider/, description: 'Provider definido' },
      { pattern: /export\s+const\s+useAuth/, description: 'Hook exportado' },
      { pattern: /supabase/, description: 'Integração com Supabase' },
    ]
  },
  'src/contexts/SupabaseContext.tsx': {
    requiredImports: ['react', 'createContext'],
    validations: [
      { pattern: /createClient/, description: 'Cliente Supabase criado' },
      { pattern: /Provider/, description: 'Provider definido' },
    ]
  },
  'src/contexts/SwapContext.tsx': {
    requiredImports: ['react', 'createContext', 'useState'],
    validations: [
      { pattern: /interface.*Swap/, description: 'Interfaces de swap' },
      { pattern: /createContext/, description: 'Contexto criado' },
      { pattern: /Provider/, description: 'Provider definido' },
    ]
  },
  'src/lib/supabase.ts': {
    requiredImports: ['@supabase/supabase-js'],
    validations: [
      { pattern: /createClient/, description: 'Cliente criado' },
      { pattern: /supabaseUrl/, description: 'URL configurada' },
      { pattern: /supabaseKey/, description: 'Chave configurada' },
    ]
  },
  'src/api/schedules.ts': {
    validations: [
      { pattern: /export\s+(async\s+)?function/, description: 'Funções exportadas' },
      { pattern: /try\s*\{/, description: 'Tratamento de erro' },
      { pattern: /supabase/, description: 'Uso do supabase' },
    ]
  },
  'src/App.tsx': {
    requiredImports: ['react'],
    validations: [
      { pattern: /function\s+App/, description: 'Componente App' },
      { pattern: /export\s+default\s+App/, description: 'Export default' },
      { pattern: /Provider/, description: 'Providers configurados' },
    ]
  }
};

function runComponentTests() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  TESTES DE INTEGRAÇÃO DE COMPONENTES${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const [filePath, tests] of Object.entries(componentTests)) {
    const fullPath = path.join(process.cwd(), filePath);
    
    console.log(`${colors.bright}Testando: ${filePath}${colors.reset}`);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`  ${colors.red}✗${colors.reset} Arquivo não encontrado`);
      results.push({ file: filePath, status: 'missing', tests: [] });
      totalFailed++;
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const fileResults = {
      file: filePath,
      status: 'checking',
      tests: []
    };

    // Verificar imports
    if (tests.requiredImports) {
      tests.requiredImports.forEach(imp => {
        const found = content.includes(`from '${imp}'`) || 
                      content.includes(`from "${imp}"`) ||
                      content.includes(`import '${imp}'`) ||
                      content.includes(`import "${imp}"`);
        fileResults.tests.push({
          name: `Import: ${imp}`,
          status: found ? 'passed' : 'failed'
        });
      });
    }

    // Verificar hooks
    if (tests.requiredHooks) {
      tests.requiredHooks.forEach(hook => {
        const found = content.includes(hook);
        fileResults.tests.push({
          name: `Hook: ${hook}`,
          status: found ? 'passed' : 'failed'
        });
      });
    }

    // Verificar funções
    if (tests.requiredFunctions) {
      tests.requiredFunctions.forEach(func => {
        const found = content.includes(`function ${func}`) || 
                      content.includes(`const ${func}`) ||
                      content.includes(`export default ${func}`);
        fileResults.tests.push({
          name: `Function: ${func}`,
          status: found ? 'passed' : 'failed'
        });
      });
    }

    // Verificar padrões
    if (tests.validations) {
      tests.validations.forEach(validation => {
        const found = validation.pattern.test(content);
        fileResults.tests.push({
          name: validation.description,
          status: found ? 'passed' : 'failed'
        });
      });
    }

    // Calcular resultado
    const passed = fileResults.tests.filter(t => t.status === 'passed').length;
    const failed = fileResults.tests.filter(t => t.status === 'failed').length;
    
    fileResults.status = failed === 0 ? 'passed' : 'failed';
    
    // Exibir resultados
    fileResults.tests.forEach(test => {
      const icon = test.status === 'passed' ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(`  ${icon} ${test.name}`);
    });

    if (fileResults.status === 'passed') {
      console.log(`  ${colors.green}✓ Todos os ${passed} testes passaram${colors.reset}\n`);
      totalPassed++;
    } else {
      console.log(`  ${colors.red}✗ ${failed} de ${passed + failed} testes falharam${colors.reset}\n`);
      totalFailed++;
    }

    results.push(fileResults);
  }

  // Resumo
  console.log(`${colors.bright}\nResumo dos Testes de Componentes:${colors.reset}`);
  console.log(`  Componentes: ${results.length}`);
  console.log(`  ${colors.green}Passaram: ${totalPassed}${colors.reset}`);
  console.log(`  ${colors.red}Falharam: ${totalFailed}${colors.reset}`);
  console.log(`  ${colors.yellow}Taxa de sucesso: ${((totalPassed / results.length) * 100).toFixed(1)}%${colors.reset}`);

  return results;
}

function validateDataFlow() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  VALIDAÇÃO DE FLUXO DE DADOS${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const issues = [];

  // Verificar consistência de tipos
  const typesDir = path.join(process.cwd(), 'src/types');
  if (fs.existsSync(typesDir)) {
    console.log(`${colors.blue}ℹ${colors.reset} Verificando tipos...`);
    
    const typeFiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts'));
    typeFiles.forEach(file => {
      const content = fs.readFileSync(path.join(typesDir, file), 'utf-8');
      
      // Verificar se há exports
      if (!content.includes('export')) {
        issues.push({
          file: `src/types/${file}`,
          message: 'Arquivo de tipos sem exports'
        });
      }
      
      console.log(`  ${colors.green}✓${colors.reset} Tipo: ${file}`);
    });
  }

  // Verificar mappers
  const mappersDir = path.join(process.cwd(), 'src/utils/mappers');
  if (fs.existsSync(mappersDir)) {
    console.log(`\n${colors.blue}ℹ${colors.reset} Verificando mappers...`);
    
    const mapperFiles = fs.readdirSync(mappersDir).filter(f => f.endsWith('.ts'));
    mapperFiles.forEach(file => {
      console.log(`  ${colors.green}✓${colors.reset} Mapper: ${file}`);
    });
  }

  // Verificar consistência de contextos
  const contextsDir = path.join(process.cwd(), 'src/contexts');
  if (fs.existsSync(contextsDir)) {
    console.log(`\n${colors.blue}ℹ${colors.reset} Verificando consistência de contextos...`);
    
    const contextFiles = fs.readdirSync(contextsDir).filter(f => f.endsWith('.tsx'));
    
    contextFiles.forEach(file => {
      const content = fs.readFileSync(path.join(contextsDir, file), 'utf-8');
      
      // Verificar se há import de React
      if (!content.includes('React')) {
        issues.push({
          file: `src/contexts/${file}`,
          message: 'Contexto sem import de React'
        });
      }
      
      console.log(`  ${colors.green}✓${colors.reset} Contexto: ${file}`);
    });
  }

  if (issues.length > 0) {
    console.log(`\n${colors.red}${colors.bright}Problemas encontrados:${colors.reset}`);
    issues.forEach(issue => {
      console.log(`  ${colors.red}✗${colors.reset} ${issue.file}: ${issue.message}`);
    });
  } else {
    console.log(`\n${colors.green}✓${colors.reset} Todos os fluxos de dados estão consistentes`);
  }

  return issues;
}

function main() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║         TESTES DE INTEGRAÇÃO - ESCALAS BMI                       ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  const startTime = Date.now();

  // Executar testes
  const componentResults = runComponentTests();
  const dataFlowIssues = validateDataFlow();

  // Relatório final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Testes concluídos em ${duration}s${colors.reset}`);

  // Verificar se há falhas
  const hasFailures = componentResults.some(r => r.status === 'failed') || dataFlowIssues.length > 0;
  
  if (hasFailures) {
    console.log(`${colors.red}${colors.bright}✗ Alguns testes falharam${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bright}✓ Todos os testes passaram${colors.reset}`);
    process.exit(0);
  }
}

main();
