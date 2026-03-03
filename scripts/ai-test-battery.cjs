#!/usr/bin/env node

/**
 * Bateria de testes pré-publicação para execução por agentes de IA.
 * - Gera saída legível no terminal
 * - Salva relatório estruturado em JSON
 */

const { execSync } = require('child_process');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'test-results');
const REPORT_FILE = path.join(REPORT_DIR, `ai-test-battery-${Date.now()}.json`);

const checks = [];

function run(command, name, options = {}) {
  const startedAt = new Date().toISOString();
  try {
    const output = execSync(command, {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10,
      ...options,
    });

    checks.push({
      name,
      command,
      status: 'pass',
      startedAt,
      finishedAt: new Date().toISOString(),
      output: output.trim(),
    });

    console.log(`✅ ${name}`);
    return { ok: true, output };
  } catch (error) {
    const output = [error.stdout, error.stderr, error.message].filter(Boolean).join('\n').trim();

    checks.push({
      name,
      command,
      status: 'fail',
      startedAt,
      finishedAt: new Date().toISOString(),
      output,
    });

    console.log(`❌ ${name}`);
    return { ok: false, output };
  }
}

function runNonBlocking(command, name) {
  const result = run(command, name);
  if (!result.ok) {
    const last = checks[checks.length - 1];
    last.status = 'warn';
    console.log(`⚠️ ${name} (não bloqueante)`);
  }
}

function ensureReportDir() {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }
}

function writeReport() {
  ensureReportDir();

  const summary = {
    total: checks.length,
    passed: checks.filter((c) => c.status === 'pass').length,
    warned: checks.filter((c) => c.status === 'warn').length,
    failed: checks.filter((c) => c.status === 'fail').length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    checks,
  };

  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n📊 Resumo da bateria de testes');
  console.log(`   Total: ${summary.total}`);
  console.log(`   ✅ Passou: ${summary.passed}`);
  console.log(`   ⚠️ Aviso: ${summary.warned}`);
  console.log(`   ❌ Falhou: ${summary.failed}`);
  console.log(`\n📝 Relatório: ${path.relative(ROOT, REPORT_FILE)}`);

  return summary.failed === 0;
}

function main() {
  console.log('🚀 Iniciando bateria de testes para publicação...\n');

  // 1) Sanidade de scripts Node
  run('node --check scripts/test-routine.js', 'Sintaxe: scripts/test-routine.js');
  run('node --check scripts/code-validator.js', 'Sintaxe: scripts/code-validator.js');
  run('node --check scripts/debug-matheus-frontend.cjs', 'Sintaxe: scripts/debug-matheus-frontend.cjs');

  // 2) Qualidade estática
  run('npx tsc --noEmit', 'TypeScript: compilação sem emissão');

  // 3) Lint em modo diagnóstico (não bloqueante para warnings legados)
  runNonBlocking('npm run lint', 'ESLint: análise completa');

  // 4) Build de produção
  run('npm run build', 'Build de produção');

  // 5) Validação interna rápida
  run('npm run test:quick', 'Validação rápida do repositório');

  // 6) Verificação de anti-pattern conhecido em scripts JS
  run(
    "rg -n \"'=' \\* [0-9]+\" scripts src || true",
    'Scan: multiplicação inválida de string (informativo)'
  );

  const ok = writeReport();
  process.exit(ok ? 0 : 1);
}

main();
