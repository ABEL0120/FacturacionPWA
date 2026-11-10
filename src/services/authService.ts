import { apiClient, extractApiErrorMessage } from "../api/apiClient";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  numeroCliente: number;
  razonSocial: string;
  mail: string;
  telefono: string;
  esAdmin: boolean;
  esBfmafb: boolean;
  esUsuario: boolean;
}

export interface RegistroClienteRequest {
  rfc: string;
  razonSocial: string;
  mail: string;
  contraseña: string;
  confirmarContraseña: string;
  telefono: string;
  direccion: string;
  numeroExt: string;
  numeroInt?: string;
  colonia: string;
  ciudad?: string;
  delegacion: string;
  estado: string;
  codigoPostal: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
}

export interface CuentaRecuperacionValida {
  numeroCliente: number;
  rfc: string;
  mail: string;
  razonSocial: string;
}

export interface RecuperarContrasenaRequest {
  rfc: string;
  mail: string;
  nuevaContrasena: string;
  confirmarNuevaContrasena: string;
}

export interface CambiarContrasenaRequest {
  mail: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmarNuevaContrasena: string;
}

export const authService = {
  login: async (usuario: string, contraseña: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
        usuario: usuario.trim(),
        contraseña: contraseña.trim(),
      });
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Credenciales incorrectas.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "No se pudo conectar con el servidor."));
    }
  },

  registro: async (dto: RegistroClienteRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/registro", dto);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "No fue posible registrar al cliente.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al procesar el registro."));
    }
  },

  validarCuentaRecuperacion: async (
    rfc: string,
    mail: string
  ): Promise<CuentaRecuperacionValida> => {
    try {
      const response = await apiClient.post<ApiResponse<CuentaRecuperacionValida>>(
        "/auth/validar-cuenta-recuperacion",
        {
          rfc: rfc.trim().toUpperCase(),
          mail: mail.trim(),
        }
      );
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "No se encontró una cuenta con esos datos.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "No fue posible validar la cuenta."));
    }
  },

  recuperarContrasena: async (dto: RecuperarContrasenaRequest): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<boolean>>(
        "/auth/recuperar-contrasena",
        dto
      );
      if (response.data && response.data.success) {
        return true;
      }
      throw new Error(response.data?.message || "No fue posible actualizar la contraseña.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al actualizar la contraseña."));
    }
  },

  cambiarContrasena: async (dto: CambiarContrasenaRequest): Promise<boolean> => {
    try {
      const response = await apiClient.post<ApiResponse<boolean>>(
        "/auth/cambiar-contrasena",
        dto
      );
      if (response.data && response.data.success) {
        return true;
      }
      throw new Error(response.data?.message || "No fue posible cambiar la contraseña.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al cambiar la contraseña."));
    }
  },
};

export default authService;
