# Simulação de Escala Equalizada (Março a Dezembro/2026)

Este material cria uma simulação **imediata e isolada** para validar o sistema sem depender de integrações externas adicionais.

## O que foi gerado

Script:

- `scripts/generate-2026-supabase-simulation.cjs`

Artefatos (gerados via script):

- `simulations/2026-mar-dez/month-schedules.json`
- `simulations/2026-mar-dez/vacation-requests.json`
- `simulations/2026-mar-dez/allocation-stats.json`
- `simulations/2026-mar-dez/seed-supabase.sql`

## Regras da simulação

- Período: **março a dezembro de 2026**.
- Operadores considerados: `CARLOS`, `GUILHERME`, `HENRIQUE`, `KELLY`, `LUCAS`, `MATHEUS`, `ROSANA`.
- Dois postos por dia: `meioPeriodo` e `fechamento`.
- Equalização por heurística (balanceamento de:
  - total de turnos,
  - turnos de meio período,
  - turnos de fechamento,
  - finais de semana).
- Férias simuladas por operador:
  - **30 dias aprovados** no ano,
  - modelados como 15 dias “parcial” + 15 dias “completo” na justificativa,
  - sem sobreposição massiva para manter cobertura operacional.

## Como executar

```bash
npm run simulate:2026
```

## Como validar a regra de férias (obrigatório)

```bash
npm run test:simulation
```

Esta validação garante que nenhum operador apareça escalado em dias dentro do seu próprio período de férias e também valida a consistência de `total_days` com o intervalo informado.

## Uso seguro com Supabase (sem afetar produção)

> O script **não conecta automaticamente** no Supabase. Ele apenas gera arquivos locais.

Para aplicar em ambiente isolado:

1. Crie um projeto clone/staging no Supabase.
2. Abra o SQL Editor desse clone.
3. Execute o conteúdo de `simulations/2026-mar-dez/seed-supabase.sql`.
4. Valide no frontend apontando para as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do ambiente clone.

## Observações

- O SQL limpa apenas o recorte `month_schedules`/`vacation_requests` de 2026 (meses 3-12) com motivo de simulação.
- A escala ativa é marcada em dezembro/2026 na simulação.
