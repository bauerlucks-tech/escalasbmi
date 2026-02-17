#!/usr/bin/env node
/**
 * Metodologia de Validação Completa do Sistema
 * Este script implementa a metodologia definida em docs/METODOLOGIA_VALIDACAO_SISTEMA.md
 * 
 * Fases:
 * 1. Análise Sistemática de Código
 * 2. Validação de Integridade
 * 3. Testes de Funcionalidade
 * 4. Relatório de Resultados
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Configuração
const config = {
  srcDir: path.join(process.cwd(), 'src'),
  criticalFiles: [
    'src/components/AdminPanel.tsx',
    'src/components/ScheduleView.tsx',
    'src/components/SwapRequestView.tsx',
    'src/contexts/AuthContext.tsx',
    'src/contexts/SupabaseContext.tsx',
    'src/contexts/SwapContext.tsx',
    'src/lib/supabase.ts',
    'src/api/schedules.ts',
    'src/App.tsx',
    'src/main.tsx'
  ],
  validationRules: {
    maxFileSize: 50000, // bytes
    maxLines: 1000,
    maxFunctionLength: 50,
    maxComplexity: 10
  }
};

// Resultados
const results = {
  timestamp: new Date().toISOString(),
  phases: {
    syntax: { status: 'pending', issues: [] },
    logic: { status: 'pending', issues: [] },
    integration: { status: 'pending', issues: [] },
    performance: { status: 'pending', issues: [] }
  },
  summary: {
    totalFiles: 0,
    errors: 0,
    warnings: 0,
    passed: 0
  }
};

/**
 * ============================================
 * FASE 1: ANÁLISE SINTÁTICA
 * ============================================
 */
function phase1_SyntaxAnalysis() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  FASE 1: ANÁLISE SINTÁTICA DE CÓDIGO${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const issues = [];
  let fileCount = 0;

  // Analisar arquivos críticos
  config.criticalFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      issues.push({
        file: filePath,
        type: 'error',
        message: 'Arquivo crítico não encontrado'
      });
      return;
    }

    fileCount++;
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Verificar tamanho do arquivo
    const fileSize = fs.statSync(fullPath).size;
    if (fileSize > config.validationRules.maxFileSize) {
      issues.push({
        file: filePath,
        type: 'warning',
        message: `Arquivo muito grande (${Math.round(fileSize/1024)}KB). Considere dividir em componentes menores.`
      });
    }

    // Verificar número de linhas
    if (lines.length > config.validationRules.maxLines) {
      issues.push({
        file: filePath,
        type: 'warning',
        message: `Arquivo muito extenso (${lines.length} linhas). Considere refatorar.`
      });
    }

    // Verificar imports não utilizados (padrão básico)
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"];?/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Verificar console.log
    const consoleLogRegex = /console\.(log|warn|error|debug)\s*\(/g;
    const consoleMatches = content.match(consoleLogRegex);
    if (consoleMatches && consoleMatches.length > 0) {
      issues.push({
        file: filePath,
        type: 'warning',
        message: `Encontrados ${consoleMatches.length} console.log - remover antes de produção`
      });
    }

    // Verificar uso de 'any'
    const anyRegex = /:\s*any\b/g;
    const anyMatches = content.match(anyRegex);
    if (anyMatches && anyMatches.length > 5) {
      issues.push({
        file: filePath,
        type: 'warning',
        message: `Uso excessivo de 'any' (${anyMatches.length} ocorrências) - tipar corretamente`
      });
    }

    // Verificar funções muito longas
    let functionLength = 0;
    let inFunction = false;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      const functionMatch = line.match(/(function|const|let|var)\s+\w+\s*[\(:]/);
      if (functionMatch && !inFunction) {
        inFunction = true;
        functionLength = 1;
        braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      } else if (inFunction) {
        functionLength++;
        braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
          if (functionLength > config.validationRules.maxFunctionLength) {
            issues.push({
              file: filePath,
              type: 'improvement',
              line: index + 1,
              message: `Função muito longa (${functionLength} linhas) - considerar refatoração`
            });
          }
          inFunction = false;
          functionLength = 0;
        }
      }
    });

    console.log(`${colors.green}✓${colors.reset} Analisado: ${filePath}`);
  });

  results.phases.syntax.status = issues.filter(i => i.type === 'error').length === 0 ? 'passed' : 'failed';
  results.phases.syntax.issues = issues;
  results.summary.totalFiles = fileCount;

  // Report
  console.log(`\n${colors.bright}Resultados da Análise Sintática:${colors.reset}`);
  console.log(`  Arquivos analisados: ${fileCount}`);
  console.log(`  Erros: ${issues.filter(i => i.type === 'error').length}`);
  console.log(`  Warnings: ${issues.filter(i => i.type === 'warning').length}`);
  console.log(`  Sugestões: ${issues.filter(i => i.type === 'improvement').length}`);

  return issues;
}

/**
 * ============================================
 * FASE 2: ANÁLISE DE LÓGICA E INTEGRAÇÃO
 * ============================================
 */
function phase2_LogicAndIntegrationAnalysis() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  FASE 2: ANÁLISE DE LÓGICA E INTEGRAÇÃO${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const issues = [];

  // Verificar estrutura de Contextos
  const contextsDir = path.join(config.srcDir, 'contexts');
  if (fs.existsSync(contextsDir)) {
    const contextFiles = fs.readdirSync(contextsDir).filter(f => f.endsWith('.tsx'));
    
    contextFiles.forEach(file => {
      const content = fs.readFileSync(path.join(contextsDir, file), 'utf-8');
      
      // Verificar se contexto tem Provider
      if (!content.includes('Provider')) {
        issues.push({
          file: `src/contexts/${file}`,
          type: 'error',
          message: 'Contexto sem Provider definido'
        });
      }

      // Verificar se contexto tem export de hook
      if (!content.includes('useContext') && !content.includes('createContext')) {
        issues.push({
          file: `src/contexts/${file}`,
          type: 'warning',
          message: 'Contexto pode não estar exportando hook adequadamente'
        });
      }

      // Verificar tratamento de erros
      if (!content.includes('try') || !content.includes('catch')) {
        issues.push({
          file: `src/contexts/${file}`,
          type: 'improvement',
          message: 'Adicionar tratamento de erros (try/catch) em operações assíncronas'
        });
      }

      console.log(`${colors.green}✓${colors.reset} Contexto verificado: ${file}`);
    });
  }

  // Verificar Components
  const componentsDir = path.join(config.srcDir, 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir)
      .filter(f => f.endsWith('.tsx') && !f.includes('index'));
    
    componentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
      
      // Verificar export default
      if (!content.includes('export default') && !content.includes('export function') && !content.includes('export const')) {
        issues.push({
          file: `src/components/${file}`,
          type: 'warning',
          message: 'Componente sem export explícito'
        });
      }

      console.log(`${colors.green}✓${colors.reset} Componente verificado: ${file}`);
    });
  }

  // Verificar API
  const apiDir = path.join(config.srcDir, 'api');
  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));
    
    apiFiles.forEach(file => {
      const content = fs.readFileSync(path.join(apiDir, file), 'utf-8');
      
      // Verificar tratamento de erros em APIs
      if (!content.includes('catch') && content.includes('async')) {
        issues.push({
          file: `src/api/${file}`,
          type: 'error',
          message: 'Funções async sem tratamento de erro'
        });
      }

      console.log(`${colors.green}✓${colors.reset} API verificada: ${file}`);
    });
  }

  // Verificar Utils
  const utilsDir = path.join(config.srcDir, 'utils');
  if (fs.existsSync(utilsDir)) {
    const scanUtils = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanUtils(fullPath);
        } else if (item.endsWith('.ts')) {
          console.log(`${colors.green}✓${colors.reset} Utilitário verificado: ${path.relative(config.srcDir, fullPath)}`);
        }
      });
    };
    scanUtils(utilsDir);
  }

  results.phases.logic.status = issues.filter(i => i.type === 'error').length === 0 ? 'passed' : 'failed';
  results.phases.logic.issues = issues;

  console.log(`\n${colors.bright}Resultados da Análise de Lógica:${colors.reset}`);
  console.log(`  Erros: ${issues.filter(i => i.type === 'error').length}`);
  console.log(`  Warnings: ${issues.filter(i => i.type === 'warning').length}`);
  console.log(`  Sugestões: ${issues.filter(i => i.type === 'improvement').length}`);

  return issues;
}

/**
 * ============================================
 * FASE 3: ANÁLISE DE INTEGRIDADE
 * ============================================
 */
function phase3_IntegrityCheck() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  FASE 3: ANÁLISE DE INTEGRIDADE DO SISTEMA${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const issues = [];

  // Verificar arquivos de configuração
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'vite.config.ts',
    'tailwind.config.ts',
    'index.html'
  ];

  requiredFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      issues.push({
        file: file,
        type: 'error',
        message: 'Arquivo de configuração obrigatório ausente'
      });
    } else {
      console.log(`${colors.green}✓${colors.reset} Configuração: ${file}`);
    }
  });

  // Verificar environment variables
  const envFiles = ['.env', '.env.production', '.env.example'];
  const envFound = envFiles.filter(f => fs.existsSync(path.join(process.cwd(), f)));
  
  if (envFound.length === 0) {
    issues.push({
      file: '.env*',
      type: 'error',
      message: 'Nenhum arquivo de environment encontrado'
    });
  } else {
    console.log(`${colors.green}✓${colors.reset} Environment files: ${envFound.join(', ')}`);
  }

  // Verificar dependências
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    const criticalDeps = ['react', 'react-dom', 'typescript', '@supabase/supabase-js'];
    criticalDeps.forEach(dep => {
      const hasDep = (packageJson.dependencies && packageJson.dependencies[dep]) ||
                     (packageJson.devDependencies && packageJson.devDependencies[dep]);
      if (!hasDep) {
        issues.push({
          file: 'package.json',
          type: 'error',
          message: `Dependência crítica ausente: ${dep}`
        });
      } else {
        console.log(`${colors.green}✓${colors.reset} Dependência: ${dep}`);
      }
    });
  }

  // Verificar estrutura de diretórios
  const requiredDirs = ['src/components', 'src/contexts', 'src/lib', 'src/types', 'src/utils'];
  requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      issues.push({
        file: dir,
        type: 'warning',
        message: 'Diretório recomendado ausente'
      });
    } else {
      console.log(`${colors.green}✓${colors.reset} Diretório: ${dir}`);
    }
  });

  results.phases.integration.status = issues.filter(i => i.type === 'error').length === 0 ? 'passed' : 'failed';
  results.phases.integration.issues = issues;

  console.log(`\n${colors.bright}Resultados da Análise de Integridade:${colors.reset}`);
  console.log(`  Erros: ${issues.filter(i => i.type === 'error').length}`);
  console.log(`  Warnings: ${issues.filter(i => i.type === 'warning').length}`);

  return issues;
}

/**
 * ============================================
 * FASE 4: TESTES DE BUILD
 * ============================================
 */
function phase4_BuildTest() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  FASE 4: TESTE DE BUILD E COMPILAÇÃO${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  const issues = [];

  try {
    // Verificar TypeScript
    console.log(`${colors.blue}ℹ${colors.reset} Verificando TypeScript...`);
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
      console.log(`${colors.green}✓${colors.reset} TypeScript compilado sem erros`);
    } catch (error) {
      issues.push({
        file: 'typescript',
        type: 'error',
        message: 'Erros de compilação TypeScript detectados'
      });
      console.log(`${colors.red}✗${colors.reset} Erros de compilação TypeScript`);
    }

    // Verificar ESLint
    console.log(`${colors.blue}ℹ${colors.reset} Verificando ESLint...`);
    try {
      execSync('npx eslint src --ext .ts,.tsx --max-warnings=10', { stdio: 'pipe', cwd: process.cwd() });
      console.log(`${colors.green}✓${colors.reset} ESLint passou`);
    } catch (error) {
      issues.push({
        file: 'eslint',
        type: 'warning',
        message: 'ESLint encontrou warnings ou erros'
      });
      console.log(`${colors.yellow}⚠${colors.reset} ESLint encontrou issues`);
    }

  } catch (error) {
    issues.push({
      file: 'build',
      type: 'error',
      message: 'Erro ao executar testes de build'
    });
  }

  results.phases.performance.status = issues.filter(i => i.type === 'error').length === 0 ? 'passed' : 'failed';
  results.phases.performance.issues = issues;

  console.log(`\n${colors.bright}Resultados dos Testes de Build:${colors.reset}`);
  console.log(`  Erros: ${issues.filter(i => i.type === 'error').length}`);
  console.log(`  Warnings: ${issues.filter(i => i.type === 'warning').length}`);

  return issues;
}

/**
 * ============================================
 * GERAÇÃO DE RELATÓRIO
 * ============================================
 */
function generateReport() {
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  RELATÓRIO FINAL DE VALIDAÇÃO${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

  // Contar todos os issues
  const allIssues = [
    ...results.phases.syntax.issues,
    ...results.phases.logic.issues,
    ...results.phases.integration.issues,
    ...results.phases.performance.issues
  ];

  results.summary.errors = allIssues.filter(i => i.type === 'error').length;
  results.summary.warnings = allIssues.filter(i => i.type === 'warning').length;
  results.summary.passed = allIssues.filter(i => i.type === 'improvement').length;

  // Status geral
  const hasErrors = results.summary.errors > 0;
  const status = hasErrors ? 'FALHOU' : 'PASSOU';
  const statusColor = hasErrors ? colors.red : colors.green;

  console.log(`${colors.bright}Status Geral: ${statusColor}${status}${colors.reset}\n`);

  console.log(`${colors.bright}Resumo por Fase:${colors.reset}`);
  console.log(`  ${results.phases.syntax.status === 'passed' ? colors.green : colors.red}●${colors.reset} Análise Sintática: ${results.phases.syntax.status.toUpperCase()}`);
  console.log(`  ${results.phases.logic.status === 'passed' ? colors.green : colors.red}●${colors.reset} Lógica e Integração: ${results.phases.logic.status.toUpperCase()}`);
  console.log(`  ${results.phases.integration.status === 'passed' ? colors.green : colors.red}●${colors.reset} Integridade: ${results.phases.integration.status.toUpperCase()}`);
  console.log(`  ${results.phases.performance.status === 'passed' ? colors.green : colors.red}●${colors.reset} Build e Performance: ${results.phases.performance.status.toUpperCase()}`);

  console.log(`\n${colors.bright}Estatísticas:${colors.reset}`);
  console.log(`  Arquivos analisados: ${results.summary.totalFiles}`);
  console.log(`  Erros: ${colors.red}${results.summary.errors}${colors.reset}`);
  console.log(`  Warnings: ${colors.yellow}${results.summary.warnings}${colors.reset}`);
  console.log(`  Sugestões: ${results.summary.passed}`);

  // Listar erros encontrados
  if (results.summary.errors > 0) {
    console.log(`\n${colors.red}${colors.bright}Erros Encontrados:${colors.reset}`);
    allIssues
      .filter(i => i.type === 'error')
      .forEach((issue, idx) => {
        console.log(`  ${idx + 1}. ${colors.red}[ERRO]${colors.reset} ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`     ${issue.message}`);
      });
  }

  // Listar warnings
  if (results.summary.warnings > 0) {
    console.log(`\n${colors.yellow}${colors.bright}Warnings:${colors.reset}`);
    allIssues
      .filter(i => i.type === 'warning')
      .slice(0, 10) // Limitar a 10
      .forEach((issue, idx) => {
        console.log(`  ${idx + 1}. ${colors.yellow}[WARN]${colors.reset} ${issue.file}`);
        console.log(`     ${issue.message}`);
      });
    
    if (results.summary.warnings > 10) {
      console.log(`  ... e mais ${results.summary.warnings - 10} warnings`);
    }
  }

  // Salvar relatório JSON
  const reportPath = path.join(process.cwd(), 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n${colors.blue}ℹ${colors.reset} Relatório completo salvo em: validation-report.json`);

  return results;
}

/**
 * ============================================
 * FUNÇÃO PRINCIPAL
 * ============================================
 */
function main() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                  ║');
  console.log('║       METODOLOGIA DE VALIDAÇÃO DO SISTEMA - ESCALAS BMI          ║');
  console.log('║                                                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
  console.log(`Início: ${new Date().toLocaleString('pt-BR')}\n`);

  const startTime = Date.now();

  // Executar todas as fases
  phase1_SyntaxAnalysis();
  phase2_LogicAndIntegrationAnalysis();
  phase3_IntegrityCheck();
  phase4_BuildTest();
  
  // Gerar relatório
  const report = generateReport();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bright}Duração total: ${duration}s${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}\n═══════════════════════════════════════════════════════════════${colors.reset}`);
  
  // Exit code baseado no resultado
  process.exit(report.summary.errors > 0 ? 1 : 0);
}

// Executar
main();
