import { supabase } from '@/api/client';

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  pendingSwaps: number;
  totalVacations: number;
  pendingVacations: number;
  monthlyWorkDays: number;
  averageWorkload: number;
}

// Basic SupabaseAPI class for backward compatibility
export class SupabaseAPI {
  static async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getMonthSchedules() {
    const { data, error } = await supabase.from('month_schedules').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getSwapRequests() {
    const { data, error } = await supabase.from('swap_requests').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getVacationRequests() {
    const { data, error } = await supabase.from('vacation_requests').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getAuditLogs(limit: number = 100) {
    const { data, error } = await supabase.from('audit_logs').select('*').limit(limit);
    if (error) throw error;
    return data || [];
  }

  static async createAuditLog(log: any) {
    const { data, error } = await supabase.from('audit_logs').insert(log).select().single();
    if (error) throw error;
    return data;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async createUser(user: any) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateUserPassword(id: string, newPasswordHash: string, changedBy: string, changedByName: string) {
    const { data, error } = await supabase.from('users').update({ 
      password: newPasswordHash,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    
    // Log de auditoria
    await this.addAuditLog(
      changedBy,
      changedByName,
      'PASSWORD_CHANGE',
      `Senha alterada para usuário ID: ${id}`
    );
    
    return data;
  }

  static async updateUserProfile(id: string, profileImage: string) {
    const { data, error } = await supabase.from('users').update({ 
      profile_image: profileImage,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }

  static async getScheduleByMonth(month: number, year: number) {
    const { data, error } = await supabase.from('month_schedules').select('*').eq('month', month).eq('year', year).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async createSchedule(schedule: any) {
    const { data, error } = await supabase.from('month_schedules').insert(schedule).select().single();
    if (error) throw error;
    return data;
  }

  static async updateSchedule(id: string, updates: any) {
    const { data, error } = await supabase.from('month_schedules').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async updateMonthSchedule(month: number, year: number, entries: any[]) {
    // Primeiro, buscar a escala existente
    const { data: existing, error: fetchError } = await supabase
      .from('month_schedules')
      .select('id')
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existing) {
      // Atualizar escala existente
      const { data, error } = await supabase
        .from('month_schedules')
        .update({ 
          entries,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Criar nova escala se não existir
      const { data, error } = await supabase
        .from('month_schedules')
        .insert({
          month,
          year,
          entries,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  static async replaceSchedule(month: number, year: number, entries: any[], importedBy: string) {
    const { data, error } = await supabase.rpc('replace_schedule', { month, year, entries, imported_by: importedBy });
    if (error) throw error;
    return data;
  }

  static async createSwapRequest(request: any) {
    const { data, error } = await supabase.from('swap_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  }

  static async updateSwapRequest(id: string, updates: any) {
    const { data, error } = await supabase.from('swap_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async applySwapToSchedule(request: any) {
    const { data, error } = await supabase.rpc('apply_swap_to_schedule', { request_id: request.id });
    if (error) throw error;
    return data;
  }

  static async createVacationRequest(request: any) {
    const { data, error } = await supabase.from('vacation_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  }

  static async updateVacationRequest(id: string, updates: any) {
    const { data, error } = await supabase.from('vacation_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  static async deleteVacationRequest(id: string) {
    const { error } = await supabase.from('vacation_requests').delete().eq('id', id);
    if (error) throw error;
  }

  static async subscribeToSchedules(callback: (payload: any) => void) {
    return supabase.channel('schedules').on('postgres_changes', { event: '*', schema: 'public', table: 'month_schedules' }, callback).subscribe();
  }

  static async subscribeToSwaps(callback: (payload: any) => void) {
    return supabase.channel('swaps').on('postgres_changes', { event: '*', schema: 'public', table: 'swap_requests' }, callback).subscribe();
  }

  static async subscribeToVacations(callback: (payload: any) => void) {
    return supabase.channel('vacations').on('postgres_changes', { event: '*', schema: 'public', table: 'vacation_requests' }, callback).subscribe();
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get all data in parallel
      const [usersResult, swapsResult, vacationsResult, schedulesResult] = await Promise.all([
        this.getUsers(),
        this.getSwapRequests(),
        this.getVacationRequests(),
        this.getMonthSchedules()
      ]);

      const users = usersResult || [];
      const swaps = swapsResult || [];
      const vacations = vacationsResult || [];
      const schedules = schedulesResult || [];

      // Calculate statistics
      const activeUsers = users.filter(u => u.status === 'ativo');
      const pendingSwaps = swaps.filter(s => s.status === 'pending');
      const pendingVacations = vacations.filter(v => v.status === 'pending');

      // Calculate current month stats
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const currentSchedule = schedules.find(s => s.month === currentMonth && s.year === currentYear);

      let monthlyWorkDays = 0;
      let totalAssignments = 0;

      if (currentSchedule) {
        monthlyWorkDays = currentSchedule.entries.length;
        currentSchedule.entries.forEach(entry => {
          if (entry.meioPeriodo) totalAssignments++;
          if (entry.fechamento) totalAssignments++;
        });
      }

      const averageWorkload = activeUsers.length > 0 ? Math.round(totalAssignments / activeUsers.length) : 0;

      return {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        totalSwaps: swaps.length,
        pendingSwaps: pendingSwaps.length,
        totalVacations: vacations.length,
        pendingVacations: pendingVacations.length,
        monthlyWorkDays,
        averageWorkload
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  static async addAuditLog(userId: string, userName: string, action: string, details: string | object) {
    const entry = {
      user_id: userId,
      user_name: userName,
      action,
      details: typeof details === 'string' ? details : details,
      created_at: new Date().toISOString()
    };
    return this.createAuditLog(entry);
  }
}

// Export types for compatibility
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface MonthSchedule {
  id: string;
  month: number;
  year: number;
  entries: any[];
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  target_id: string;
  original_date: string;
  target_date: string;
  original_shift: string;
  target_shift: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VacationRequest {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}
