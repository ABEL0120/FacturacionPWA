export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
}

export interface UserSession {
  numeroCliente?: number;
  email: string;
  nombre?: string;
  rfc?: string;
  telefono?: string;
  esAdmin?: boolean;
  esBfmafb?: boolean;
  esUsuario?: boolean;
  moduloDestino?: string;
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

export interface LoginResponse {
  numeroCliente: number;
  razonSocial: string;
  mail: string;
  telefono: string;
  esAdmin: boolean;
  esBfmafb: boolean;
  esUsuario: boolean;
  moduloDestino: string;
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

