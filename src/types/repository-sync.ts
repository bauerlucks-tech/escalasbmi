// TIPOS PARA O SISTEMA DE SINCRONIZAÇÃO
export interface WindowWithRepositorySync extends Window {
  repositorySync?: {
    syncNow: () => boolean;
    startAutoSync: () => void;
    listBackups: () => any[];
    collectData: () => any;
    restore: (backupData: any) => boolean;
  };
}

export interface BackupInfo {
  fileName: string;
  timestamp: string;
  size: number;
  version: string;
}

export interface RepositorySyncData {
  timestamp: string;
  version: string;
  data: {
    scheduleStorage: any;
    currentSchedules: any;
    archivedSchedules: any;
    scheduleData: any;
    swapRequests: any;
    users: any;
    vacations: any;
    auditLogs: any;
  };
  metadata: {
    backupType: string;
    environment: string;
    source: string;
    userAgent: string;
    url: string;
  };
}

declare global {
  interface Window {
    repositorySync?: {
      syncNow: () => boolean;
      startAutoSync: () => void;
      listBackups: () => BackupInfo[];
      collectData: () => RepositorySyncData;
      restore: (backupData: any) => boolean;
    };
  }
}
