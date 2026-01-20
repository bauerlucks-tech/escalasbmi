import { createContext, useContext, useState } from "react";

type Role = "admin" | "user" | "suser";

type User = {
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USERS = [
  { name: "RICARDO", password: "admin123", role: "admin" as Role },
  { name: "LUCAS", password: "suser123", role: "suser" as Role },
  { name: "CARLOS", password: "user123", role: "user" as Role },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (name: string, password: string) => {
    const found = USERS.find(
      (u) => u.name === name.toUpperCase() && u.password === password
    );

    if (!found) return false;

    setUser({ name: found.name, role: found.role });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
