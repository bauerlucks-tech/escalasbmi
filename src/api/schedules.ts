/**
 * API de Escalas - Camada de comunicação com Supabase
 * Responsável apenas por chamadas à API, sem lógica de negócio
 */
import { supabase } from './client';
import { ScheduleEntry } from '@/types/schedule';

export interface SchedulePayload {
  month: number;
  year: number;
  entries: ScheduleEntry[];
  imported_by?: string;
  imported_at?: string;
  is_active?: boolean;
}

// Exporta como objeto para facilitar importação
export const scheduleApi = {
  /**
   * Busca todas as escalas
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('month_schedules')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao carregar escalas:', error);
      throw new Error(`Falha ao carregar escalas: ${error.message}`);
    }
    
    return data || [];
  },

  /**
   * Busca escala por mês e ano
   */
  getByMonth: async (month: number, year: number) => {
    const { data, error } = await supabase
      .from('month_schedules')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar escala:', error);
      throw new Error(`Falha ao buscar escala: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Cria nova escala
   */
  create: async (schedule: SchedulePayload) => {
    const { data, error } = await supabase
      .from('month_schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar escala:', error);
      throw new Error(`Falha ao criar escala: ${error.message}`);
    }
    
    return data;
  },

  /**
   * Atualiza entradas de uma escala
   */
  update: async (
    month: number, 
    year: number, 
    entries: ScheduleEntry[]
  ) => {
    const { error } = await supabase
      .from('month_schedules')
      .update({ 
        entries, 
        updated_at: new Date().toISOString() 
      })
      .eq('month', month)
      .eq('year', year);
    
    if (error) {
      console.error('❌ Erro ao atualizar escala:', error);
      throw new Error(`Falha ao atualizar escala: ${error.message}`);
    }
    
    return true;
  },

  /**
   * Alterna status ativo da escala
   */
  toggleActive: async (month: number, year: number) => {
    // Primeiro busca o status atual
    const { data: current, error: fetchError } = await supabase
      .from('month_schedules')
      .select('is_active')
      .eq('month', month)
      .eq('year', year)
      .single();
    
    if (fetchError) {
      throw new Error(`Falha ao buscar escala: ${fetchError.message}`);
    }
    
    // Inverte o status
    const { error } = await supabase
      .from('month_schedules')
      .update({ is_active: !current?.is_active })
      .eq('month', month)
      .eq('year', year);
    
    if (error) {
      throw new Error(`Falha ao alternar status: ${error.message}`);
    }
    
    return !current?.is_active;
  },

  /**
   * Subscrição em tempo real para mudanças nas escalas
   */
  subscribeToChanges: (
    callback: (payload: any) => void
  ) => {
    const subscription = supabase
      .channel('schedules_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'month_schedules' },
        callback
      )
      .subscribe();
    
    return subscription;
  },
};
