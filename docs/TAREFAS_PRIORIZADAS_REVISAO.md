# Tarefas sugeridas após revisão rápida da base

## 1) Correção de erro de digitação (nome de arquivo/documento)

**Problema observado**
- O documento de resumo referencia `INSTRUÇOES_CSV.md` (grafia sem acento em “ÇÕES”).
- Há risco de inconsistência de nomenclatura e dificuldade de busca para quem procurar por “INSTRUÇÕES”.

**Tarefa sugerida**
- Renomear `INSTRUÇOES_CSV.md` para `INSTRUCOES_CSV.md` (ou `INSTRUÇÕES_CSV.md`, se o time aceitar Unicode no nome de arquivo) e atualizar todas as referências.

**Critério de aceite**
- Nenhuma referência remanescente para o nome antigo.
- Links e documentação funcionando após o rename.

---

## 2) Correção de bug (script de teste quebra ao imprimir separadores)

**Problema observado**
- O script `scripts/test-routine.js` usa `'=' * 60`, operação inválida em JavaScript para repetição de string.
- Isso gera `NaN` no output e compromete a legibilidade/diagnóstico do relatório.

**Tarefa sugerida**
- Substituir `'=' * 60` por `'='.repeat(60)` em todos os pontos do script.
- Revisar se há outros padrões semelhantes de multiplicação de string.

**Critério de aceite**
- Relatório de testes exibe separadores corretamente.
- Execução de `npm run test` mantém saída legível sem `NaN` nesses trechos.

---

## 3) Ajuste de documentação/comentário (discrepância com comportamento real)

**Problema observado**
- O guia de testes afirma “⚠️ ESLint: Warnings permitidos (não críticos)”.
- Porém a rotina executa `npm run lint -- --max-warnings=0`, o que falha com qualquer warning.

**Tarefa sugerida**
- Alinhar documentação e implementação:
  - ou atualizar o guia para deixar claro que warnings **não** são permitidos;
  - ou ajustar o comando de lint para o comportamento descrito na documentação.

**Critério de aceite**
- Documentação e script de teste descrevem exatamente a mesma regra de lint.
- Time concorda com a política (warnings bloqueiam ou não bloqueiam).

---

## 4) Melhoria de teste (cobertura de parser CSV para casos de data)

**Problema observado**
- O parser normaliza data, mas calcula `dayOfWeek` com a string original (`calculateDayOfWeek(date)`), o que pode divergir em entradas com formatos diferentes.
- Não há suíte de testes unitários dedicada para garantir o comportamento esperado de `parse/normalizeDate/calculateDayOfWeek` nos formatos suportados.

**Tarefa sugerida**
- Criar testes unitários para `src/utils/csv/parser.ts` cobrindo:
  - datas `DD/MM/YYYY`, `D/M/YY`, `DD-MM-YYYY`;
  - entradas inválidas;
  - validação de consistência entre `date` normalizada e `dayOfWeek`.
- (Opcional) Ajustar a implementação para calcular dia da semana com a data normalizada.

**Critério de aceite**
- Casos críticos cobertos por testes automatizados.
- Parser evita regressão em importação de escala por CSV.
