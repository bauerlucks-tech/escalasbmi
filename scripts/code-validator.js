#!/usr/bin/env node

/**
 * VALIDADOR DE CÓDIGO - Sistema de Verificação Automática
 * Verifica código antes de aplicar edições para minimizar erros
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

class CodeValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = true;
  }

  log(message, type = 'info') {
    const colors = {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    };
    
    const icons = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  validateFileExists(filePath) {
    const fullPath = join(PROJECT_ROOT, filePath);
    if (!existsSync(fullPath)) {
      this.errors.push(`Arquivo não encontrado: ${filePath}`);
      this.success = false;
      return false;
    }
    return true;
  }

  validateFileContent(filePath, content) {
    try {
      // Verificar sintaxe básica
      if (content.includes('import') && !content.includes('from')) {
        this.warnings.push(`Possível import incompleto em ${filePath}`);
      }
      
      // Verificar exports
      if (content.includes('export') && !content.includes('{')) {
        this.warnings.push(`Possível export incorreto em ${filePath}`);
      }
      
      // Verificar TypeScript
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        if (content.includes('React') && !content.includes('import React')) {
          this.warnings.push(`React usado sem import em ${filePath}`);
        }
      }
      
      return true;
    } catch (error) {
      this.errors.push(`Erro ao validar conteúdo de ${filePath}: ${error.message}`);
      this.success = false;
      return false;
    }
  }

  validateImport(filePath, importStatement) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    if (!content.includes(importStatement)) {
      this.errors.push(`Import não encontrado em ${filePath}: ${importStatement}`);
      this.success = false;
      return false;
    }
    
    this.log(`Import validado: ${importStatement} em ${filePath}`, 'success');
    return true;
  }

  validateExport(filePath, exportStatement) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    if (!content.includes(exportStatement)) {
      this.errors.push(`Export não encontrado em ${filePath}: ${exportStatement}`);
      this.success = false;
      return false;
    }
    
    this.log(`Export validado: ${exportStatement} em ${filePath}`, 'success');
    return true;
  }

  validateFunction(filePath, functionName) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    const patterns = [
      `function ${functionName}`,
      `const ${functionName} =`,
      `export const ${functionName}`,
      `export function ${functionName}`
    ];
    
    const hasFunction = patterns.some(pattern => content.includes(pattern));
    if (!hasFunction) {
      this.errors.push(`Função não encontrada em ${filePath}: ${functionName}`);
      this.success = false;
      return false;
    }
    
    this.log(`Função validada: ${functionName} em ${filePath}`, 'success');
    return true;
  }

  validateTypeScript(filePath) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    
    // Verificar problemas comuns de TypeScript
    const issues = [];
    
    // Verificar imports sem type
    if (content.includes('import') && content.includes('interface') && !content.includes('import type')) {
      issues.push('Possível interface importada sem "import type"');
    }
    
    // Verificar asserções de tipo
    if (content.includes('as ') && content.includes('any')) {
      issues.push('Uso de "as any" detectado');
    }
    
    // Verificar tipos não declarados
    if (content.includes(': any') || content.includes('any[]')) {
      issues.push('Uso de tipo "any" detectado');
    }
    
    if (issues.length > 0) {
      issues.forEach(issue => this.warnings.push(`${filePath}: ${issue}`));
    }
    
    return issues.length === 0;
  }

  validateReactComponent(filePath) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    
    // Verificar estrutura básica de componente React
    const required = [
      'import React',
      'export',
      'return (',
      'function',
      'const'
    ];
    
    const missing = required.filter(req => !content.includes(req));
    if (missing.length > 0) {
      this.warnings.push(`Componente React ${filePath} pode estar faltando: ${missing.join(', ')}`);
    }
    
    return missing.length === 0;
  }

  validateCSS(filePath) {
    if (!this.validateFileExists(filePath)) return false;
    
    const content = readFileSync(join(PROJECT_ROOT, filePath), 'utf8');
    
    // Verificar problemas comuns de CSS
    const issues = [];
    
    if (content.includes('!important') && content.split('!important').length > 3) {
      issues.push('Muitos usos de !important detectados');
    }
    
    if (content.includes('px') && content.includes('rem')) {
      // Apenas aviso, não erro
      this.warnings.push(`Mistura de unidades px e rem em ${filePath}`);
    }
    
    return issues.length === 0;
  }

  getReport() {
    return {
      success: this.success,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        total: this.errors.length + this.warnings.length,
        errors: this.errors.length,
        warnings: this.warnings.length
      }
    };
  }

  printReport() {
    const report = this.getReport();
    
    console.log('\n📋 RELATÓRIO DE VALIDAÇÃO DE CÓDIGO');
    console.log('=' * 50);
    
    if (report.success && report.warnings.length === 0) {
      console.log('✅ Código validado com sucesso!');
    } else {
      if (report.errors.length > 0) {
        console.log('\n❌ ERROS:');
        report.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      if (report.warnings.length > 0) {
        console.log('\n⚠️ WARNINGS:');
        report.warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }
    }
    
    console.log(`\n📊 Resumo: ${report.summary.errors} erros, ${report.summary.warnings} warnings`);
    
    return report.success;
  }
}

// Função para uso em outros scripts
function createValidator() {
  return new CodeValidator();
}

// Exportar para uso em outros módulos
export { CodeValidator, createValidator };

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new CodeValidator();
  
  // Exemplo de validação
  console.log('🔍 Validando arquivos críticos do sistema...\n');
  
  // Validar arquivos principais
  validator.validateFileExists('src/components/SwapRequestView.tsx');
  validator.validateFileExists('src/contexts/AuthContext.tsx');
  validator.validateFileExists('src/utils/csv/index.ts');
  
  // Validar imports críticos
  validator.validateImport('src/components/SwapRequestView.tsx', 'import { useAuth }');
  validator.validateImport('src/utils/csv/index.ts', "export { parse } from './parser'");
  
  // Validar funções críticas
  validator.validateFunction('src/utils/csv/validator.ts', 'validateCSV');
  validator.validateFunction('src/contexts/AuthContext.tsx', 'isAdmin');
  
  // Validar TypeScript
  validator.validateTypeScript('src/components/SwapRequestView.tsx');
  
  // Validar componentes React
  validator.validateReactComponent('src/components/SwapRequestView.tsx');
  
  // Imprimir relatório
  const success = validator.printReport();
  process.exit(success ? 0 : 1);
}
