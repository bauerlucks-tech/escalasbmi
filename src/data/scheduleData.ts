export interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;  // Meio período (manhã/tarde)
  fechamento: string;   // Fechamento (noite)
}

export type UserRole = 'operador' | 'administrador';
export type UserStatus = 'ativo' | 'arquivado';

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
}

export interface ArchivedSchedule extends MonthSchedule {
  archivedAt: string;
  archivedBy: string;
}

export interface ScheduleStorage {
  current: MonthSchedule[];
  archived: ArchivedSchedule[];
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
  { date: "08/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "09/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "CARLOS", fechamento: "ROSANA" },
  { date: "10/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "KELLY", fechamento: "KELLY" },
  { date: "11/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "12/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "LUCAS" },
  { date: "13/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "CARLOS", fechamento: "KELLY" },
  { date: "14/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "LUCAS" },
  { date: "15/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "16/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "CARLOS" },
  { date: "17/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "HENRIQUE", fechamento: "HENRIQUE" },
  { date: "18/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "LUCAS", fechamento: "LUCAS" },
  { date: "19/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "CARLOS" },
  { date: "20/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "21/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "ROSANA" },
  { date: "22/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "KELLY" },
  { date: "23/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "LUCAS", fechamento: "CARLOS" },
  { date: "24/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "ROSANA", fechamento: "ROSANA" },
  { date: "25/01/2026", dayOfWeek: "DOMINGO", meioPeriodo: "GUILHERME", fechamento: "GUILHERME" },
  { date: "26/01/2026", dayOfWeek: "SEGUNDA-FEIRA", meioPeriodo: "KELLY", fechamento: "KELLY" },
  { date: "27/01/2026", dayOfWeek: "TERÇA-FEIRA", meioPeriodo: "HENRIQUE", fechamento: "CARLOS" },
  { date: "28/01/2026", dayOfWeek: "QUARTA-FEIRA", meioPeriodo: "ROSANA", fechamento: "LUCAS" },
  { date: "29/01/2026", dayOfWeek: "QUINTA-FEIRA", meioPeriodo: "GUILHERME", fechamento: "KELLY" },
  { date: "30/01/2026", dayOfWeek: "SEXTA-FEIRA", meioPeriodo: "LUCAS", fechamento: "CARLOS" },
  { date: "31/01/2026", dayOfWeek: "SÁBADO", meioPeriodo: "GUILHERME", fechamento: "GUILHERME" },
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
  
  // Initialize with January 2026 as current schedule
  return {
    current: [{
      month: 1,
      year: 2026,
      entries: scheduleData,
      importedAt: new Date().toISOString(),
      importedBy: 'system'
    }],
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
  
  // Archive old schedules if needed (keep last 3 months)
  const archived: ArchivedSchedule[] = [];
  const cutoffDate = new Date(year, month - 1, 1);
  cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Keep last 3 months
  
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
    importedBy
  };
  
  storage.current.push(newSchedule);
  saveScheduleStorage(storage);
  
  return { 
    success: true, 
    message: `Escala de ${getMonthName(month)}/${year} importada com sucesso`,
    archived: archived.length > 0 ? archived : undefined
  };
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
