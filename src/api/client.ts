/**
 * Cliente Supabase configurado
 * Ponto único de configuração do cliente Supabase
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Exporta tipos úteis
export type SupabaseClient = typeof supabase;
