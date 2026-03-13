// GERAR ESCALAS ALEATÓRIAS PARA SISTEMA DE ESCALAS BMI
// Cria escalas para janeiro a dezembro de 2026
// Distribuição aleatória mas equilibrada entre operadores

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configurações do Supabase (do .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DXLlBPFdEQLWnEbLSe7BbQ_eeNYV08y';

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de operadores (baseado nos dados de teste criados)
const operators = [
  'Carlos Silva',
  'Ana Costa',
  'Roberto Lima',
  'Maria Santos',
  'João Oliveira',
  'Patrícia Souza',
  'Eduardo Ferreira'
];

// Dias por mês em 2026 (não bissexto)
const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Função para obter dia da semana
function getDayOfWeek(year, month, day) {
  const date = new Date(year, month - 1, day);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Função para gerar operador aleatório
function getRandomOperator() {
  return operators[Math.floor(Math.random() * operators.length)];
}

// Função principal
async function createRandomSchedules() {
  console.log('🎲 Iniciando criação de escalas aleatórias para 2026...');

  try {
    // Primeiro, deletar todas as escalas existentes de 2026
    console.log('🗑️ Removendo escalas existentes de 2026...');
    const { error: deleteError } = await supabase
      .from('month_schedules')
      .delete()
      .eq('year', 2026);

    if (deleteError) {
      console.error('❌ Erro ao deletar escalas existentes:', deleteError);
      return;
    }

    console.log('✅ Escalas existentes removidas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover escalas existentes:', error);
    return;
  }

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = monthDays[month - 1];
    const entries = [];

    console.log(`📅 Gerando escala para ${monthNames[month - 1]} 2026 (${daysInMonth} dias)...`);

    // Gerar entradas para cada dia
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/2026`;
      const dayOfWeek = getDayOfWeek(2024, month, day);

      entries.push({
        date: dateStr,
        dayOfWeek: dayOfWeek,
        meioPeriodo: getRandomOperator(),
        fechamento: getRandomOperator()
      });
    }

    // Verificar se a escala já existe
    const { data: existingSchedule, error: checkError } = await supabase
      .from('month_schedules')
      .select('id')
      .eq('month', month)
      .eq('year', 2024)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`❌ Erro ao verificar escala existente para ${monthNames[month - 1]}:`, checkError);
      continue;
    }

    try {
      if (existingSchedule) {
        // Atualizar escala existente
        const { error: updateError } = await supabase
          .from('month_schedules')
          .update({
            entries: entries,
            imported_by: null,
            imported_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSchedule.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar escala para ${monthNames[month - 1]}:`, updateError);
        } else {
          console.log(`✅ Escala atualizada para ${monthNames[month - 1]} 2026`);
        }
      } else {
        // Criar nova escala
        const { error: insertError } = await supabase
          .from('month_schedules')
          .insert({
            month: month,
            year: 2026,
            entries: entries,
            imported_by: null,
            imported_at: new Date().toISOString(),
            is_active: month === 10, // Outubro 2026 como ativo
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`❌ Erro ao criar escala para ${monthNames[month - 1]}:`, insertError);
        } else {
          console.log(`✅ Escala criada para ${monthNames[month - 1]} 2026`);
        }
      }
    } catch (error) {
      console.error(`❌ Erro geral ao processar ${monthNames[month - 1]}:`, error);
    }

    // Pequena pausa para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎉 Todas as escalas de 2026 foram processadas!');
}

// Executar
createRandomSchedules().catch(console.error);
