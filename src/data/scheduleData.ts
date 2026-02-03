export interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;  // Meio período (manhã/tarde)
  fechamento: string;   // Fechamento (noite)
}

export type UserRole = 'operador' | 'administrador' | 'super_admin';
export type UserStatus = 'ativo' | 'arquivado';
export type VacationStatus = 'pending' | 'approved' | 'rejected';

export interface VacationRequest {
  id: string;
  operatorId: string;
  operatorName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: VacationStatus;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  month: number;
  year: number;
}

export interface User {
  id: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  hideFromSchedule?: boolean;
}

export interface MonthSchedule {
  month: number; // 1-12
  year: number;
  entries: ScheduleEntry[];
  importedAt?: string;
  importedBy?: string;
  isArchived?: boolean;
  archivedAt?: string;
  isActive?: boolean; // New field to control activation
}

export interface ArchivedSchedule extends MonthSchedule {
  archivedAt: string;
  archivedBy: string;
}

export interface ScheduleStorage {
  current: MonthSchedule[];
  archived: ArchivedSchedule[];
}

export interface VacationStorage {
  requests: VacationRequest[];
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  originalDate: string;      // Dia que o solicitante quer trocar
  originalShift: 'meioPeriodo' | 'fechamento'; // Turno que o solicitante quer ceder
  targetDate: string;        // Dia que o solicitante quer pegar
  targetShift: 'meioPeriodo' | 'fechamento';   // Turno que o solicitante quer assumir
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  respondedAt?: string;       // Quando o colega respondeu
  respondedBy?: string;       // Nome do colega que respondeu (targetName)
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  createdAt: string;
}

// January 2026 schedule
export const scheduleData: ScheduleEntry[] = [
  { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "CARLOS" },
  { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
  { date: "03/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "04/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
  { date: "05/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "ROSANA", fechamento: "KELLY" },
  { date: "06/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "07/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "08/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "09/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "10/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
  { date: "11/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "12/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "LUCAS", fechamento: "ROSANA" },
  { date: "13/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "14/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "15/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "16/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "17/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "18/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "19/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "20/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "21/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "22/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "23/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "24/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "25/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "26/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "27/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "28/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "29/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "30/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "31/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "CARLOS", fechamento: "ROSANA" }
];

// February 2026 schedule
export const februaryScheduleData: ScheduleEntry[] = [
  { date: "01/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "CARLOS" },
  { date: "02/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "ROSANA", fechamento: "HENRIQUE" },
  { date: "03/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "04/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "05/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "06/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "07/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
  { date: "08/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "09/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "LUCAS", fechamento: "ROSANA" },
  { date: "10/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "11/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "12/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "13/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "ROSANA" },
  { date: "14/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "15/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "16/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "17/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "18/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "19/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "20/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "21/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "22/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "23/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "24/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "25/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "26/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "27/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "28/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "CARLOS", fechamento: "ROSANA" }
];

export const initialUsers: User[] = [
  { id: "1", name: "LUCAS", password: "1234", role: "operador", status: "ativo" },
  { id: "2", name: "CARLOS", password: "1234", role: "operador", status: "ativo" },
  { id: "3", name: "ROSANA", password: "1234", role: "operador", status: "ativo" },
  { id: "4", name: "HENRIQUE", password: "1234", role: "operador", status: "ativo" },
  { id: "5", name: "KELLY", password: "1234", role: "operador", status: "ativo" },
  { id: "6", name: "GUILHERME", password: "1234", role: "operador", status: "ativo" },
  { id: "7", name: "RICARDO", password: "1234", role: "administrador", status: "ativo", hideFromSchedule: true },
  { id: "8", name: "ADMIN", password: "1234", role: "super_admin", status: "ativo", hideFromSchedule: true },
  // Usuários de teste para testes completos
  { id: "9", name: "TESTE_OPERADOR1", password: "1234", role: "operador", status: "ativo" },
  { id: "10", name: "TESTE_OPERADOR2", password: "1234", role: "operador", status: "ativo" },
  { id: "11", name: "TESTE_ADMIN", password: "1234", role: "administrador", status: "ativo", hideFromSchedule: true },
  { id: "12", name: "TESTE_SUPER", password: "1234", role: "super_admin", status: "ativo", hideFromSchedule: true },
];

// Função para buscar dados do Supabase
const fetchFromSupabase = async () => {
  try {
    const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
    const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/month_schedules?select=*&order=year.desc,month.desc`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const schedules = await response.json();
      console.log(`✅ ${schedules.length} escalas buscadas do Supabase`);
      
      // Salvar no localStorage
      localStorage.setItem('escala_scheduleStorage', JSON.stringify(schedules));
      
      // Disparar evento para atualizar UI
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'escala_scheduleStorage',
        newValue: JSON.stringify(schedules)
      }));
      
      return schedules;
    } else {
      console.log('❌ Erro ao buscar do Supabase:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar do Supabase:', error);
    return null;
  }
};

// Helper functions for schedule management
export const createScheduleStorage = (): ScheduleStorage => {
  const saved = localStorage.getItem('escala_scheduleStorage');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Se for array (formato do Supabase), converter para ScheduleStorage
    if (Array.isArray(parsed)) {
      return {
        current: parsed,
        archived: []
      };
    }
    return parsed;
  }
  
  // Se não tiver no localStorage, buscar do Supabase
  console.log('🔄 Buscando dados do Supabase...');
  fetchFromSupabase();
  
  // Initialize with January and February 2026 as current schedules (fallback)
  return {
    current: [
      {
        month: 1,
        year: 2026,
        entries: scheduleData,
        importedAt: new Date().toISOString(),
        importedBy: 'system',
        isActive: true
      },
      {
        month: 2,
        year: 2026,
        entries: februaryScheduleData,
        importedAt: new Date().toISOString(),
        importedBy: 'system',
        isActive: true
      }
    ],
    archived: []
  };
};

export const saveScheduleStorage = (storage: ScheduleStorage): void => {
  localStorage.setItem('escala_scheduleStorage', JSON.stringify(storage));
};

export const getCurrentSchedule = (): ScheduleEntry[] => {
  const storage = createScheduleStorage();
  if (storage.current.length === 0) return scheduleData;
  
  // Get the most recent schedule
  const mostRecent = storage.current.sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1);
    const dateB = new Date(b.year, b.month - 1);
    return dateB.getTime() - dateA.getTime();
  })[0];
  
  return mostRecent.entries;
};

export const getScheduleByMonth = (month: number, year: number): MonthSchedule | null => {
  const storage = createScheduleStorage();
  return storage.current.find(s => s.month === month && s.year === year) || null;
};

export const addNewMonthSchedule = (
  month: number, 
  year: number, 
  entries: ScheduleEntry[], 
  importedBy: string,
  activate: boolean = true,
  replace: boolean = false
): { success: boolean; message: string; archived?: ArchivedSchedule[] } => {
  const storage = createScheduleStorage();
  
  // Check if month already exists
  const existingIndex = storage.current.findIndex(s => s.month === month && s.year === year);
  
  if (existingIndex !== -1 && !replace) {
    return { 
      success: false, 
      message: `Já existe uma escala para ${getMonthName(month)}/${year}` 
    };
  }
  
  // Archive old schedules if needed (keep last 24 months for full year import)
  const archived: ArchivedSchedule[] = [];
  const cutoffDate = new Date(year, month - 1, 1);
  cutoffDate.setMonth(cutoffDate.getMonth() - 24); // Keep last 24 months
  
  const toArchive = storage.current.filter(schedule => {
    const scheduleDate = new Date(schedule.year, schedule.month - 1);
    return scheduleDate < cutoffDate;
  });
  
  toArchive.forEach(schedule => {
    const archivedSchedule: ArchivedSchedule = {
      ...schedule,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      archivedBy: importedBy
    };
    archived.push(archivedSchedule);
  });
  
  // Remove archived from current and add to archived
  storage.current = storage.current.filter(schedule => {
    const scheduleDate = new Date(schedule.year, schedule.month - 1);
    return scheduleDate >= cutoffDate;
  });
  storage.archived.push(...archived);
  
  // Add new schedule or replace existing
  const newSchedule: MonthSchedule = {
    month,
    year,
    entries,
    importedAt: new Date().toISOString(),
    importedBy,
    isActive: activate // Use the activation parameter
  };
  
  if (existingIndex !== -1 && replace) {
    // Replace existing schedule
    storage.current[existingIndex] = newSchedule;
  } else {
    // Add new schedule
    storage.current.push(newSchedule);
  }
  
  saveScheduleStorage(storage);
  
  return { 
    success: true, 
    message: `Escala de ${getMonthName(month)}/${year} importada com sucesso`,
    archived: archived.length > 0 ? archived : undefined
  };
};

export const updateMonthSchedule = (month: number, year: number, entries: ScheduleEntry[]): boolean => {
  const storage = createScheduleStorage();
  const scheduleIndex = storage.current.findIndex(s => s.month === month && s.year === year);
  
  if (scheduleIndex === -1) return false;
  
  // Update the schedule entries
  storage.current[scheduleIndex].entries = entries;
  saveScheduleStorage(storage);
  
  return true;
};

export const toggleScheduleActivation = (month: number, year: number): boolean => {
  const storage = createScheduleStorage();
  const scheduleIndex = storage.current.findIndex(s => s.month === month && s.year === year);
  
  if (scheduleIndex === -1) return false;
  
  // Toggle the isActive status
  storage.current[scheduleIndex].isActive = !storage.current[scheduleIndex].isActive;
  saveScheduleStorage(storage);
  
  return true;
};

export const archiveSchedule = (month: number, year: number, archivedBy: string): boolean => {
  const storage = createScheduleStorage();
  const scheduleIndex = storage.current.findIndex(s => s.month === month && s.year === year);
  
  if (scheduleIndex === -1) return false;
  
  const schedule = storage.current[scheduleIndex];
  const archivedSchedule: ArchivedSchedule = {
    ...schedule,
    isArchived: true,
    archivedAt: new Date().toISOString(),
    archivedBy
  };
  
  storage.current.splice(scheduleIndex, 1);
  storage.archived.push(archivedSchedule);
  saveScheduleStorage(storage);
  
  return true;
};

export const restoreArchivedSchedule = (month: number, year: number): boolean => {
  const storage = createScheduleStorage();
  const archivedIndex = storage.archived.findIndex(s => s.month === month && s.year === year);
  
  if (archivedIndex === -1) return false;
  
  const archivedSchedule = storage.archived[archivedIndex];
  const { archivedAt, archivedBy, isArchived, ...schedule } = archivedSchedule;
  
  storage.current.push(schedule);
  storage.archived.splice(archivedIndex, 1);
  saveScheduleStorage(storage);
  
  return true;
};

export const getArchivedSchedules = (): ArchivedSchedule[] => {
  const storage = createScheduleStorage();
  return storage.archived.sort((a, b) => {
    const dateA = new Date(a.archivedAt);
    const dateB = new Date(b.archivedAt);
    return dateB.getTime() - dateA.getTime();
  });
};

export const getCurrentSchedules = (): MonthSchedule[] => {
  const storage = createScheduleStorage();
  // Sort by date (newest first) but don't filter by active status
  return storage.current.sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1);
    const dateB = new Date(b.year, b.month - 1);
    return dateB.getTime() - dateA.getTime();
  });
};

export const getMonthName = (month: number): string => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[month - 1];
};

export const getEmployeeSchedule = (name: string): ScheduleEntry[] => {
  return scheduleData.filter(
    entry => entry.meioPeriodo === name || entry.fechamento === name
  );
};

// Helper to calculate schedule statistics
export const calculateScheduleStats = (entries: ScheduleEntry[]): {
  name: string;
  totalDays: number;
  weekendDays: number;
}[] => {
  const stats: Record<string, { totalDays: number; weekendDays: number }> = {};
  
  entries.forEach(entry => {
    const isWeekend = entry.dayOfWeek === 'SÁBADO' || entry.dayOfWeek === 'DOMINGO';
    
    // Count meioPeriodo
    if (!stats[entry.meioPeriodo]) {
      stats[entry.meioPeriodo] = { totalDays: 0, weekendDays: 0 };
    }
    stats[entry.meioPeriodo].totalDays++;
    if (isWeekend) stats[entry.meioPeriodo].weekendDays++;
    
    // Count fechamento if different
    if (entry.fechamento !== entry.meioPeriodo) {
      if (!stats[entry.fechamento]) {
        stats[entry.fechamento] = { totalDays: 0, weekendDays: 0 };
      }
      stats[entry.fechamento].totalDays++;
      if (isWeekend) stats[entry.fechamento].weekendDays++;
    }
  });
  
  return Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalDays - a.totalDays);
};

// Vacation storage functions
export const createVacationStorage = (): VacationStorage => {
  const stored = localStorage.getItem('vacationRequests');
  if (stored) {
    return JSON.parse(stored);
  }
  return { requests: [] };
};

export const saveVacationStorage = (storage: VacationStorage): void => {
  localStorage.setItem('vacationRequests', JSON.stringify(storage));
};

export const getVacationRequests = (): VacationRequest[] => {
  const storage = createVacationStorage();
  return storage.requests.sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
};

export const addVacationRequest = (
  operatorId: string,
  operatorName: string,
  startDate: string,
  endDate: string,
  reason?: string
): VacationRequest => {
  const storage = createVacationStorage();
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const request: VacationRequest = {
    id: `vacation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    operatorId,
    operatorName,
    startDate,
    endDate,
    totalDays,
    reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    month: start.getMonth() + 1,
    year: start.getFullYear()
  };
  
  storage.requests.push(request);
  saveVacationStorage(storage);
  
  return request;
};

export const updateVacationStatus = (
  requestId: string,
  status: VacationStatus,
  approvedBy?: string,
  rejectionReason?: string
): boolean => {
  const storage = createVacationStorage();
  const requestIndex = storage.requests.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) return false;
  
  storage.requests[requestIndex].status = status;
  storage.requests[requestIndex].approvedBy = approvedBy;
  storage.requests[requestIndex].approvedAt = new Date().toISOString();
  if (rejectionReason) {
    storage.requests[requestIndex].rejectionReason = rejectionReason;
  }
  
  saveVacationStorage(storage);
  return true;
};

export const getVacationRequestsByOperator = (operatorId: string): VacationRequest[] => {
  const storage = createVacationStorage();
  return storage.requests
    .filter(r => r.operatorId === operatorId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
};

export const getPendingVacationRequests = (): VacationRequest[] => {
  const storage = createVacationStorage();
  return storage.requests
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime());
};

// Funções de teste para testes completos do sistema
export const createTestVacationRequests = (): void => {
  const storage = createVacationStorage();
  
  // Adicionar solicitações de teste
  const testRequests: VacationRequest[] = [
    {
      id: 'test_vacation_1',
      operatorId: '9',
      operatorName: 'TESTE_OPERADOR1',
      startDate: '2026-01-15',
      endDate: '2026-01-20',
      totalDays: 6,
      reason: 'Teste de solicitação de férias',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      month: 1,
      year: 2026
    },
    {
      id: 'test_vacation_2',
      operatorId: '10',
      operatorName: 'TESTE_OPERADOR2',
      startDate: '2026-02-01',
      endDate: '2026-02-05',
      totalDays: 5,
      reason: 'Teste de férias aprovadas',
      status: 'approved',
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      approvedBy: 'TESTE_ADMIN',
      approvedAt: new Date().toISOString(),
      month: 2,
      year: 2026
    },
    {
      id: 'test_vacation_3',
      operatorId: '1',
      operatorName: 'LUCAS',
      startDate: '2026-01-25',
      endDate: '2026-01-27',
      totalDays: 3,
      reason: 'Teste de férias rejeitadas',
      status: 'rejected',
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      approvedBy: 'TESTE_ADMIN',
      approvedAt: new Date(Date.now() - 86400000).toISOString(),
      rejectionReason: 'Período não disponível',
      month: 1,
      year: 2026
    }
  ];
  
  storage.requests.push(...testRequests);
  saveVacationStorage(storage);
};

export const createTestSwapRequests = (): void => {
  const storage = createSwapStorage();
  
  // Adicionar solicitações de troca de teste
  const testSwaps: SwapRequest[] = [
    {
      id: 'test_swap_1',
      requesterId: '9',
      requesterName: 'TESTE_OPERADOR1',
      targetId: '10',
      targetName: 'TESTE_OPERADOR2',
      originalDate: '15/01/2026',
      originalShift: 'meioPeriodo',
      targetDate: '16/01/2026',
      targetShift: 'meioPeriodo',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      id: 'test_swap_2',
      requesterId: '1',
      requesterName: 'LUCAS',
      targetId: '2',
      targetName: 'CARLOS',
      originalDate: '10/01/2026',
      originalShift: 'fechamento',
      targetDate: '11/01/2026',
      targetShift: 'fechamento',
      status: 'accepted',
      respondedAt: new Date().toISOString(),
      respondedBy: 'CARLOS',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'test_swap_3',
      requesterId: '3',
      requesterName: 'ROSANA',
      targetId: '4',
      targetName: 'HENRIQUE',
      originalDate: '20/01/2026',
      originalShift: 'meioPeriodo',
      targetDate: '21/01/2026',
      targetShift: 'meioPeriodo',
      status: 'rejected',
      respondedAt: new Date().toISOString(),
      respondedBy: 'HENRIQUE',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];
  
  storage.requests.push(...testSwaps);
  saveSwapStorage(storage);
};

// Função auxiliar para swap storage
export const createSwapStorage = (): { requests: SwapRequest[] } => {
  const stored = localStorage.getItem('swapRequests');
  if (stored) {
    return JSON.parse(stored);
  }
  return { requests: [] };
};

export const saveSwapStorage = (storage: { requests: SwapRequest[] }): void => {
  localStorage.setItem('swapRequests', JSON.stringify(storage));
};

export const getSwapRequests = (): SwapRequest[] => {
  const storage = createSwapStorage();
  return storage.requests.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Função para limpar dados de teste
export const clearTestData = (): void => {
  localStorage.removeItem('vacationRequests');
  localStorage.removeItem('swapRequests');
  localStorage.removeItem('escala_scheduleStorage');
};
