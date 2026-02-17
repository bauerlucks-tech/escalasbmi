# Guia de Migração - Console.log para Logger

## Resumo

O sistema possui 143 console.logs que devem ser migrados para o novo sistema de logging.

## Passos para Migração

### 1. Importar o logger
```typescript
// Antes
// (sem import)

// Depois
import { logger } from '@/lib/logger';
```

### 2. Substituir console.log
```typescript
// Antes
console.log('Mensagem', dados);

// Depois
logger.info('Mensagem', dados);
```

### 3. Níveis de Log

- `logger.debug()` - Apenas em desenvolvimento
- `logger.info()` - Informações gerais (dev/test)
- `logger.warn()` - Alertas (sempre visível)
- `logger.error()` - Erros (sempre visível)

### 4. Arquivos Prioritários

1. `src/contexts/SwapContext.tsx` - 69 console.logs
2. `src/contexts/SupabaseContext.tsx` - 24 console.logs
3. `src/lib/supabase.ts` - 18 console.logs
4. `src/api/schedules.ts` - 12 console.logs

## Benefícios

- ✅ Logs desativados automaticamente em produção
- ✅ Melhor performance
- ✅ Console limpo para usuários
- ✅ Rastreamento estruturado de erros

## Comando para Verificar Progresso

```bash
# Contar console.logs restantes
grep -r "console.log" src --include="*.ts" --include="*.tsx" | wc -l
```
