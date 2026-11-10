import { apiClient, unwrapApiCall } from "../api/apiClient";
import {
  ApiResponse,
  CambiarContrasenaRequest,
  CuentaRecuperacionValida,
  LoginResponse,
  RecuperarContrasenaRequest,
  RegistroClienteRequest,
} from "../types/auth.types";

export * from "../types/auth.types";

export const authService = {
  login: async (usuario: string, contraseña: string): Promise<LoginResponse> =>
    unwrapApiCall(
      async () => {
        const res = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
          usuario: usuario.trim(),
          contraseña: contraseña.trim(),
        });
        return res.data;
      },
      "Credenciales incorrectas.",
    ),

  registro: async (dto: RegistroClienteRequest): Promise<LoginResponse> =>
    unwrapApiCall(
      async () => {
        const res = await apiClient.post<ApiResponse<LoginResponse>>("/auth/registro", dto);
        return res.data;
      },
      "No fue posible registrar al cliente.",
    ),

  validarCuentaRecuperacion: async (
    rfc: string,
    mail: string,
  ): Promise<CuentaRecuperacionValida> =>
    unwrapApiCall(
      async () => {
        const res = await apiClient.post<ApiResponse<CuentaRecuperacionValida>>(
          "/auth/validar-cuenta-recuperacion",
          {
            rfc: rfc.trim().toUpperCase(),
            mail: mail.trim(),
          },
        );
        return res.data;
      },
      "No se encontró una cuenta con esos datos.",
    ),

  recuperarContrasena: async (
    dto: RecuperarContrasenaRequest,
  ): Promise<boolean> => {
    await unwrapApiCall(
      async () => {
        const res = await apiClient.post<ApiResponse<boolean>>(
          "/auth/recuperar-contrasena",
          dto,
        );
        return res.data;
      },
      "No fue posible actualizar la contraseña.",
      false,
    );
    return true;
  },

  cambiarContrasena: async (dto: CambiarContrasenaRequest): Promise<boolean> => {
    await unwrapApiCall(
      async () => {
        const res = await apiClient.post<ApiResponse<boolean>>(
          "/auth/cambiar-contrasena",
          dto,
        );
        return res.data;
      },
      "No fue posible cambiar la contraseña.",
      false,
    );
    return true;
  },
};

export default authService;
