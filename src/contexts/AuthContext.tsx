import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import CryptoJS from 'crypto-js';
import { User, UserRole, UserStatus, initialUsers } from '@/data/scheduleData';
import { logLogin, logLogout, logPasswordChange, logUserManagement, logAdminLogin } from '@/data/auditLogs';
import { authStorage, preferenceStorage } from '@/utils/secureStorage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  activeUsers: User[];
  operators: User[];
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
  updateUserPassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
  updateUserProfile: (userId: string, profileImage: string) => void;
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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = preferenceStorage.get('escala_users');
    let userList: User[];
    if (saved) {
      // Migration: add role/status if missing AND migrate passwords to hash
    userList = saved.map((u: any) => ({
      ...u,
      role: u.role || (u.isAdmin ? 'administrador' : 'operador'),
      status: u.status || 'ativo',
      password: migratePasswordToHash(u.password)
    }));
    } else {
      userList = initialUsers;
    }
    
    // Ensure admin user exists with correct password and settings
    const adminUser = userList.find(u => u.name.toUpperCase() === 'ADMIN');
    if (adminUser) {
      // Update admin user if password is not hash of 1234 or missing hideFromSchedule
      const adminPasswordHash = hashPassword('1234');
      if (adminUser.password !== adminPasswordHash || adminUser.hideFromSchedule !== true) {
        userList = userList.map(u => 
          u.id === adminUser.id 
            ? { ...u, password: adminPasswordHash, hideFromSchedule: true }
            : u
        );
      }
    } else {
      // Create admin user if it doesn't exist
      const newAdmin: User = {
        id: String(Date.now()),
        name: 'ADMIN',
        password: hashPassword('1234'),
        role: 'administrador',
        status: 'ativo',
        hideFromSchedule: true,
      };
      userList = [...userList, newAdmin];
    }
    
    return userList;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Verificar se há usuário do login externo PRIMEIRO
    const externalUser = authStorage.getUser();
    if (externalUser) {
      console.log('🔄 Carregando usuário externo no AuthContext:', externalUser.name);
      return externalUser;
    }
    
    // Verificar usuário salvo normalmente
    const saved = authStorage.getUser();
    if (saved) {
      return {
        ...saved,
        role: saved.role || (saved.isAdmin ? 'administrador' : 'operador'),
        status: saved.status || 'ativo',
      };
    }
    return null;
  });

  // Verificar usuário externo periodicamente
  useEffect(() => {
    const checkExternalUser = () => {
      // Tentar obter usuário do localStorage (sistema externo)
      const externalUserStr = localStorage.getItem('directAuth_currentUser');
      const externalUser = externalUserStr ? JSON.parse(externalUserStr) : null;
      
      console.log('🔍 Verificando usuário externo:', externalUser?.name);
      
      if (externalUser && !currentUser) {
        console.log('🔄 Detectado usuário externo, atualizando AuthContext:', externalUser.name);
        
        // Encontrar usuário correspondente na lista
        const matchedUser = users.find(u => u.name === externalUser.name);
        
        if (matchedUser) {
          const userWithExternalData = {
            ...matchedUser,
            ...externalUser
          };
          
          setCurrentUser(userWithExternalData);
          authStorage.setUser(userWithExternalData);
          console.log('✅ Usuário externo sincronizado com AuthContext:', userWithExternalData.name);
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

  // Escutar evento de logout externo
  useEffect(() => {
    const handleExternalLogout = () => {
      console.log('🔄 AuthContext recebeu evento externalLogout');
      setCurrentUser(null);
      authStorage.removeUser();
    };

    window.addEventListener('externalLogout', handleExternalLogout);
    
    return () => {
      window.removeEventListener('externalLogout', handleExternalLogout);
    };
  }, []);

  // Computed lists
  const activeUsers = users.filter(u => u.status === 'ativo');
  const operators = users.filter(u => u.role === 'operador' && u.status === 'ativo');

  useEffect(() => {
    preferenceStorage.set('escala_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
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

  const updateUserPassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
    const user = users.find(u => u.id === userId);
    if (!user || !verifyPassword(currentPassword, user.password)) {
      if (user) {
        logPasswordChange(user.id, user.name, false, 'Senha atual incorreta');
      }
      return false;
    }

    const newPasswordHash = hashPassword(newPassword);
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPasswordHash } : u
    ));
    
    logPasswordChange(user.id, user.name, true);
    
    // Update current user if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPasswordHash } : null);
    }
    
    return true;
  };

  const updateUserProfile = (userId: string, profileImage: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, profileImage } : u
    ));
    
    // Update current user if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, profileImage } : null);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      activeUsers,
      operators,
      login,
      logout,
      resetPassword,
      updateUserRole,
      updateUserStatus,
      createUser,
      archiveUser,
      isAuthenticated: !!currentUser,
      isAdmin,
      isSuperAdmin,
      updateUserPassword,
      updateUserProfile,
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
