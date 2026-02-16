#!/usr/bin/env node

/**
 * EDITOR SEGURO - Sistema de Edição com Validação
 * Edita arquivos com verificação automática para minimizar erros
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CodeValidator } from './code-validator.js';

class SafeEditor {
  constructor() {
    this.validator = new CodeValidator();
    this.backupDir = join(process.cwd(), '.safe-edit-backups');
    this.operations = [];
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
      info: 'ℹ️',
      edit: '✏️'
    };
    
    console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
  }

  createBackup(filePath) {
    if (!existsSync(filePath)) {
      this.log(`Arquivo não encontrado para backup: ${filePath}`, 'error');
      return false;
    }
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(this.backupDir, `${filePath.replace(/[\/\\]/g, '_')}_${timestamp}.bak`);
      
      // Criar diretório de backup se não existir
      if (!existsSync(this.backupDir)) {
        require('fs').mkdirSync(this.backupDir, { recursive: true });
      }
      
      writeFileSync(backupPath, content);
      this.log(`Backup criado: ${backupPath}`, 'success');
      return backupPath;
    } catch (error) {
      this.log(`Erro ao criar backup: ${error.message}`, 'error');
      return false;
    }
  }

  validateBeforeEdit(filePath, oldString, newString) {
    // Validar arquivo
    if (!this.validator.validateFileExists(filePath)) {
      return false;
    }
    
    // Ler conteúdo atual
    const content = readFileSync(filePath, 'utf8');
    
    // Verificar se oldString existe
    if (!content.includes(oldString)) {
      this.log(`String original não encontrada em ${filePath}`, 'error');
      this.log(`Procurando: "${oldString}"`, 'error');
      return false;
    }
    
    // Verificar se newString é válida
    if (!newString || newString.trim() === '') {
      this.log(`Nova string está vazia`, 'error');
      return false;
    }
    
    // Verificar se newString já existe (evitar duplicatas)
    if (oldString !== newString && content.includes(newString)) {
      this.log(`Nova string já existe no arquivo`, 'warning');
    }
    
    return true;
  }

  safeEdit(filePath, oldString, newString, options = {}) {
    const operation = {
      filePath,
      oldString,
      newString,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    try {
      this.log(`Iniciando edição segura: ${filePath}`, 'info');
      
      // Validação prévia
      if (!this.validateBeforeEdit(filePath, oldString, newString)) {
        operation.status = 'validation_failed';
        this.operations.push(operation);
        return false;
      }
      
      // Criar backup
      if (options.createBackup !== false) {
        const backupPath = this.createBackup(filePath);
        if (!backupPath) {
          operation.status = 'backup_failed';
          this.operations.push(operation);
          return false;
        }
        operation.backupPath = backupPath;
      }
      
      // Ler conteúdo
      const content = readFileSync(filePath, 'utf8');
      
      // Verificar múltiplas ocorrências
      const occurrences = (content.match(new RegExp(oldString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      if (occurrences > 1 && !options.allowMultiple) {
        this.log(`Múltiplas ocorrências (${occurrences}) encontradas. Use allowMultiple: true`, 'warning');
        operation.status = 'multiple_occurrences';
        this.operations.push(operation);
        return false;
      }
      
      // Aplicar edição
      const newContent = options.replaceAll 
        ? content.replaceAll(oldString, newString)
        : content.replace(oldString, newString);
      
      // Verificar se a edição foi aplicada
      if (newContent === content) {
        this.log(`Edição não foi aplicada`, 'error');
        operation.status = 'edit_failed';
        this.operations.push(operation);
        return false;
      }
      
      // Validar conteúdo editado
      const tempPath = filePath + '.temp';
      writeFileSync(tempPath, newContent);
      
      const validationSuccess = this.validator.validateFileContent(filePath, newContent);
      
      if (!validationSuccess && !options.skipValidation) {
        // Restaurar backup
        writeFileSync(filePath, content);
        require('fs').unlinkSync(tempPath);
        
        this.log(`Validação falhou, edição revertida`, 'error');
        operation.status = 'validation_failed';
        this.operations.push(operation);
        return false;
      }
      
      // Aplicar edição permanentemente
      writeFileSync(filePath, newContent);
      require('fs').unlinkSync(tempPath);
      
      operation.status = 'success';
      operation.occurrences = occurrences;
      this.operations.push(operation);
      
      this.log(`✅ Edição aplicada com sucesso: ${filePath}`, 'success');
      this.log(`   Ocorrências: ${occurrences}`, 'info');
      
      return true;
      
    } catch (error) {
      this.log(`Erro na edição: ${error.message}`, 'error');
      operation.status = 'error';
      operation.error = error.message;
      this.operations.push(operation);
      return false;
    }
  }

  safeEditMultiple(filePath, edits, options = {}) {
    this.log(`Iniciando edição múltipla: ${filePath} (${edits.length} operações)`, 'info');
    
    let successCount = 0;
    const results = [];
    
    for (let i = 0; i < edits.length; i++) {
      const edit = edits[i];
      this.log(`Aplicando edição ${i + 1}/${edits.length}...`, 'info');
      
      const success = this.safeEdit(
        filePath,
        edit.oldString,
        edit.newString,
        { ...options, createBackup: i === 0 ? options.createBackup : false }
      );
      
      results.push({
        index: i,
        success,
        edit: edit.explanation || `Edição ${i + 1}`
      });
      
      if (success) {
        successCount++;
      } else if (options.stopOnError) {
        this.log(`Parando devido a erro na edição ${i + 1}`, 'error');
        break;
      }
    }
    
    this.log(`Edição múltipla concluída: ${successCount}/${edits.length} sucessos`, 
             successCount === edits.length ? 'success' : 'warning');
    
    return results;
  }

  getOperationHistory() {
    return this.operations;
  }

  printOperationHistory() {
    console.log('\n📋 HISTÓRICO DE OPERAÇÕES');
    console.log('=' * 50);
    
    this.operations.forEach((op, index) => {
      const statusIcon = {
        success: '✅',
        failed: '❌',
        pending: '⏳',
        validation_failed: '⚠️',
        backup_failed: '💥',
        edit_failed: '❌',
        multiple_occurrences: '⚠️',
        error: '💥'
      }[op.status] || '❓';
      
      console.log(`${index + 1}. ${statusIcon} ${op.filePath}`);
      console.log(`   Status: ${op.status}`);
      console.log(`   Timestamp: ${op.timestamp}`);
      
      if (op.occurrences) {
        console.log(`   Ocorrências: ${op.occurrences}`);
      }
      
      if (op.error) {
        console.log(`   Erro: ${op.error}`);
      }
      
      if (op.backupPath) {
        console.log(`   Backup: ${op.backupPath}`);
      }
      
      console.log('');
    });
  }
}

// Função para uso em outros scripts
function createSafeEditor() {
  return new SafeEditor();
}

// Exportar para uso em outros módulos
export { SafeEditor, createSafeEditor };

// Exemplo de uso
if (import.meta.url === `file://${process.argv[1]}`) {
  const editor = new SafeEditor();
  
  // Exemplo de edição segura
  const success = editor.safeEdit(
    'src/components/SwapRequestView.tsx',
    'let tabs',
    'const tabs',
    {
      createBackup: true,
      skipValidation: false,
      allowMultiple: false
    }
  );
  
  if (success) {
    console.log('✅ Edição concluída com sucesso!');
  } else {
    console.log('❌ Edição falhou!');
  }
  
  editor.printOperationHistory();
}
