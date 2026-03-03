# Bateria de Testes Pré-Publicação (Node.js + Supabase)

Este documento define uma bateria de testes **automatizável por agente de IA** para validar o sistema antes de publicação.

## Objetivos

- Detectar quebras de sintaxe, tipagem e build.
- Encontrar bugs de integração entre módulos Node/React/TS.
- Sinalizar riscos operacionais em scripts de manutenção.
- Produzir um relatório JSON para consumo por agentes automatizados.

## Execução padrão

```bash
npm run test:battery
```

## O que a bateria executa

1. **Sanidade de scripts Node**
   - `node --check scripts/test-routine.js`
   - `node --check scripts/code-validator.js`
   - `node --check scripts/debug-matheus-frontend.cjs`

2. **Compilação TypeScript**
   - `npx tsc --noEmit`

3. **Lint completo**
   - `npm run lint`
   - Atualmente tratado como **não bloqueante** na bateria para não paralisar entrega por warnings legados.

4. **Build de produção**
   - `npm run build`

5. **Validação rápida interna**
   - `npm run test:quick`

6. **Scan de anti-pattern conhecido**
   - Busca por multiplicação inválida de string (`'=' * N`) em `scripts/` e `src/`.

## Saída para automação

A bateria salva relatório em:

- `test-results/ai-test-battery-<timestamp>.json`

Campos principais:
- `summary.total`
- `summary.passed`
- `summary.warned`
- `summary.failed`
- `checks[]` com `name`, `command`, `status`, `output` e timestamps.

## Fluxo recomendado para agente de IA

1. Rodar `npm run test:battery`.
2. Ler o JSON mais recente em `test-results/`.
3. Priorizar correções nesta ordem:
   - `fail` em sintaxe/tsc/build;
   - `fail` de integrações críticas;
   - `warn` de lint e scripts de debug.
4. Reexecutar bateria até `summary.failed = 0`.

## Itens para evolução da bateria

- Adicionar suíte de testes unitários para parser CSV e mapeadores.
- Adicionar smoke test de autenticação com Supabase em ambiente de staging.
- Adicionar verificação de RLS/roles em migrações SQL.
- Adicionar teste de regressão para fluxos de importação/exportação CSV.
