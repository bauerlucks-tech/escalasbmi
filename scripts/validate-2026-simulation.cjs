#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'simulations', '2026-mar-dez');
const SCHEDULES_FILE = path.join(BASE_DIR, 'month-schedules.json');
const VACATIONS_FILE = path.join(BASE_DIR, 'vacation-requests.json');

function parseISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateBR(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function eachDay(start, end) {
  const list = [];
  const current = new Date(start);

  while (current <= end) {
    list.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return list;
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function main() {
  if (!fs.existsSync(SCHEDULES_FILE) || !fs.existsSync(VACATIONS_FILE)) {
    fail(
      'Arquivos de simulação não encontrados. Rode: npm run simulate:2026'
    );
  }

  const schedules = JSON.parse(fs.readFileSync(SCHEDULES_FILE, 'utf8'));
  const vacations = JSON.parse(fs.readFileSync(VACATIONS_FILE, 'utf8'));

  const entryByDate = new Map();
  schedules.forEach((monthSchedule) => {
    (monthSchedule.entries || []).forEach((entry) => {
      entryByDate.set(entry.date, entry);
    });
  });

  const violations = [];

  vacations.forEach((vacation) => {
    const start = parseISODate(vacation.start_date);
    const end = parseISODate(vacation.end_date);
    const days = eachDay(start, end);

    if (days.length !== vacation.total_days) {
      violations.push(
        `[${vacation.operator_name}] total_days (${vacation.total_days}) divergente do intervalo (${days.length})`
      );
    }

    days.forEach((day) => {
      const brDate = formatDateBR(day);
      const entry = entryByDate.get(brDate);
      if (!entry) return;

      if (
        entry.meioPeriodo === vacation.operator_name ||
        entry.fechamento === vacation.operator_name
      ) {
        violations.push(
          `[${vacation.operator_name}] escalado em ${brDate} durante férias (${vacation.start_date} a ${vacation.end_date})`
        );
      }
    });
  });

  if (violations.length > 0) {
    console.error('❌ Validação da simulação falhou.');
    violations.forEach((item, index) => {
      console.error(`   ${index + 1}. ${item}`);
    });
    process.exit(1);
  }

  console.log('✅ Simulação validada com sucesso.');
  console.log('✅ Nenhum operador ficou escalado dentro do próprio período de férias.');
  console.log('✅ total_days das férias está consistente com cada intervalo.');
}

main();
