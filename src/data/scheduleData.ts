export interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;  // Meio período (manhã/tarde)
  fechamento: string;   // Fechamento (noite)
}

export type UserRole = 'operador' | 'administrador';
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
  { date: "01/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "", fechamento: "" },
  { date: "02/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "03/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "04/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "05/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "06/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "07/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "", fechamento: "" },
  { date: "08/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "", fechamento: "" },
  { date: "09/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "10/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "11/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "12/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "13/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "14/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "", fechamento: "" },
  { date: "15/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "", fechamento: "" },
  { date: "16/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "17/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "18/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "19/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "20/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "21/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "", fechamento: "" },
  { date: "22/02/2026", dayOfWeek: "DOMINGO", meioPeriodo: "", fechamento: "" },
  { date: "23/02/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "24/02/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "25/02/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "26/02/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "27/02/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "", fechamento: "" },
  { date: "28/02/2026", dayOfWeek: "SÁBADO", meioPeriodo: "", fechamento: "" }
];

export const initialUsers: User[] = [
  { id: "1", name: "LUCAS", password: "1234", role: "operador", status: "ativo" },
  { id: "2", name: "CARLOS", password: "1234", role: "operador", status: "ativo" },
  { id: "3", name: "ROSANA", password: "1234", role: "operador", status: "ativo" },
  { id: "4", name: "HENRIQUE", password: "1234", role: "operador", status: "ativo" },
  { id: "5", name: "KELLY", password: "1234", role: "operador", status: "ativo" },
  { id: "6", name: "GUILHERME", password: "1234", role: "operador", status: "ativo" },
  { id: "7", name: "RICARDO", password: "1234", role: "administrador", status: "ativo", hideFromSchedule: true },
  { id: "8", name: "ADMIN", password: "1234", role: "administrador", status: "ativo", hideFromSchedule: true },
];

// Helper functions for schedule management
export const createScheduleStorage = (): ScheduleStorage => {
  const saved = localStorage.getItem('escala_scheduleStorage');
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Initialize with January and February 2026 as current schedules
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
  importedBy: string
): { success: boolean; message: string; archived?: ArchivedSchedule[] } => {
  const storage = createScheduleStorage();
  
  // Check if month already exists
  const existingIndex = storage.current.findIndex(s => s.month === month && s.year === year);
  
  if (existingIndex !== -1) {
    return { 
      success: false, 
      message: `Já existe uma escala para ${getMonthName(month)}/${year}` 
    };
  }
  
  // Archive old schedules if needed (keep last 6 months instead of 3)
  const archived: ArchivedSchedule[] = [];
  const cutoffDate = new Date(year, month - 1, 1);
  cutoffDate.setMonth(cutoffDate.getMonth() - 6); // Keep last 6 months
  
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
  
  // Add new schedule
  const newSchedule: MonthSchedule = {
    month,
    year,
    entries,
    importedAt: new Date().toISOString(),
    importedBy,
    isActive: true // New schedules are active by default
  };
  
  storage.current.push(newSchedule);
  saveScheduleStorage(storage);
  
  return { 
    success: true, 
    message: `Escala de ${getMonthName(month)}/${year} importada com sucesso`,
    archived: archived.length > 0 ? archived : undefined
  };
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
