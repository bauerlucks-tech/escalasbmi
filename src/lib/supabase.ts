// CLIENTE SUPABASE PARA O SISTEMA DE ESCALAS
// Substituir completamente o localStorage por Supabase

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://SEU-PROJETO.supabase.co';
const supabaseKey = 'SUA-CHAVE-ANONIMA';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos TypeScript
export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'operador' | 'administrador' | 'super_admin';
  status: 'ativo' | 'arquivado';
  hide_from_schedule?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthSchedule {
  id: string;
  month: number;
  year: number;
  entries: ScheduleEntry[];
  imported_by?: string;
  imported_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEntry {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;
  fechamento: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  requester_name: string;
  target_id: string;
  target_name: string;
  original_date: string;
  original_shift: 'meioPeriodo' | 'fechamento';
  target_date: string;
  target_shift: 'meioPeriodo' | 'fechamento';
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  responded_at?: string;
  responded_by?: string;
  admin_approved?: boolean;
  admin_approved_at?: string;
  admin_approved_by?: string;
  created_at: string;
}

export interface VacationRequest {
  id: string;
  operator_id: string;
  operator_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  month: number;
  year: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  action: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// API Functions
export class SupabaseAPI {
  // AUTENTICAÇÃO
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // USUÁRIOS
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ESCALAS MENSAIS
  static async getMonthSchedules(): Promise<MonthSchedule[]> {
    const { data, error } = await supabase
      .from('month_schedules')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getScheduleByMonth(month: number, year: number): Promise<MonthSchedule | null> {
    const { data, error } = await supabase
      .from('month_schedules')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createSchedule(schedule: Omit<MonthSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<MonthSchedule> {
    const { data, error } = await supabase
      .from('month_schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateSchedule(id: string, updates: Partial<MonthSchedule>): Promise<MonthSchedule> {
    const { data, error } = await supabase
      .from('month_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async replaceSchedule(month: number, year: number, entries: ScheduleEntry[], importedBy: string): Promise<MonthSchedule> {
    // Primeiro, verificar se já existe
    const existing = await this.getScheduleByMonth(month, year);
    
    if (existing) {
      // Atualizar existente
      return await this.updateSchedule(existing.id, {
        entries,
        imported_by: importedBy,
        imported_at: new Date().toISOString()
      });
    } else {
      // Criar novo
      return await this.createSchedule({
        month,
        year,
        entries,
        imported_by: importedBy,
        imported_at: new Date().toISOString(),
        is_active: true
      });
    }
  }

  // SOLICITAÇÕES DE TROCA
  static async getSwapRequests(): Promise<SwapRequest[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select(`
        *,
        users!requester_id(name),
        users!target_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Processar dados para extrair nomes do JOIN
    const processedData = (data || []).map(item => ({
      ...item,
      requester_name: item.users?.requester_id?.name || '',
      target_name: item.users?.target_id?.name || ''
    }));
    
    return processedData;
  }

  static async createSwapRequest(request: Omit<SwapRequest, 'id' | 'created_at'>): Promise<SwapRequest> {
    const { data, error } = await supabase
      .from('swap_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateSwapRequest(id: string, updates: Partial<SwapRequest>): Promise<SwapRequest> {
    const { data, error } = await supabase
      .from('swap_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPendingSwaps(): Promise<SwapRequest[]> {
    const { data, error } = await supabase
      .from('swap_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // AUDIT LOGS
  static async addAuditLog(userId: string | null, userName: string, action: string, details: string): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        user_name: userName,
        action,
        details,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Erro ao salvar log de auditoria:', error);
      // Fallback para localStorage
      const logs = JSON.parse(localStorage.getItem('escala_auditLogs') || '[]');
      logs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        user_name: userName,
        action,
        details,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('escala_auditLogs', JSON.stringify(logs.slice(0, 1000)));
    }
  }

  // FÉRIAS
  static async getVacationRequests(): Promise<VacationRequest[]> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createVacationRequest(request: Omit<VacationRequest, 'id' | 'requested_at'>): Promise<VacationRequest> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .insert(request)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateVacationRequest(id: string, updates: Partial<VacationRequest>): Promise<VacationRequest> {
    const { data, error } = await supabase
      .from('vacation_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // LOGS DE AUDITORIA
  static async createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  // BACKUPS
  static async createBackup(data: any): Promise<void> {
    const { error } = await supabase
      .from('system_backups')
      .insert({
        backup_data: data,
        backup_type: 'manual',
        version: '1.3.100322',
        file_size: JSON.stringify(data).length
      });
    
    if (error) throw error;
  }

  static async getBackups(): Promise<any[]> {
    const { data, error } = await supabase
      .from('system_backups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    return data || [];
  }

  // REAL-TIME SUBSCRIPTIONS
  static subscribeToSchedules(callback: (payload: any) => void) {
    return supabase
      .channel('schedules')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'month_schedules' 
        }, 
        callback
      )
      .subscribe();
  }

  static subscribeToSwaps(callback: (payload: any) => void) {
    return supabase
      .channel('swaps')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'swap_requests' 
        }, 
        callback
      )
      .subscribe();
  }

  static subscribeToVacations(callback: (payload: any) => void) {
    return supabase
      .channel('vacations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vacation_requests' 
        }, 
        callback
      )
      .subscribe();
  }

  // UTILITÁRIOS
  static async applySwapToSchedule(request: SwapRequest): Promise<void> {
    // Buscar a escala do mês original
    const originalDate = new Date(request.original_date);
    const originalMonth = originalDate.getMonth() + 1;
    const originalYear = originalDate.getFullYear();
    
    const targetDate = new Date(request.target_date);
    const targetMonth = targetDate.getMonth() + 1;
    const targetYear = targetDate.getFullYear();
    
    // Atualizar escala original
    const originalSchedule = await this.getScheduleByMonth(originalMonth, originalYear);
    if (originalSchedule) {
      const updatedEntries = originalSchedule.entries.map(entry => {
        if (entry.date === request.original_date) {
          return {
            ...entry,
            [request.original_shift]: request.target_name
          };
        }
        return entry;
      });
      
      await this.updateSchedule(originalSchedule.id, { entries: updatedEntries });
    }
    
    // Atualizar escala alvo
    const targetSchedule = await this.getScheduleByMonth(targetMonth, targetYear);
    if (targetSchedule) {
      const updatedEntries = targetSchedule.entries.map(entry => {
        if (entry.date === request.target_date) {
          return {
            ...entry,
            [request.target_shift]: request.requester_name
          };
        }
        return entry;
      });
      
      await this.updateSchedule(targetSchedule.id, { entries: updatedEntries });
    }
  }
}

export default SupabaseAPI;
