import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { passkeyService } from "../services/passkeyService";
import {
  LoginResponse,
  RegistroClienteRequest,
  UserSession,
} from "../types/auth.types";
import { crearTokenSimulado } from "../utils/jwt";

export type { UserSession } from "../types/auth.types";

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (usuario: string, contrasena: string) => Promise<UserSession>;
  loginWithPasskey: () => Promise<UserSession>;
  register: (data: RegistroClienteRequest) => Promise<UserSession>;
  resetPassword: (
    rfc: string,
    mail: string,
    nuevaContrasena: string,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => ({ email: "" }),
  loginWithPasskey: async () => ({ email: "" }),
  register: async () => ({ email: "" }),
  resetPassword: async () => false,
  logout: () => {},
});

const TOKEN_STORAGE_KEY = "jwt_token";
const USER_STORAGE_KEY = "facturacion_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [user, token]);

  const establecerSesion = (
    session: UserSession,
    jwtPayload: Record<string, unknown>,
  ): UserSession => {
    const jwt = crearTokenSimulado(jwtPayload);
    setToken(jwt);
    setUser(session);
    return session;
  };

  const login = async (
    usuario: string,
    contrasena: string,
  ): Promise<UserSession> => {
    const data: LoginResponse = await authService.login(usuario, contrasena);
    const moduloDestino =
      data.moduloDestino || (data.esUsuario ? "CFDI40_FactTicket" : "Menu");

    return establecerSesion(
      {
        numeroCliente: data.numeroCliente,
        email: data.mail,
        nombre: data.razonSocial,
        telefono: data.telefono,
        esAdmin: data.esAdmin,
        esBfmafb: data.esBfmafb,
        esUsuario: data.esUsuario,
        moduloDestino,
      },
      {
        sub: data.mail,
        numeroCliente: data.numeroCliente,
        nombre: data.razonSocial,
        esAdmin: data.esAdmin,
        esBfmafb: data.esBfmafb,
        esUsuario: data.esUsuario,
        moduloDestino,
      },
    );
  };

  const loginWithPasskey = async (): Promise<UserSession> => {
    const authResult = await passkeyService.autenticarPasskey();
    const moduloDestino = authResult.moduloDestino || "CFDI40_FactTicket";

    return establecerSesion(
      {
        numeroCliente: authResult.numeroCliente,
        email: authResult.usuario,
        nombre: authResult.nombre,
        rfc: authResult.rfc,
        telefono: authResult.telefono,
        moduloDestino,
        esUsuario: true,
      },
      {
        sub: authResult.usuario,
        numeroCliente: authResult.numeroCliente,
        nombre: authResult.nombre,
        moduloDestino,
        auth_method: "passkey",
      },
    );
  };

  const register = async (
    data: RegistroClienteRequest,
  ): Promise<UserSession> => {
    const res = await authService.registro(data);
    const moduloDestino = res.moduloDestino || "CFDI40_FactTicket";

    return establecerSesion(
      {
        numeroCliente: res.numeroCliente,
        email: res.mail,
        nombre: res.razonSocial,
        rfc: data.rfc,
        telefono: res.telefono || data.telefono,
        moduloDestino,
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
      },
      {
        sub: res.mail,
        numeroCliente: res.numeroCliente,
        nombre: res.razonSocial,
        rfc: data.rfc,
        moduloDestino,
      },
    );
  };

  const resetPassword = async (
    rfc: string,
    mail: string,
    nuevaContrasena: string,
  ): Promise<boolean> =>
    authService.recuperarContrasena({
      rfc,
      mail,
      nuevaContrasena,
      confirmarNuevaContrasena: nuevaContrasena,
    });

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
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
