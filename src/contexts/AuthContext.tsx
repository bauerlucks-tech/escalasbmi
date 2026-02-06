import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserStatus, initialUsers } from '@/data/scheduleData';
import { logLogin, logLogout, logPasswordChange, logUserManagement, logAdminLogin } from '@/data/auditLogs';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('escala_users');
    let userList: User[];
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: add role/status if missing
      userList = parsed.map((u: any) => ({
        ...u,
        role: u.role || (u.isAdmin ? 'administrador' : 'operador'),
        status: u.status || 'ativo',
      }));
    } else {
      userList = initialUsers;
    }
    
    // Ensure admin user exists with correct password and settings
    const adminUser = userList.find(u => u.name.toUpperCase() === 'ADMIN');
    if (adminUser) {
      // Update admin user if password is not 1234 or missing hideFromSchedule
      if (adminUser.password !== '1234' || adminUser.hideFromSchedule !== true) {
        userList = userList.map(u => 
          u.id === adminUser.id 
            ? { ...u, password: '1234', hideFromSchedule: true }
            : u
        );
      }
    } else {
      // Create admin user if it doesn't exist
      const newAdmin: User = {
        id: String(Date.now()),
        name: 'ADMIN',
        password: '1234',
        role: 'administrador',
        status: 'ativo',
        hideFromSchedule: true,
      };
      userList = [...userList, newAdmin];
    }
    
    return userList;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Desabilitar auto-login - sempre começar sem usuário logado
    // Usuário deve fazer login manualmente através da tela StitchLoginScreen
    return null;
  });

  // Verificar usuário externo periodicamente - DESATIVADO para forçar login manual
  // O usuário deve sempre passar pela tela de login Stitch
  /*
  useEffect(() => {
    const checkExternalUser = () => {
      const externalUser = localStorage.getItem('reactCurrentUser');
      if (externalUser && !currentUser) {
        try {
          const parsed = JSON.parse(externalUser);
          console.log('🔄 Detectado usuário externo, atualizando AuthContext:', parsed.name);
          
          // Encontrar usuário correspondente na lista
          const matchedUser = users.find(u => u.name === parsed.name);
          
          if (matchedUser) {
            const userWithExternalData = {
              ...matchedUser,
              ...parsed
            };
            
            setCurrentUser(userWithExternalData);
            localStorage.setItem('escala_currentUser', JSON.stringify(userWithExternalData));
            console.log('✅ Usuário externo sincronizado com AuthContext:', userWithExternalData.name);
          }
        } catch (error) {
          console.error('❌ Erro ao processar usuário externo:', error);
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
  */

  // Computed lists
  const activeUsers = users.filter(u => u.status === 'ativo');
  const operators = users.filter(u => u.role === 'operador' && u.status === 'ativo');

  useEffect(() => {
    localStorage.setItem('escala_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('escala_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('escala_currentUser');
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
           u.password === password && 
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
      u.id === userId ? { ...u, password: newPassword } : u
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
      password,
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
    if (!user || user.password !== currentPassword) {
      if (user) {
        logPasswordChange(user.id, user.name, false, 'Senha atual incorreta');
      }
      return false;
    }

    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
    
    logPasswordChange(user.id, user.name, true);
    
    // Update current user if it's the same user
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
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
