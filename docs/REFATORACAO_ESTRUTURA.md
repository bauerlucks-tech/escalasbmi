# Refatoração da Estrutura do Projeto

## 🎯 Objetivo
Tornar o código mais organizado, intuitivo e fácil de manter, seguindo as melhores práticas de arquitetura React.

---

## 📁 Nova Estrutura de Pastas

```
src/
├── 📁 api/                    # Camada de API (Supabase)
│   ├── client.ts              # Cliente Supabase configurado
│   ├── users.ts               # API de usuários
│   ├── schedules.ts           # API de escalas
│   ├── swaps.ts               # API de trocas
│   ├── vacations.ts           # API de férias
│   └── audit.ts               # API de auditoria
│
├── 📁 assets/                 # Recursos estáticos
│   ├── images/
│   └── icons/
│
├── 📁 components/             # Componentes React
│   ├── 📁 ui/                 # Componentes de UI base (shadcn)
│   ├── 📁 common/             # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── 📁 schedule/           # Componentes de escala
│   │   ├── ScheduleCalendar.tsx
│   │   ├── ScheduleStats.tsx
│   │   └── ScheduleImport.tsx
│   ├── 📁 swap/               # Componentes de troca
│   │   ├── SwapRequestForm.tsx
│   │   ├── SwapList.tsx
│   │   └── SwapApproval.tsx
│   ├── 📁 vacation/           # Componentes de férias
│   │   ├── VacationRequestForm.tsx
│   │   └── VacationList.tsx
│   ├── 📁 admin/              # Componentes administrativos
│   │   ├── UserManager.tsx
│   │   ├── AuditLogs.tsx
│   │   └── BackupManager.tsx
│   └── 📁 layout/             # Layouts
│       ├── MainLayout.tsx
│       └── AuthLayout.tsx
│
├── 📁 config/                 # Configurações
│   ├── routes.ts              # Definição de rotas
│   ├── constants.ts           # Constantes globais
│   └── features.ts            # Feature flags
│
├── 📁 contexts/               # Contextos React (simplificados)
│   ├── AuthContext.tsx        # Autenticação
│   ├── ThemeContext.tsx       # Tema
│   └── NotificationContext.tsx # Notificações
│
├── 📁 hooks/                  # Hooks customizados
│   ├── 📁 api/                # Hooks de API
│   │   ├── useUsers.ts
│   │   ├── useSchedules.ts
│   │   ├── useSwaps.ts
│   │   └── useVacations.ts
│   ├── 📁 domain/             # Hooks de domínio
│   │   ├── useAuth.ts
│   │   ├── useScheduleStats.ts
│   │   └── useOperatorStats.ts
│   └── 📁 utils/              # Hooks utilitários
│       ├── useLocalStorage.ts
│       ├── useDebounce.ts
│       └── useMediaQuery.ts
│
├── 📁 lib/                    # Bibliotecas e utilitários
│   ├── utils.ts               # Funções utilitárias
│   ├── date.ts                # Utilitários de data
│   └── validation.ts          # Validações
│
├── 📁 providers/              # Providers da aplicação
│   └── AppProviders.tsx       # Combina todos os providers
│
├── 📁 services/               # Serviços de negócio
│   ├── auth.service.ts        # Lógica de autenticação
│   ├── schedule.service.ts    # Lógica de escalas
│   ├── swap.service.ts        # Lógica de trocas
│   ├── vacation.service.ts    # Lógica de férias
│   └── security.service.ts    # Hash, criptografia
│
├── 📁 stores/                 # Estado global (opcional - Zustand/Redux)
│   ├── authStore.ts
│   ├── scheduleStore.ts
│   └── uiStore.ts
│
├── 📁 styles/                 # Estilos globais
│   ├── globals.css
│   ├── variables.css
│   └── animations.css
│
├── 📁 types/                  # Tipos TypeScript
│   ├── index.ts               # Exporta todos
│   ├── user.ts
│   ├── schedule.ts
│   ├── swap.ts
│   ├── vacation.ts
│   └── audit.ts
│
├── 📁 utils/                  # Funções utilitárias
│   ├── csv/
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   └── exporter.ts
│   ├── storage/
│   │   ├── secureStorage.ts
│   │   └── localStorage.ts
│   ├── mappers/
│   │   ├── dataMapper.ts
│   │   └── dateMapper.ts
│   └── formatters/
│       ├── dateFormatter.ts
│       └── numberFormatter.ts
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 🏗️ Princípios da Nova Arquitetura

### 1. **Separação de Responsabilidades**

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Components  │  │   Hooks     │  │   Contexts          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Services   │  │   Stores    │  │   Validators        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    API      │  │   Storage   │  │   Mappers           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2. **Fluxo de Dados Unidirecional**

```typescript
// 1. Componente chama Hook
const { data, isLoading } = useSchedules();

// 2. Hook usa Service
const schedules = await scheduleService.getAll();

// 3. Service usa API + Mapper
const response = await api.schedules.getAll();
return dataMapper.toSchedule(response);

// 4. API faz a requisição
const { data } = await supabase.from('schedules').select('*');
```

### 3. **Nomenclatura Padronizada**

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `ScheduleCard.tsx` |
| Hooks | camelCase com prefixo 'use' | `useSchedules.ts` |
| Serviços | camelCase com sufixo 'Service' | `authService.ts` |
| Utilitários | camelCase | `formatDate.ts` |
| Tipos | PascalCase com sufixo | `UserRole`, `ScheduleEntry` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |

---

## 🚀 Exemplo de Implementação

### Antes (Código Atual)
```typescript
// AuthContext.tsx - Muitas responsabilidades
const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('escala_users');
    // ... lógica complexa de inicialização
  });
  
  const login = (name: string, password: string) => {
    // ... lógica de login com hash
  };
  
  const createUser = (name, password, role) => {
    // ... lógica de criação
  };
  // ... muitas outras funções
};
```

### Depois (Novo Padrão)
```typescript
// contexts/AuthContext.tsx - Apenas estado
const AuthProvider = ({ children }) => {
  const { user, login, logout } = useAuth();
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// hooks/useAuth.ts - Lógica de autenticação
export const useAuth = () => {
  const { mutate: login } = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      secureStorage.set('user', data, StorageType.SESSION);
    }
  });
  
  return { login };
};

// services/auth.service.ts - Regras de negócio
export const authService = {
  login: async (credentials: Credentials) => {
    const hashedPassword = await securityService.hash(credentials.password);
    return api.auth.login({ ...credentials, password: hashedPassword });
  }
};

// api/users.ts - Chamadas à API
export const usersApi = {
  login: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }
};
```

---

## 📋 Checklist de Refatoração

### Fase 1: Fundação
- [ ] Criar nova estrutura de pastas
- [ ] Mover tipos para `src/types/`
- [ ] Criar serviços base
- [ ] Configurar hooks de API

### Fase 2: Migração Gradual
- [ ] Migrar AuthContext → useAuth hook
- [ ] Migrar SwapContext → useSwaps hook
- [ ] Migrar VacationContext → useVacations hook
- [ ] Extrair lógica de componentes para hooks

### Fase 3: Componentização
- [ ] Quebrar componentes grandes em menores
- [ ] Criar biblioteca de componentes comuns
- [ ] Implementar storybook (opcional)

### Fase 4: Otimização
- [ ] Implementar React Query para cache
- [ ] Configurar code splitting
- [ ] Adicionar lazy loading

---

## 🎨 Padrões de Código

### Componente Padrão
```typescript
// components/schedule/ScheduleCard.tsx
import { FC } from 'react';
import { Schedule } from '@/types/schedule';
import { useScheduleActions } from '@/hooks/domain/useScheduleActions';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ScheduleCardProps {
  schedule: Schedule;
  onEdit?: (id: string) => void;
}

export const ScheduleCard: FC<ScheduleCardProps> = ({ schedule, onEdit }) => {
  const { toggleActive, isLoading } = useScheduleActions();
  
  return (
    <Card>
      <CardHeader title={schedule.month} />
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  );
};
```

### Hook Padrão
```typescript
// hooks/api/useSchedules.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/api/schedules';
import { Schedule } from '@/types/schedule';

const QUERY_KEYS = {
  all: ['schedules'] as const,
  byId: (id: string) => ['schedules', id] as const,
  byMonth: (month: number, year: number) => ['schedules', month, year] as const,
};

export const useSchedules = () => {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: scheduleApi.getAll,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};
```

### Serviço Padrão
```typescript
// services/schedule.service.ts
import { scheduleApi } from '@/api/schedules';
import { dataMapper } from '@/utils/mappers/dataMapper';
import { Schedule } from '@/types/schedule';

export const scheduleService = {
  getCurrentMonth: async (): Promise<Schedule> => {
    const now = new Date();
    const response = await scheduleApi.getByMonth(now.getMonth() + 1, now.getFullYear());
    return dataMapper.toSchedule(response);
  },
  
  validateImport: async (file: File): Promise<ValidationResult> => {
    // ... lógica de validação
  },
  
  importFromCSV: async (file: File, month: number, year: number): Promise<Schedule> => {
    // ... lógica de importação
  },
};
```

---

## 🔧 Benefícios da Nova Estrutura

1. **Manutenibilidade**: Cada arquivo tem uma responsabilidade clara
2. **Testabilidade**: Fácil de testar unidades isoladas
3. **Escalabilidade**: Nova funcionalidade segue padrão estabelecido
4. **Colaboração**: Múltiplos devs trabalham sem conflitos
5. **Onboarding**: Novos devs entendem rápido a estrutura
6. **Reusabilidade**: Componentes e hooks reutilizáveis

---

## ⚠️ Considerações

- Fazer migração gradual para não quebrar funcionalidades
- Manter compatibilidade durante transição
- Testar cada módulo migrado
- Documentar decisões de arquitetura
