// Sistema de Logs para Auditoria
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'SWAP_REQUEST' | 'SWAP_RESPONSE' | 'SWAP_APPROVAL' | 'SCHEDULE_IMPORT' | 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'ADMIN_LOGIN';
  details: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogStorage {
  logs: AuditLog[];
  lastCleanup: string;
}

// Funções de gerenciamento de logs
export const createAuditLogStorage = (): AuditLogStorage => {
  const saved = localStorage.getItem('escala_auditLogs');
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    logs: [],
    lastCleanup: new Date().toISOString()
  };
};

export const saveAuditLogStorage = (storage: AuditLogStorage): void => {
  localStorage.setItem('escala_auditLogs', JSON.stringify(storage));
};

export const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
  const storage = createAuditLogStorage();
  const newLog: AuditLog = {
    ...log,
    id: generateLogId(),
    timestamp: new Date().toISOString()
  };
  
  storage.logs.unshift(newLog); // Adicionar no início (mais recente primeiro)
  
  // Manter apenas os últimos 1000 logs para não sobrecarregar
  if (storage.logs.length > 1000) {
    storage.logs = storage.logs.slice(0, 1000);
  }
  
  saveAuditLogStorage(storage);
};

export const getAuditLogs = (): AuditLog[] => {
  const storage = createAuditLogStorage();
  return storage.logs;
};

export const getAuditLogsByUser = (userId: string): AuditLog[] => {
  const logs = getAuditLogs();
  return logs.filter(log => log.userId === userId);
};

export const getAuditLogsByAction = (action: AuditLog['action']): AuditLog[] => {
  const logs = getAuditLogs();
  return logs.filter(log => log.action === action);
};

export const getAuditLogsByDateRange = (startDate: Date, endDate: Date): AuditLog[] => {
  const logs = getAuditLogs();
  const start = startDate.getTime();
  const end = endDate.getTime();
  
  return logs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    return logTime >= start && logTime <= end;
  });
};

// Utilitários
const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getClientInfo = (): { ipAddress?: string; userAgent?: string } => {
  // Em um ambiente real, você obteria o IP real do servidor
  // Por enquanto, usamos informações disponíveis no cliente
  return {
    userAgent: navigator.userAgent,
    ipAddress: 'client-side' // Placeholder - em produção, viria do servidor
  };
};

// Funções específicas para diferentes tipos de logs
export const logLogin = (userId: string, userName: string, success: boolean, errorMessage?: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'LOGIN',
    details: success ? 'Login realizado com sucesso' : `Falha no login: ${errorMessage}`,
    ...clientInfo,
    success,
    errorMessage
  });
};

export const logLogout = (userId: string, userName: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'LOGOUT',
    details: 'Logout realizado',
    ...clientInfo,
    success: true
  });
};

export const logPasswordChange = (userId: string, userName: string, success: boolean, errorMessage?: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'PASSWORD_CHANGE',
    details: success ? 'Senha alterada com sucesso' : `Falha ao alterar senha: ${errorMessage}`,
    ...clientInfo,
    success,
    errorMessage
  });
};

export const logSwapRequest = (userId: string, userName: string, details: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'SWAP_REQUEST',
    details,
    ...clientInfo,
    success: true
  });
};

export const logSwapResponse = (userId: string, userName: string, details: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'SWAP_RESPONSE',
    details,
    ...clientInfo,
    success: true
  });
};

export const logSwapApproval = (userId: string, userName: string, details: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'SWAP_APPROVAL',
    details,
    ...clientInfo,
    success: true
  });
};

export const logScheduleImport = (userId: string, userName: string, details: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'SCHEDULE_IMPORT',
    details,
    ...clientInfo,
    success: true
  });
};

export const logUserManagement = (userId: string, userName: string, action: 'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE', details: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action,
    details,
    ...clientInfo,
    success: true
  });
};

export const logAdminLogin = (userId: string, userName: string): void => {
  const clientInfo = getClientInfo();
  addAuditLog({
    userId,
    userName,
    action: 'ADMIN_LOGIN',
    details: 'Login de administrador realizado',
    ...clientInfo,
    success: true
  });
};
