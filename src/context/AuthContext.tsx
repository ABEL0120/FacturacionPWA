import React, { createContext, useContext, useState, useEffect } from "react";
import { passkeyService } from "../services/passkeyService";

export interface UserSession {
  email: string;
  nombre?: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  noExterior?: string;
  noInterior?: string;
  colonia?: string;
  municipio?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
  regimenFiscal?: string;
  formaPago?: string;
  usoCfdi?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginWithPasskey: () => Promise<boolean>;
  register: (data: UserSession & { password?: string }) => Promise<boolean>;
  resetPassword: (emailOrRfc: string, newPass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => false,
  loginWithPasskey: async () => false,
  register: async () => false,
  resetPassword: async () => false,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("jwt_token");
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem("facturacion_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("facturacion_user", JSON.stringify(user));
      localStorage.setItem("jwt_token", token);
    } else {
      localStorage.removeItem("facturacion_user");
      localStorage.removeItem("jwt_token");
    }
  }, [user, token]);

  const login = async (email: string): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));

    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(
      JSON.stringify({
        sub: email,
        nombre: email.split("@")[0].toUpperCase(),
        rfc: "XAXX010101000",
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const simulatedSignature = btoa("jwt_secret_tizoncito_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      email,
      nombre: email.split("@")[0].toUpperCase(),
      rfc: "XAXX010101000",
    };

    setToken(jwt);
    setUser(session);
    return true;
  };

  const loginWithPasskey = async (): Promise<boolean> => {
    const authResult = await passkeyService.autenticarPasskey();

    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(
      JSON.stringify({
        sub: authResult.usuario,
        nombre: authResult.nombre,
        auth_method: "passkey",
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const simulatedSignature = btoa("jwt_secret_tizoncito_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      email: authResult.usuario,
      nombre: authResult.nombre,
      rfc: "XAXX010101000",
    };

    setToken(jwt);
    setUser(session);
    return true;
  };

  const register = async (data: UserSession): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 700));

    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(
      JSON.stringify({
        sub: data.email,
        nombre: data.nombre,
        rfc: data.rfc,
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const simulatedSignature = btoa("jwt_secret_tizoncito_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      email: data.email,
      nombre: data.nombre || data.email.split("@")[0],
      rfc: data.rfc,
      telefono: data.telefono,
      direccion: data.direccion,
      noExterior: data.noExterior,
      noInterior: data.noInterior,
      colonia: data.colonia,
      municipio: data.municipio,
      ciudad: data.ciudad,
      estado: data.estado,
      cp: data.cp,
      regimenFiscal: data.regimenFiscal,
      formaPago: data.formaPago,
      usoCfdi: data.usoCfdi,
    };

    setToken(jwt);
    setUser(session);
    return true;
  };

  const resetPassword = async (): Promise<boolean> => {
    await new Promise((res) => setTimeout(res, 600));
    return true;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("facturacion_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        loginWithPasskey,
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
