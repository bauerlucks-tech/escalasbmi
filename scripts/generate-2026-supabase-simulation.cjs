#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const operators = [
  { name: 'CARLOS', id: 'fd38b592-2986-430e-98be-d9d104d90442' },
  { name: 'GUILHERME', id: 'b5a1b456-e837-4f47-ab41-4734a00a0355' },
  { name: 'HENRIQUE', id: '2e7e953f-5b4e-44e9-bc69-d463a92fa99a' },
  { name: 'KELLY', id: '9a91c13a-cf3a-4a08-af02-986163974acc' },
  { name: 'LUCAS', id: '3826fb9b-439b-49e2-bfb5-a85e6d3aba23' },
  { name: 'MATHEUS', id: '07935022-3fdf-4f83-907f-e57ae8831511' },
  { name: 'ROSANA', id: 'd793d805-3468-4bc4-b7bf-a722b570ec98' },
];

const dayNames = [
  'DOMINGO',
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO',
];

// Cada operador recebe 30 dias de férias (15 parcial + 15 completo)
const vacationPlan = [
  { name: 'CARLOS', start: '2026-03-01', splitAt: '2026-03-15', end: '2026-03-30' },
  { name: 'GUILHERME', start: '2026-04-01', splitAt: '2026-04-15', end: '2026-04-30' },
  { name: 'HENRIQUE', start: '2026-05-01', splitAt: '2026-05-15', end: '2026-05-30' },
  { name: 'KELLY', start: '2026-06-01', splitAt: '2026-06-15', end: '2026-06-30' },
  { name: 'LUCAS', start: '2026-07-01', splitAt: '2026-07-15', end: '2026-07-30' },
  { name: 'MATHEUS', start: '2026-08-01', splitAt: '2026-08-15', end: '2026-08-30' },
  { name: 'ROSANA', start: '2026-09-01', splitAt: '2026-09-15', end: '2026-09-30' },
];

function formatDateBR(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function eachDay(start, end) {
  const days = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function isWeekend(dayName) {
  return dayName === 'SÁBADO' || dayName === 'DOMINGO';
}

function buildVacationIndex() {
  const index = new Map();

  for (const plan of vacationPlan) {
    const start = parseISO(plan.start);
    const end = parseISO(plan.end);

    for (const date of eachDay(start, end)) {
      const key = toISO(date);
      if (!index.has(key)) index.set(key, new Set());
      index.get(key).add(plan.name);
    }
  }

  return index;
}

function pickOperator(candidates, stats, shift, dayName) {
  const weekend = isWeekend(dayName);

  return candidates
    .slice()
    .sort((a, b) => {
      const sa = stats[a.name];
      const sb = stats[b.name];

      const scoreA = sa.total * 10 + sa[shift] * 3 + (weekend ? sa.weekends * 2 : 0);
      const scoreB = sb.total * 10 + sb[shift] * 3 + (weekend ? sb.weekends * 2 : 0);

      if (scoreA !== scoreB) return scoreA - scoreB;
      return a.name.localeCompare(b.name);
    })[0];
}

function buildSchedule() {
  const vacationIndex = buildVacationIndex();

  const stats = Object.fromEntries(
    operators.map((op) => [op.name, { total: 0, meioPeriodo: 0, fechamento: 0, weekends: 0 }])
  );

  const byMonth = new Map();

  const start = new Date(2026, 2, 1); // março
  const end = new Date(2026, 11, 31); // dezembro

  for (const date of eachDay(start, end)) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dayName = dayNames[date.getDay()];
    const iso = toISO(date);
    const vacationSet = vacationIndex.get(iso) || new Set();

    const available = operators.filter((op) => !vacationSet.has(op.name));
    if (available.length < 2) {
      throw new Error(`Menos de 2 operadores disponíveis em ${iso}`);
    }

    const meio = pickOperator(available, stats, 'meioPeriodo', dayName);
    const fechamentoCandidates = available.filter((op) => op.name !== meio.name);
    const fechamento = pickOperator(fechamentoCandidates, stats, 'fechamento', dayName);

    const entry = {
      date: formatDateBR(date),
      dayOfWeek: dayName,
      meioPeriodo: meio.name,
      fechamento: fechamento.name,
    };

    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(entry);

    stats[meio.name].total += 1;
    stats[meio.name].meioPeriodo += 1;
    if (isWeekend(dayName)) stats[meio.name].weekends += 1;

    stats[fechamento.name].total += 1;
    stats[fechamento.name].fechamento += 1;
    if (isWeekend(dayName)) stats[fechamento.name].weekends += 1;
  }

  const schedules = [];
  for (let month = 3; month <= 12; month++) {
    schedules.push({
      month,
      year: 2026,
      entries: byMonth.get(month) || [],
      imported_by: 'SIMULADOR_IA',
      imported_at: new Date().toISOString(),
      is_active: month === 12,
    });
  }

  return { schedules, stats };
}

function buildVacationRequests() {
  return vacationPlan.map((plan, index) => {
    const operator = operators.find((op) => op.name === plan.name);
    return {
      id: `SIM-VAC-2026-${String(index + 1).padStart(3, '0')}`,
      operator_id: operator.id,
      operator_name: operator.name,
      start_date: plan.start,
      end_date: plan.end,
      total_days: 30,
      reason: 'Férias simuladas (15 dias parcial + 15 dias completo) para validação anual de escala',
      status: 'approved',
      requested_at: new Date('2026-01-10T09:00:00.000Z').toISOString(),
      approved_by: 'SIMULADOR_IA',
      approved_at: new Date('2026-01-11T10:00:00.000Z').toISOString(),
      month: Number(plan.start.split('-')[1]),
      year: 2026,
    };
  });
}

function esc(str) {
  return str.replace(/'/g, "''");
}

function buildSQL(schedules, vacations) {
  const lines = [];
  lines.push('-- Seed de simulação anual de escala (Mar-Dez 2026)');
  lines.push('-- Execute apenas em projeto Supabase CLONADO (staging/sandbox).');
  lines.push('begin;');
  lines.push('');
  lines.push('-- Limpeza apenas do recorte de simulação');
  lines.push("delete from month_schedules where year = 2026 and month between 3 and 12;");
  lines.push("delete from vacation_requests where year = 2026 and month between 3 and 12 and reason like 'Férias simuladas%';");
  lines.push('');

  for (const schedule of schedules) {
    const entriesJson = JSON.stringify(schedule.entries).replace(/'/g, "''");
    lines.push(
      `insert into month_schedules (month, year, entries, imported_by, imported_at, is_active) values (${schedule.month}, ${schedule.year}, '${entriesJson}'::jsonb, '${esc(schedule.imported_by)}', '${schedule.imported_at}', ${schedule.is_active ? 'true' : 'false'});`
    );
  }

  lines.push('');
  for (const v of vacations) {
    lines.push(
      `insert into vacation_requests (id, operator_id, operator_name, start_date, end_date, total_days, reason, status, requested_at, approved_by, approved_at, month, year) values ('${esc(v.id)}', '${esc(v.operator_id)}', '${esc(v.operator_name)}', '${esc(v.start_date)}', '${esc(v.end_date)}', ${v.total_days}, '${esc(v.reason)}', '${esc(v.status)}', '${esc(v.requested_at)}', '${esc(v.approved_by)}', '${esc(v.approved_at)}', ${v.month}, ${v.year});`
    );
  }

  lines.push('');
  lines.push('commit;');
  return lines.join('\n');
}

function main() {
  const { schedules, stats } = buildSchedule();
  const vacations = buildVacationRequests();
  const sql = buildSQL(schedules, vacations);

  const outDir = path.join(process.cwd(), 'simulations', '2026-mar-dez');
  fs.mkdirSync(outDir, { recursive: true });

  const schedulesPath = path.join(outDir, 'month-schedules.json');
  const vacationsPath = path.join(outDir, 'vacation-requests.json');
  const statsPath = path.join(outDir, 'allocation-stats.json');
  const sqlPath = path.join(outDir, 'seed-supabase.sql');

  fs.writeFileSync(schedulesPath, JSON.stringify(schedules, null, 2), 'utf8');
  fs.writeFileSync(vacationsPath, JSON.stringify(vacations, null, 2), 'utf8');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
  fs.writeFileSync(sqlPath, sql, 'utf8');

  console.log('✅ Simulação gerada com sucesso.');
  console.log(`   - ${path.relative(process.cwd(), schedulesPath)}`);
  console.log(`   - ${path.relative(process.cwd(), vacationsPath)}`);
  console.log(`   - ${path.relative(process.cwd(), statsPath)}`);
  console.log(`   - ${path.relative(process.cwd(), sqlPath)}`);

  const ordered = Object.entries(stats)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log('\n📊 Equalização (turnos totais):');
  ordered.forEach((row) => {
    console.log(
      `   ${row.name.padEnd(10)} total=${String(row.total).padStart(3)} meio=${String(row.meioPeriodo).padStart(3)} fechamento=${String(row.fechamento).padStart(3)} fds=${String(row.weekends).padStart(3)}`
    );
  });
}

main();
