import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import { User, UserRole, UserStatus } from '@/data/scheduleData';
import { logLogin, logLogout, logPasswordChange, logUserManagement, logAdminLogin } from '@/data/auditLogs';
import { authStorage, preferenceStorage } from '@/utils/secureStorage';
import { SupabaseAPI } from '@/lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  activeUsers: User[];
  operators: User[];
  loading: boolean;
  login: (name: string, password: string) => boolean;
  logout: () => void;
  resetPassword: (userId: string, newPassword: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  createUser: (name: string, password: string, role: UserRole) => User | null;
  archiveUser: (userId: string) => void;
  isAuthenticated: boolean;
  isAdmin: (user: User | null) => boolean;
  isSuperAdmin: (user: User | null) => boolean;
  updateUserPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (userId: string, profileImage: string) => void;
  switchToSuperAdmin: () => void;
  switchBackToUser: () => void;
  isHiddenSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funções de segurança para senhas
const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Função para migrar senhas antigas para hash
const migratePasswordToHash = (password: string): string => {
  // Se já for hash (64 caracteres hex), retornar como está
  if (password.length === 64 && /^[a-f0-9]{64}$/i.test(password)) {
    return password;
  }
  // Senha em texto plano, converter para hash
  return hashPassword(password);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Verificar se há usuário do login externo PRIMEIRO
    const externalUser = authStorage.getUser();
    if (externalUser) {
      // 🔄 Carregando usuário externo no AuthContext
      return externalUser;
    }
    
    // Verificar usuário salvo normalmente
    const saved = authStorage.getUser();
    if (saved) {
      // 🔄 Carregando usuário salvo no AuthContext
      return saved;
    }
    
    return null;
  });

  // Estado para controlar acesso ao Super Admin escondido
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isHiddenSuperAdmin, setIsHiddenSuperAdmin] = useState(false);

  // Carregar usuários do Supabase na inicialização
  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('🔄 Carregando usuários do Supabase...');
        const supabaseUsers = await SupabaseAPI.getUsers();
        
        // Converter usuários do Supabase para o formato do AuthContext
        const convertedUsers = supabaseUsers.map(user => ({
          id: user.id,
          name: user.name,
          password: (user as any).password || hashPassword(crypto.randomUUID()), // Hash seguro em vez de vazio
          role: user.role,
          status: user.status,
          profileImage: (user as any).profile_image, // Campo do Supabase é profile_image
          hideFromSchedule: (user as any).hide_from_schedule
        }));
        
        console.log(`✅ Carregados ${convertedUsers.length} usuários do Supabase`);
        
        // Fallback to hardcoded users if Supabase returns empty
        if (convertedUsers.length === 0) {
          console.log('⚠️ Nenhum usuário encontrado no Supabase, usando lista padrão');
          const defaultUsers = [
            { id: 'fd38b592-2986-430e-98be-d9d104d90442', name: 'CARLOS', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: 'b5a1b456-e837-4f47-ab41-4734a00a0355', name: 'GUILHERME', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: '2e7e953f-5b4e-44e9-bc69-d463a92fa99a', name: 'HENRIQUE', role: 'administrador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: '9a91c13a-cf3a-4a08-af02-986163974acc', name: 'KELLY', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: '3826fb9b-439b-49e2-bfb5-a85e6d3aba23', name: 'LUCAS', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: '07935022-3fdf-4f83-907f-e57ae8831511', name: 'MATHEUS', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: 'd793d805-3468-4bc4-b7bf-a722b570ec98', name: 'ROSANA', role: 'operador', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' },
            { id: 'super-admin-hidden', name: 'SUPER_ADMIN_HIDDEN', role: 'super_admin', status: 'ativo', password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' }
          ];
          setUsers(defaultUsers);
        } else {
          setUsers(convertedUsers);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuários do Supabase:', error);
        // Fallback para usuários locais se Supabase falhar
        const saved = preferenceStorage.get('escala_users');
        if (saved) {
          const userList = saved.map((u: any) => ({
            ...u,
            role: u.role || (u.isAdmin ? 'administrador' : 'operador'),
            status: u.status || 'ativo',
            password: migratePasswordToHash(u.password)
          }));
          setUsers(userList);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Verificar usuário externo periodicamente
  useEffect(() => {
    const checkExternalUser = () => {
      // Tentar obter usuário do localStorage (sistema externo)
      const externalUserStr = localStorage.getItem('directAuth_currentUser');
      const externalUser = externalUserStr ? JSON.parse(externalUserStr) : null;
      
      // Verificar modo Super Admin escondido
      const superAdminMode = localStorage.getItem('directAuth_superAdminMode') === 'true';
      
      // 🔍 Verificando usuário externo
      
      if (superAdminMode && (!isHiddenSuperAdmin || !currentUser || currentUser.name !== 'SUPER_ADMIN_HIDDEN')) {
        // 🔄 Detectado modo Super Admin, ativando
        const superAdminUser = {
          id: 'super-admin',
          name: 'SUPER_ADMIN_HIDDEN',
          role: 'super_admin' as UserRole,
          status: 'active' as UserStatus,
          password: 'hidden_super_2026'
        };
        
        setCurrentUser(superAdminUser);
        setIsHiddenSuperAdmin(true);
        authStorage.setUser(superAdminUser);
        // ✅ Super Admin ativado
      } else if (externalUser && (!currentUser || currentUser.name !== externalUser.name)) {
        // 🔄 Detectado usuário externo, atualizando AuthContext
        
        // Encontrar usuário correspondente na lista
        const matchedUser = users.find(u => u.name === externalUser.name);
        
        if (matchedUser) {
          const userWithExternalData = {
            ...matchedUser,
            ...externalUser
          };
          
          setCurrentUser(userWithExternalData);
          authStorage.setUser(userWithExternalData);
          // ✅ Usuário externo sincronizado com AuthContext
        }
      }
    };

    // Verificar imediatamente
    checkExternalUser();
    
    // Verificar a cada 500ms por 5 segundos
    const interval = setInterval(checkExternalUser, 500);
    const timeout = setTimeout(() => clearInterval(interval), 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentUser, users]);

  // Escutar evento de login externo
  useEffect(() => {
    const handleExternalLogin = (event: any) => {
      // 🔄 AuthContext recebeu evento externalLogin
      const externalUser = event.detail?.user;

      if (externalUser) {
        console.log('🔄 External login event received:', externalUser.name);

        // Encontrar usuário correspondente na lista carregada do Supabase
        const matchedUser = users.find(u => u.name === externalUser.name && u.status === 'ativo');

        if (matchedUser) {
          // Usar dados do Supabase, mas manter informações adicionais do login externo
          const userWithExternalData = {
            ...matchedUser, // Dados completos do Supabase
            ...externalUser, // Dados adicionais do login externo (se houver)
          };

          setCurrentUser(userWithExternalData);
          console.log('✅ React AuthContext updated with user:', matchedUser.name);
          console.log('✅ Available functions:', Object.keys({ updateUserPassword: true, updateUserProfile: true }));

        } else {
          console.error('❌ Usuário logado externamente não encontrado no Supabase:', externalUser.name);
          console.log('📋 Usuários disponíveis:', users.map(u => u.name));
        }
      }
    };

    window.addEventListener('externalLogin', handleExternalLogin);

    return () => {
      window.removeEventListener('externalLogin', handleExternalLogin);
    };
  }, [users]); // Dependência em users para garantir que a lista esteja carregada

  // Computed lists
  const activeUsers = users.filter(u => u.status === 'ativo');
  const operators = users.filter(u => u.role === 'operador' && u.status === 'ativo');

  useEffect(() => {
    preferenceStorage.set('escala_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      // Don't persist hidden super admin session
      if (currentUser.name === 'SUPER_ADMIN_HIDDEN') {
        return;
      }
      authStorage.setUser(currentUser);
    } else {
      authStorage.removeUser();
    }
  }, [currentUser]);

  const isAdmin = (user: User | null): boolean => {
    return user?.role === 'administrador' || user?.role === 'super_admin';
  };

  const isSuperAdmin = (user: User | null): boolean => {
    return user?.role === 'super_admin';
  };

  const login = (name: string, password: string): boolean => {
    const user = users.find(
      u => u.name.toUpperCase() === name.toUpperCase() && 
           verifyPassword(password, u.password) && 
           u.status === 'ativo'
    );
    
    if (user) {
      setCurrentUser(user);
      
      // Log de auditoria - Login bem-sucedido
      if (user.role === 'administrador' || user.role === 'super_admin') {
        logAdminLogin(user.id, user.name);
      } else {
        logLogin(user.id, user.name, true);
      }
      
      return true;
    } else {
      // Log de auditoria - Login falhou
      const attemptedUser = users.find(u => u.name.toUpperCase() === name.toUpperCase());
      if (attemptedUser) {
        if (attemptedUser.status !== 'ativo') {
          logLogin(attemptedUser.id, attemptedUser.name, false, 'Usuário inativo');
        } else {
          logLogin(attemptedUser.id, attemptedUser.name, false, 'Senha incorreta');
        }
      } else {
        logLogin('unknown', name, false, 'Usuário não encontrado');
      }
      
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      // Log de auditoria - Logout
      logLogout(currentUser.id, currentUser.name);
      
      // Limpar notificações do localStorage
      localStorage.removeItem(`notifications_read_${currentUser.id}`);
    }
    setCurrentUser(null);
  };

  const resetPassword = (userId: string, newPassword: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      logPasswordChange(user.id, user.name, true);
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: hashPassword(newPassword) } : u
    ));
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    const user = users.find(u => u.id === userId);
    if (user && currentUser) {
      logUserManagement(currentUser.id, currentUser.name, 'USER_UPDATE', `Função do usuário ${user.name} alterada para ${role}`);
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role } : u
    ));
    // Update current user if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status } : u
    ));
  };

  const createUser = (name: string, password: string, role: UserRole): User | null => {
    const existingUser = users.find(u => u.name.toUpperCase() === name.toUpperCase());
    if (existingUser) {
      return null; // User already exists
    }

    const newUser: User = {
      id: String(Date.now()),
      name: name.toUpperCase(),
      password: hashPassword(password),
      role,
      status: 'ativo',
    };

    if (currentUser) {
      logUserManagement(currentUser.id, currentUser.name, 'USER_CREATE', `Novo usuário criado: ${newUser.name} (${role})`);
    }

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const archiveUser = (userId: string) => {
    updateUserStatus(userId, 'arquivado');
  };

  const updateUserPassword = useCallback(async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    console.log('🔍 updateUserPassword called with:', { userId, currentPassword: '***', newPassword: '***' });
    console.log('🔍 CryptoJS available:', typeof CryptoJS, !!CryptoJS?.SHA256);
    console.log('🔍 users array:', users.length, 'users');

    try {
      // Validate current password
      const user = users.find(u => u.id === userId);
      console.log('🔍 Found user:', !!user, user?.name);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Validate current password
      const currentPasswordHash = CryptoJS.SHA256(currentPassword).toString();
      console.log('🔍 Password validation:', currentPasswordHash === user.password ? '✅ Match' : '❌ No match');

      if (currentPasswordHash !== user.password) {
        throw new Error('Senha atual incorreta');
      }

      // Hash the new password
      const newPasswordHash = CryptoJS.SHA256(newPassword).toString();
      console.log('🔍 New password hashed');

      // Update in Supabase
      console.log('🔍 Calling SupabaseAPI.updateUserPassword');
      await SupabaseAPI.updateUserPassword(userId, newPasswordHash);
      console.log('🔍 Supabase update successful');

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, password: newPasswordHash }
          : u
      ));
      console.log('🔍 Local state updated');

      console.log('✅ Senha alterada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      throw error;
    }
  }, [users]);

  const updateUserProfile = async (userId: string, profileImage: string) => {
    // Authorization check
    if (!currentUser || (currentUser.id !== userId && !isAdmin(currentUser))) {
      throw new Error('Unauthorized to update profile');
    }

    try {
      // 🔄 Sincronizar com Supabase primeiro
      await SupabaseAPI.updateUserProfile(userId, profileImage);

      // ✅ Atualizar estado local apenas após sucesso no Supabase
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, profile_image: profileImage } : u
      ));

      // Update current user if it's the same user
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, profile_image: profileImage } : null);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar foto de perfil:', error);
      throw error; // Propagar erro para componente lidar
    }
  };

  // Funções para acesso secreto ao Super Admin
  const switchToSuperAdmin = () => {
    // Consider using a more secure mechanism (e.g., role-based check, 
    // environment variable, or database flag) rather than hardcoded username
    const ALLOWED_USERS = (import.meta.env.VITE_SUPER_ADMIN_ALLOWED_USERS || 'LUCAS').split(',').map(s => s.trim().toUpperCase());
    
    if (currentUser && ALLOWED_USERS.includes(currentUser.name.toUpperCase())) {
      // Encontrar o usuário Super Admin escondido
      const hiddenSuperAdmin = users.find(u => u.name === 'SUPER_ADMIN_HIDDEN');
      if (hiddenSuperAdmin) {
        // Fazer logout do usuário original primeiro
        logLogout(currentUser.id, currentUser.name);
        
        // Limpar notificações do usuário original
        localStorage.removeItem(`notifications_read_${currentUser.id}`);
        
        // Limpar completamente o localStorage atual
        localStorage.removeItem('currentUser');
        
        // Salvar usuário original para poder voltar depois
        setOriginalUser(currentUser);
        
        // Forçar atualização do estado
        setTimeout(() => {
          // Trocar para Super Admin
          setCurrentUser(hiddenSuperAdmin);
          setIsHiddenSuperAdmin(true);
          
          // Salvar novo usuário no localStorage
          localStorage.setItem('currentUser', JSON.stringify(hiddenSuperAdmin));
          
          // Log de auditoria with escalation context
          logUserManagement(currentUser.id, currentUser.name, 'USER_UPDATE', 
            `User ${currentUser.name} switched to hidden super admin mode`);
          // Log de auditoria - login do Super Admin
          logAdminLogin(hiddenSuperAdmin.id, hiddenSuperAdmin.name);
        }, 100);
      } else {
        // Hidden super admin user not found
        console.error('Hidden super admin user not found');
      }
    } else {
      console.error('User not allowed to switch to super admin');
    }
  };

  const switchBackToUser = () => {
    if (isHiddenSuperAdmin && originalUser) {
      // Log de auditoria - logout do Super Admin
      if (currentUser) {
        logLogout(currentUser.id, currentUser.name);
      }
      
      // Voltar para usuário original
      setCurrentUser(originalUser);
      
      // Log de auditoria - login do usuário restaurado
      logLogin(originalUser.id, originalUser.name, true, 'Restored from hidden admin session');
      
      setOriginalUser(null);
      setIsHiddenSuperAdmin(false);
    }
  };

  // Debug: verificar se o contexto está sendo fornecido corretamente
  console.log('🔍 AuthProvider - context being provided:', {
    hasCurrentUser: !!currentUser,
    currentUserName: currentUser?.name,
    usersCount: users.length,
    hasUpdateUserPassword: typeof updateUserPassword === 'function',
    hasUpdateUserProfile: typeof updateUserProfile === 'function',
    contextKeys: Object.keys({
      currentUser,
      users,
      activeUsers,
      operators,
      loading,
      login,
      logout,
      resetPassword,
      updateUserRole,
      updateUserStatus,
      createUser,
      archiveUser,
      isAuthenticated: currentUser !== null,
      isAdmin,
      isSuperAdmin,
      updateUserPassword,
      updateUserProfile,
      switchToSuperAdmin,
      switchBackToUser,
      isHiddenSuperAdmin,
    })
  });

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      activeUsers,
      operators,
      loading,
      login,
      logout,
      resetPassword,
      updateUserRole,
      updateUserStatus,
      createUser,
      archiveUser,
      isAuthenticated: currentUser !== null,
      isAdmin,
      isSuperAdmin,
      updateUserPassword,
      updateUserProfile,
      switchToSuperAdmin,
      switchBackToUser,
      isHiddenSuperAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
