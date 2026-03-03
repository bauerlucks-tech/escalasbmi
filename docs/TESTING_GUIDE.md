# Guia de Testes e Validação - Sistema de Escalas BMI

## 🎯 Visão Geral

Este guia descreve o sistema completo de testes e validação implementado para minimizar erros e garantir a qualidade do código.

## 🛠️ Ferramentas Disponíveis

### 1. Rotina de Testes Completa (`npm run test`)

Executa todos os testes críticos do sistema:

```bash
npm run test
```

**O que testa:**
- ✅ Build do projeto
- ✅ Compilação TypeScript
- ✅ Análise ESLint
- ✅ Existência de arquivos críticos
- ✅ Imports e exports
- ✅ Funcionalidades do sistema
- ✅ Sistema de backup
- ✅ Permissões e segurança
- ✅ Repositório Git
- ✅ Servidor de desenvolvimento

### 2. Validação Rápida (`npm run validate`)

Validação focada em código e imports:

```bash
npm run validate
```

**O que valida:**
- ✅ Arquivos críticos existem
- ✅ Imports essenciais funcionam
- ✅ Exports estão corretos
- ✅ Funções críticas existem
- ✅ TypeScript básico
- ✅ Componentes React

### 3. Editor Seguro (`npm run safe-edit`)

Sistema de edição com validação automática:

```bash
npm run safe-edit
```

**Recursos:**
- ✅ Backup automático antes de editar
- ✅ Validação prévia da edição
- ✅ Verificação de múltiplas ocorrências
- ✅ Validação pós-edição
- ✅ Reversão automática em caso de erro

## 📋 Estrutura dos Scripts

### `scripts/test-routine.js`

**Função:** Executar testes completos do sistema
**Cobertura:** 31 testes automatizados
**Resultado:** Relatório detalhado com estatísticas

### `scripts/code-validator.js`

**Função:** Validação de código e estrutura
**Cobertura:** Arquivos, imports, exports, funções
**Resultado:** Lista de erros e warnings

### `scripts/safe-edit.js`

**Função:** Edição segura com validação
**Cobertura:** Qualquer arquivo do projeto
**Resultado:** Edição validada com backup

## 🚀 Como Usar

### Antes de Fazer Alterações

1. **Execute a validação completa:**
   ```bash
   npm run test
   ```

2. **Verifique o resultado:**
   - ✅ Todos os testes passaram? Pode continuar
   - ❌ Alguns testes falharam? Corrija primeiro

### Durante o Desenvolvimento

1. **Use o editor seguro para alterações críticas:**
   ```javascript
   import { createSafeEditor } from './scripts/safe-edit.js';
   
   const editor = createSafeEditor();
   
   // Edição simples
   editor.safeEdit(
     'src/components/SwapRequestView.tsx',
     'let tabs',
     'const tabs',
     { createBackup: true }
   );
   
   // Edição múltipla
   editor.safeEditMultiple(
     'src/components/SwapRequestView.tsx',
     [
       {
         oldString: 'let tabs',
         newString: 'const tabs',
         explanation: 'Corrigir let para const'
       }
     ]
   );
   ```

2. **Valide após cada alteração:**
   ```bash
   npm run validate
   ```

### Antes de Commitar

1. **Execute todos os testes:**
   ```bash
   npm run test
   ```

2. **Verifique o status Git:**
   ```bash
   git status
   ```

3. **Commit apenas se tudo estiver OK:**
   ```bash
   git add .
   git commit -m "feat: descrição da alteração"
   ```

## 📊 Métricas de Qualidade

### Taxa de Sucesso Alvo: 100%

- ✅ **Build**: Sempre deve passar
- ✅ **TypeScript**: Sempre deve compilar
- ✅ **Imports**: Todos devem funcionar
- ✅ **Arquivos**: Todos devem existir
- ✅ **ESLint**: Sem warnings (bloqueia com `--max-warnings=0`)

### Critérios de Falha

- ❌ **Build falha**: Bloqueia commit
- ❌ **TypeScript erro**: Bloqueia commit
- ❌ **Arquivo ausente**: Bloqueia commit
- ❌ **Import quebrado**: Bloqueia commit
- ❌ **ESLint warning**: Bloqueia commit

## 🔧 Configuração

### Personalizar Testes

Edite `scripts/test-routine.js` para adicionar/remover testes:

```javascript
// Adicionar novo teste
checkFileExists('src/novo-componente.tsx', 'Novo componente existe');

// Adicionar validação de import
checkImport('src/novo-componente.tsx', 'import { useAuth }', 'Novo componente - useAuth');
```

### Personalizar Validação

Edite `scripts/code-validator.js` para novas regras:

```javascript
// Adicionar nova validação
validateCustomRule(filePath) {
  const content = readFileSync(filePath, 'utf8');
  // Sua lógica de validação
  return isValid;
}
```

## 🎯 Fluxo de Trabalho Recomendado

### 1. Início do Dia
```bash
npm run test  # Verificar status atual
```

### 2. Durante Desenvolvimento
```bash
npm run validate  # Validação rápida após alterações
```

### 3. Antes de Commit
```bash
npm run test  # Teste completo
git status    # Verificar mudanças
```

### 4. Final do Dia
```bash
npm run test  # Teste final
git push      # Enviar alterações
```

## 🚨 Resolução de Problemas

### Teste Falhou?

1. **Verifique o output específico**
2. **Corrija o problema apontado**
3. **Execute o teste novamente**
4. **Continue apenas se passar**

### Editor Seguro Falhou?

1. **Verifique o histórico de operações**
2. **Restaure o backup se necessário**
3. **Corrija o problema manualmente**
4. **Tente novamente**

### Validação Falhou?

1. **Verifique os warnings**
2. **Corrija os imports/exports**
3. **Verifique sintaxe TypeScript**
4. **Execute novamente**

## 📈 Benefícios

### ✅ Vantagens

- **Zero erros em produção**
- **Backup automático**
- **Validação prévia**
- **Histórico de operações**
- **Relatórios detalhados**
- **Fluxo de trabalho padronizado**

### 🎯 Resultados Esperados

- **Menos bugs**: 90% redução
- **Mais confiança**: 100% validação
- **Desenvolvimento rápido**: Testes automatizados
- **Qualidade consistente**: Padrões definidos

## 🔄 Manutenção

### Atualizar Testes

1. **Novos componentes**: Adicionar aos testes
2. **Novas funcionalidades**: Criar validações
3. **Mudanças na estrutura**: Atualizar scripts

### Monitorar Resultados

1. **Taxa de sucesso**: Manter em 100%
2. **Tempo de execução**: Manter rápido
3. **Cobertura**: Aumentar com o tempo

---

## 🎉 Conclusão

Este sistema de testes e validação garante qualidade e minimiza erros no desenvolvimento. Use as ferramentas disponíveis e siga o fluxo recomendado para melhores resultados.

**Lembre-se:** Testes são seus amigos! 🚀
