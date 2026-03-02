# Plano de Correção do Sistema Super Admin

## Diagnóstico Atual

### Problemas Encontrados:
1. **3 usuários ADMIN duplicados** no banco de dados:
   - `fd2513b2-3260-4ad2-97b1-6f5fbb88c192`
   - `527073fd-ea8b-4947-9fc4-f510160b3b0e`
   - `5e7edfeb-5b89-419d-8e9f-7bb005c2ffe7`

2. **Sistema de Super Admin atual**:
   - Usa usuário virtual "SUPER_ADMIN_HIDDEN" (não está no banco)
   - Acesso via ícone de chave no Header
   - Senha: `hidden_super_2026`
   - Apenas LUCAS pode ativar (via variável `VITE_SUPER_ADMIN_ALLOWED_USERS`)

## Solução Proposta

### 1. Correção dos ADMINs duplicados
- Manter apenas 1 ADMIN ativo
- Arquivar os outros 2 registros duplicados
- Manter o sistema de Super Admin via ícone de chave

### 2. Fluxo do Super Admin (Manter como está)
```
Usuário clica no ícone de chave
    ↓
Sistema pede senha: hidden_super_2026
    ↓
Senha correta → Ativa modo Super Admin
    ↓
Cria usuário virtual SUPER_ADMIN_HIDDEN
```

### 3. Variáveis de Controle
- `VITE_SUPER_ADMIN_ALLOWED_USERS=LUCAS` - Define quem pode ativar
- `directAuth_superAdminMode` - Flag no localStorage

## Próximos Passos

1. Executar script de correção dos ADMINs duplicados
2. Validar que apenas 1 ADMIN permanece ativo
3. Testar o acesso ao Super Admin via ícone de chave

## Observação sobre Escalas

A migração de escalas (março a dezembro) será tratada separadamente, pois:
- A tabela `month_schedules` está vazia
- Há uma inconsistência entre `schedules` e `month_schedules` no código
