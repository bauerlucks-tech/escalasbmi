/**
 * Utilitários de Backup - Sistema de backup e restauração
 * Gerencia backup completo de dados do sistema
 */

import { ScheduleEntry, SwapRequest } from '@/types';

export interface CompleteBackup {
  version: string;
  timestamp: string;
  data: {
    schedules: ScheduleEntry[];
    swaps: SwapRequest[];
    users?: any[];
    metadata?: {
      totalSchedules: number;
      totalSwaps: number;
      backupType: 'complete' | 'partial';
    };
  };
}

/**
 * Baixa backup completo do sistema
 */
export const downloadCompleteBackup = async (): Promise<void> => {
  try {
    // Obter dados do localStorage ou API
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const swaps = JSON.parse(localStorage.getItem('swaps') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const backup: CompleteBackup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        schedules,
        swaps,
        users,
        metadata: {
          totalSchedules: schedules.length,
          totalSwaps: swaps.length,
          backupType: 'complete'
        }
      }
    };

    // Criar e baixar arquivo
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-escalas-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup completo baixado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao baixar backup:', error);
    throw error;
  }
};

/**
 * Restaura backup completo do sistema
 */
export const restoreCompleteBackup = async (backup: CompleteBackup): Promise<boolean> => {
  try {
    // Validar estrutura do backup
    if (!backup.version || !backup.timestamp || !backup.data) {
      throw new Error('Estrutura de backup inválida');
    }

    // Restaurar dados no localStorage
    if (backup.data.schedules) {
      localStorage.setItem('schedules', JSON.stringify(backup.data.schedules));
    }
    
    if (backup.data.swaps) {
      localStorage.setItem('swaps', JSON.stringify(backup.data.swaps));
    }
    
    if (backup.data.users) {
      localStorage.setItem('users', JSON.stringify(backup.data.users));
    }

    // Salvar metadados do backup
    const backupHistory = JSON.parse(localStorage.getItem('backupHistory') || '[]');
    backupHistory.push({
      version: backup.version,
      timestamp: backup.timestamp,
      restoredAt: new Date().toISOString(),
      metadata: backup.data.metadata
    });
    localStorage.setItem('backupHistory', JSON.stringify(backupHistory));

    console.log('✅ Backup restaurado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    throw error;
  }
};

/**
 * Valida arquivo de backup
 */
export const validateBackupFile = (file: File): Promise<CompleteBackup> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        // Validar estrutura mínima
        if (!backup.version || !backup.data) {
          reject(new Error('Arquivo de backup inválido'));
          return;
        }
        
        resolve(backup);
      } catch (error) {
        reject(new Error('Erro ao ler arquivo de backup'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Lista backups armazenados
 */
export const getStoredBackups = (): StoredBackup[] => {
  try {
    const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
    return history.map((backup: any, index: number) => ({
      ...backup,
      id: `backup-${index}-${Date.now()}`
    }));
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    return [];
  }
};

interface StoredBackup {
  id: string;
  version: string;
  timestamp: string;
  restoredAt: string;
  metadata?: any;
}

/**
 * Limpa histórico de backups
 */
export const clearBackupHistory = (): void => {
  localStorage.removeItem('backupHistory');
  console.log('✅ Histórico de backups limpo');
};
