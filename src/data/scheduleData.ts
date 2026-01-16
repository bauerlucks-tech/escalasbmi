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
}

export interface MonthSchedule {
  month: number; // 1-12
  year: number;
  entries: ScheduleEntry[];
  importedAt?: string;
  importedBy?: string;
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
  { id: "7", name: "RICARDO", password: "1234", role: "administrador", status: "ativo" },
];

export const getUniqueEmployees = (): string[] => {
  const employees = new Set<string>();
  scheduleData.forEach(entry => {
    employees.add(entry.meioPeriodo);
    employees.add(entry.fechamento);
  });
  return Array.from(employees).sort();
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
