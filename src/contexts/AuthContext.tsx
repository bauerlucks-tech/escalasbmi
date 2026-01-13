import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, UserStatus, initialUsers } from '@/data/scheduleData';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('escala_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: add role/status if missing
      return parsed.map((u: any) => ({
        ...u,
        role: u.role || (u.isAdmin ? 'administrador' : 'operador'),
        status: u.status || 'ativo',
      }));
    }
    return initialUsers;
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('escala_currentUser');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        role: parsed.role || (parsed.isAdmin ? 'administrador' : 'operador'),
        status: parsed.status || 'ativo',
      };
    }
    return null;
  });

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
    return user?.role === 'administrador';
  };

  const login = (name: string, password: string): boolean => {
    const user = users.find(
      u => u.name.toUpperCase() === name.toUpperCase() && 
           u.password === password && 
           u.status === 'ativo'
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetPassword = (userId: string, newPassword: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, password: newPassword } : u
    ));
  };

  const updateUserRole = (userId: string, role: UserRole) => {
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

    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const archiveUser = (userId: string) => {
    updateUserStatus(userId, 'arquivado');
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
