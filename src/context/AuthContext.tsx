import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserSession {
  email: string;
  nombre?: string;
  rfc?: string;
  telefono?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: UserSession & { password?: string }) => Promise<boolean>;
  resetPassword: (emailOrRfc: string, newPass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  resetPassword: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("facturacion_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem("facturacion_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("facturacion_user");
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));
    const session: UserSession = {
      email,
      nombre: email.split("@")[0].toUpperCase(),
      rfc: "XAXX010101000",
    };
    setUser(session);
    return true;
  };

  const register = async (data: UserSession): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 700));
    setUser({
      email: data.email,
      nombre: data.nombre || data.email.split("@")[0],
      rfc: data.rfc,
      telefono: data.telefono,
    });
    return true;
  };

  const resetPassword = async (): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("facturacion_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

