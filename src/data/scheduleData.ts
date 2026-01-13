export interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  shift1: string;
  shift2: string;
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
  originalDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  adminApproved?: boolean;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  createdAt: string;
}

// January 2026 schedule
export const scheduleData: ScheduleEntry[] = [
  { date: "01/01/2026", dayOfWeek: "QUINTA-FEIRA", shift1: "CARLOS", shift2: "CARLOS" },
  { date: "02/01/2026", dayOfWeek: "SEXTA-FEIRA", shift1: "ROSANA", shift2: "ROSANA" },
  { date: "03/01/2026", dayOfWeek: "SÁBADO", shift1: "LUCAS", shift2: "LUCAS" },
  { date: "04/01/2026", dayOfWeek: "DOMINGO", shift1: "HENRIQUE", shift2: "HENRIQUE" },
  { date: "05/01/2026", dayOfWeek: "SEGUNDA-FEIRA", shift1: "ROSANA", shift2: "KELLY" },
  { date: "06/01/2026", dayOfWeek: "TERÇA-FEIRA", shift1: "CARLOS", shift2: "KELLY" },
  { date: "07/01/2026", dayOfWeek: "QUARTA-FEIRA", shift1: "HENRIQUE", shift2: "ROSANA" },
  { date: "08/01/2026", dayOfWeek: "QUINTA-FEIRA", shift1: "HENRIQUE", shift2: "LUCAS" },
  { date: "09/01/2026", dayOfWeek: "SEXTA-FEIRA", shift1: "CARLOS", shift2: "ROSANA" },
  { date: "10/01/2026", dayOfWeek: "SÁBADO", shift1: "KELLY", shift2: "KELLY" },
  { date: "11/01/2026", dayOfWeek: "DOMINGO", shift1: "LUCAS", shift2: "LUCAS" },
  { date: "12/01/2026", dayOfWeek: "SEGUNDA-FEIRA", shift1: "HENRIQUE", shift2: "LUCAS" },
  { date: "13/01/2026", dayOfWeek: "TERÇA-FEIRA", shift1: "CARLOS", shift2: "KELLY" },
  { date: "14/01/2026", dayOfWeek: "QUARTA-FEIRA", shift1: "ROSANA", shift2: "LUCAS" },
  { date: "15/01/2026", dayOfWeek: "QUINTA-FEIRA", shift1: "HENRIQUE", shift2: "KELLY" },
  { date: "16/01/2026", dayOfWeek: "SEXTA-FEIRA", shift1: "ROSANA", shift2: "CARLOS" },
  { date: "17/01/2026", dayOfWeek: "SÁBADO", shift1: "HENRIQUE", shift2: "HENRIQUE" },
  { date: "18/01/2026", dayOfWeek: "DOMINGO", shift1: "LUCAS", shift2: "LUCAS" },
  { date: "19/01/2026", dayOfWeek: "SEGUNDA-FEIRA", shift1: "HENRIQUE", shift2: "CARLOS" },
  { date: "20/01/2026", dayOfWeek: "TERÇA-FEIRA", shift1: "GUILHERME", shift2: "KELLY" },
  { date: "21/01/2026", dayOfWeek: "QUARTA-FEIRA", shift1: "GUILHERME", shift2: "ROSANA" },
  { date: "22/01/2026", dayOfWeek: "QUINTA-FEIRA", shift1: "HENRIQUE", shift2: "KELLY" },
  { date: "23/01/2026", dayOfWeek: "SEXTA-FEIRA", shift1: "LUCAS", shift2: "CARLOS" },
  { date: "24/01/2026", dayOfWeek: "SÁBADO", shift1: "ROSANA", shift2: "ROSANA" },
  { date: "25/01/2026", dayOfWeek: "DOMINGO", shift1: "GUILHERME", shift2: "GUILHERME" },
  { date: "26/01/2026", dayOfWeek: "SEGUNDA-FEIRA", shift1: "KELLY", shift2: "KELLY" },
  { date: "27/01/2026", dayOfWeek: "TERÇA-FEIRA", shift1: "HENRIQUE", shift2: "CARLOS" },
  { date: "28/01/2026", dayOfWeek: "QUARTA-FEIRA", shift1: "ROSANA", shift2: "LUCAS" },
  { date: "29/01/2026", dayOfWeek: "QUINTA-FEIRA", shift1: "GUILHERME", shift2: "KELLY" },
  { date: "30/01/2026", dayOfWeek: "SEXTA-FEIRA", shift1: "LUCAS", shift2: "CARLOS" },
  { date: "31/01/2026", dayOfWeek: "SÁBADO", shift1: "GUILHERME", shift2: "GUILHERME" },
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
    employees.add(entry.shift1);
    employees.add(entry.shift2);
  });
  return Array.from(employees).sort();
};

export const getEmployeeSchedule = (name: string): ScheduleEntry[] => {
  return scheduleData.filter(
    entry => entry.shift1 === name || entry.shift2 === name
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
    
    // Count shift1
    if (!stats[entry.shift1]) {
      stats[entry.shift1] = { totalDays: 0, weekendDays: 0 };
    }
    stats[entry.shift1].totalDays++;
    if (isWeekend) stats[entry.shift1].weekendDays++;
    
    // Count shift2 if different
    if (entry.shift2 !== entry.shift1) {
      if (!stats[entry.shift2]) {
        stats[entry.shift2] = { totalDays: 0, weekendDays: 0 };
      }
      stats[entry.shift2].totalDays++;
      if (isWeekend) stats[entry.shift2].weekendDays++;
    }
  });
  
  return Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalDays - a.totalDays);
};
