import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, LoginResponse, RegistroClienteRequest } from "../services/authService";
import { passkeyService } from "../services/passkeyService";

export interface UserSession {
  numeroCliente?: number;
  email: string;
  nombre?: string;
  rfc?: string;
  telefono?: string;
  esAdmin?: boolean;
  esBfmafb?: boolean;
  esUsuario?: boolean;
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
  login: (usuario: string, contrasena: string) => Promise<boolean>;
  loginWithPasskey: () => Promise<boolean>;
  register: (data: RegistroClienteRequest) => Promise<boolean>;
  resetPassword: (rfc: string, mail: string, nuevaContrasena: string) => Promise<boolean>;
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

  const login = async (usuario: string, contrasena: string): Promise<boolean> => {
    const data: LoginResponse = await authService.login(usuario, contrasena);

    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(
      JSON.stringify({
        sub: data.mail,
        numeroCliente: data.numeroCliente,
        nombre: data.razonSocial,
        esAdmin: data.esAdmin,
        esBfmafb: data.esBfmafb,
        esUsuario: data.esUsuario,
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const simulatedSignature = btoa("jwt_secret_ventio_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      numeroCliente: data.numeroCliente,
      email: data.mail,
      nombre: data.razonSocial,
      telefono: data.telefono,
      esAdmin: data.esAdmin,
      esBfmafb: data.esBfmafb,
      esUsuario: data.esUsuario,
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
    const simulatedSignature = btoa("jwt_secret_ventio_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      email: authResult.usuario,
      nombre: authResult.nombre,
    };

    setToken(jwt);
    setUser(session);
    return true;
  };

  const register = async (data: RegistroClienteRequest): Promise<boolean> => {
    const res = await authService.registro(data);

    const simulatedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const simulatedPayload = btoa(
      JSON.stringify({
        sub: res.mail,
        numeroCliente: res.numeroCliente,
        nombre: res.razonSocial,
        rfc: data.rfc,
        exp: Math.floor(Date.now() / 1000) + 86400,
      })
    );
    const simulatedSignature = btoa("jwt_secret_ventio_token");
    const jwt = `${simulatedHeader}.${simulatedPayload}.${simulatedSignature}`;

    const session: UserSession = {
      numeroCliente: res.numeroCliente,
      email: res.mail,
      nombre: res.razonSocial,
      rfc: data.rfc,
      telefono: res.telefono || data.telefono,
      direccion: data.direccion,
      noExterior: data.numeroExt,
      noInterior: data.numeroInt,
      colonia: data.colonia,
      municipio: data.delegacion,
      ciudad: data.ciudad,
      estado: data.estado,
      cp: data.codigoPostal,
      regimenFiscal: data.regimenFiscal,
      formaPago: data.formaPago,
      usoCfdi: data.usoCfdi,
      esUsuario: true,
    };

    setToken(jwt);
    setUser(session);
    return true;
  };

  const resetPassword = async (
    rfc: string,
    mail: string,
    nuevaContrasena: string
  ): Promise<boolean> => {
    return await authService.recuperarContrasena({
      rfc,
      mail,
      nuevaContrasena,
      confirmarNuevaContrasena: nuevaContrasena,
    });
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
