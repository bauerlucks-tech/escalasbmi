#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const report = {
  generatedAt: new Date().toISOString(),
  success: true,
  checks: [],
  warnings: [],
  errors: [],
};

function addCheck(name, success, details = '') {
  report.checks.push({ name, success, details });
  if (!success) report.success = false;
}

function parseBrDate(br) {
  const [d, m, y] = br.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function fmtBrDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function eachDay(start, end) {
  const out = [];
  const current = new Date(start);
  while (current <= end) {
    out.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return out;
}

async function checkTable(client, table) {
  const { error } = await client.from(table).select('*').limit(1);
  if (error) {
    addCheck(`Tabela ${table} acessível`, false, error.message);
    report.errors.push(`${table}: ${error.message}`);
    return false;
  }
  addCheck(`Tabela ${table} acessível`, true);
  return true;
}

async function main() {
  if (!url || !key) {
    report.success = false;
    report.errors.push('VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas.');
    finalize(1);
    return;
  }

  const client = createClient(url, key);

  const requiredTables = ['users', 'month_schedules', 'vacation_requests', 'swap_requests'];
  const access = {};
  for (const t of requiredTables) {
    access[t] = await checkTable(client, t);
  }

  if (access.month_schedules && access.vacation_requests) {
    const { data: schedules, error: scheduleError } = await client
      .from('month_schedules')
      .select('month, year, entries, is_active');

    const { data: vacations, error: vacationError } = await client
      .from('vacation_requests')
      .select('operator_name, start_date, end_date, total_days, status');

    if (scheduleError) {
      addCheck('Leitura de month_schedules', false, scheduleError.message);
    } else {
      addCheck('Leitura de month_schedules', true, `${schedules?.length || 0} registros`);
    }

    if (vacationError) {
      addCheck('Leitura de vacation_requests', false, vacationError.message);
    } else {
      addCheck('Leitura de vacation_requests', true, `${vacations?.length || 0} registros`);
    }

    if (!scheduleError && !vacationError) {
      const byDate = new Map();
      (schedules || []).forEach((s) => {
        (s.entries || []).forEach((e) => byDate.set(e.date, e));
      });

      let violations = 0;
      (vacations || [])
        .filter((v) => v.status === 'approved')
        .forEach((v) => {
          const start = new Date(v.start_date);
          const end = new Date(v.end_date);
          const days = eachDay(start, end);

          if (days.length !== v.total_days) {
            report.warnings.push(
              `[${v.operator_name}] total_days=${v.total_days} divergente do intervalo=${days.length}`
            );
          }

          days.forEach((d) => {
            const br = fmtBrDate(d);
            const entry = byDate.get(br);
            if (!entry) return;
            if (entry.meioPeriodo === v.operator_name || entry.fechamento === v.operator_name) {
              violations += 1;
              report.errors.push(
                `[FÉRIAS] ${v.operator_name} escalado em ${br} durante férias (${v.start_date} a ${v.end_date})`
              );
            }
          });
        });

      addCheck('Regra: operador aprovado em férias não pode estar escalado', violations === 0, `${violations} violações`);
    }
  }

  if (access.swap_requests) {
    const { data: swaps, error } = await client
      .from('swap_requests')
      .select('id, status, admin_approved, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      addCheck('Leitura de swap_requests', false, error.message);
    } else {
      addCheck('Leitura de swap_requests', true, `${swaps?.length || 0} registros`);
      const allowed = new Set(['pending', 'accepted', 'rejected', 'approved']);
      const invalid = (swaps || []).filter((s) => !allowed.has(s.status));
      addCheck('Status de swap_requests válidos', invalid.length === 0, `${invalid.length} inválidos`);

      const approvedWithoutAdmin = (swaps || []).filter(
        (s) => s.status === 'approved' && s.admin_approved === false
      );

      if (approvedWithoutAdmin.length > 0) {
        report.warnings.push(
          `${approvedWithoutAdmin.length} swaps com status=approved e admin_approved=false`
        );
      }
    }
  }

  finalize(report.success ? 0 : 1);
}

function finalize(exitCode) {
  const dir = join(process.cwd(), 'test-results');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const file = join(dir, `flow-validation-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n📄 Relatório salvo em: ${file}`);
  report.checks.forEach((c) => {
    console.log(`${c.success ? '✅' : '❌'} ${c.name}${c.details ? ` (${c.details})` : ''}`);
  });
  report.warnings.forEach((w) => console.log(`⚠️ ${w}`));
  report.errors.forEach((e) => console.log(`❌ ${e}`));

  process.exit(exitCode);
}

main().catch((err) => {
  report.success = false;
  report.errors.push(err instanceof Error ? err.message : String(err));
  finalize(1);
});
