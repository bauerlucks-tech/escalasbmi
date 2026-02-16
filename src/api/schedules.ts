/**
 * API de Escalas - Camada de comunicação com Supabase
 * Responsável apenas por chamadas à API, sem lógica de negócio
 */
import { supabase } from './client';
import { ScheduleEntry } from '@/types';

export interface SchedulePayload {
  month: number;
  year: number;
  entries: ScheduleEntry[];
  imported_by?: string;
  imported_at?: string;
  is_active?: boolean;
}

export interface ScheduleResponse {
  id: string;
  month: number;
  year: number;
  entries: ScheduleEntry[];
  imported_at?: string;
  imported_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const scheduleApi = {
  async getByMonth(month: number, year: number): Promise<ScheduleResponse | null> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .single();

      if (error) {
        console.error('Erro ao buscar escala:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return null;
    }
  },

  async create(payload: SchedulePayload): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('schedules')
        .insert([payload]);

      if (error) {
        console.error('Erro ao criar escala:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return false;
    }
  },

  async update(id: string, payload: Partial<SchedulePayload>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('schedules')
        .update(payload)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar escala:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return false;
    }
  },

  async deleteSchedule(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar escala:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return false;
    }
  },

  async getAll(): Promise<ScheduleResponse[]> {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar escalas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return [];
    }
  },

  async toggleActive(month: number, year: number): Promise<boolean> {
    try {
      // Primeiro, desativar todas as escalas
      await supabase
        .from('schedules')
        .update({ is_active: false })
        .neq('is_active', null);

      // Depois, ativar a escala específica
      const { error } = await supabase
        .from('schedules')
        .update({ is_active: true })
        .eq('month', month)
        .eq('year', year);

      if (error) {
        console.error('Erro ao ativar escala:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro na API de escalas:', error);
      return false;
    }
  }
};
