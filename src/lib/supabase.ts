import { supabase } from '@/api/client';

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

  static async addAuditLog(entry: any) {
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
