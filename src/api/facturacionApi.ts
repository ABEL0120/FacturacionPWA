import { apiClient } from "./apiClient";
import { ApiResponse } from "../services/authService";

export interface CatalogoItemDto {
  numero: string;
  descripcion: string;
}

export interface ConsultaTicketRequestDto {
  folio: string;
  transaccion: number;
}

export interface TicketPartidaDto {
  numero: number;
  folio: string;
  transaccion: number;
  sucursal: number;
  fecha: string;
  producto: number;
  descripcion: string;
  claveProdServSat: string;
  claveProdServDesc: string;
  unidadMedidaSat: string;
  unidadMedida: string;
  cantidad: number;
  precio: number;
  porcentajeIva: number;
  precioSinIva: number;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
}

export interface ResumenTicketDto {
  folio: string;
  transaccion: number;
  sucursal: number;
  fecha: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  partidas: TicketPartidaDto[];
}

export interface ValidacionTicketsResponseDto {
  valido: boolean;
  mensaje: string;
  sucursal: number;
  subtotalTotal: number;
  ivaTotal: number;
  descuentoTotal: number;
  granTotal: number;
  partidasAgrupadas: TicketPartidaDto[];
}

export interface ClienteDto {
  numeroCliente: number;
  razonSocial: string;
  rfc: string;
  direccion: string;
  numeroExt: string;
  numeroInt: string;
  colonia: string;
  ciudad: string;
  delegacion: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
  mail: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
  validadoReceptor: string;
}

export interface ClienteRfcItemDto {
  numeroCliente: number;
  rfc: string;
  razonSocial: string;
}

export interface CrearClienteDto {
  numeroCliente: number;
  rfc: string;
  razonSocial: string;
  direccion: string;
  numeroExt: string;
  numeroInt: string;
  colonia: string;
  ciudad: string;
  delegacion: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
  mail: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
}

export interface FacturaItemDto {
  idCFDI: string;
  serie: string;
  folio: number;
  rfcReceptor: string;
  idCliente: number;
  subTotal: number;
  ivaImporte: number;
  total: number;
  fechaTimbre: string;
  orden: number;
  sucursal: number;
  sucursalDesc: string;
  uuid: string;
  estatusCfdi: number;
  estatusSat: string;
  tipoDeComprobante: string;
}

export interface CancelarFacturaRequestDto {
  uuid: string;
  motivoCancelacion: string;
  uuidSustituye?: string;
}

export interface CancelarFacturaResponseDto {
  exitoso: boolean;
  mensaje: string;
  acuse: string;
}

export const facturacionApi = {
  consultarTicket: async (
    dto: ConsultaTicketRequestDto
  ): Promise<ApiResponse<ResumenTicketDto>> => {
    const response = await apiClient.post<ApiResponse<ResumenTicketDto>>(
      "/tickets/consultar",
      dto
    );
    return response.data;
  },

  validarTickets: async (
    tickets: ConsultaTicketRequestDto[]
  ): Promise<ApiResponse<ValidacionTicketsResponseDto>> => {
    const response = await apiClient.post<ApiResponse<ValidacionTicketsResponseDto>>(
      "/tickets/validar",
      { tickets }
    );
    return response.data;
  },

  obtenerClientePorId: async (
    numeroCliente: number
  ): Promise<ApiResponse<ClienteDto>> => {
    const response = await apiClient.get<ApiResponse<ClienteDto>>(
      `/clientes/${numeroCliente}`
    );
    return response.data;
  },

  obtenerRfcsCliente: async (
    numeroCliente: number
  ): Promise<ApiResponse<ClienteRfcItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<ClienteRfcItemDto[]>>(
      `/clientes/${numeroCliente}/rfcs`
    );
    return response.data;
  },

  obtenerClientePorRfc: async (
    numeroCliente: number,
    rfc: string
  ): Promise<ApiResponse<ClienteDto>> => {
    const response = await apiClient.get<ApiResponse<ClienteDto>>(
      `/clientes/${numeroCliente}/rfc/${encodeURIComponent(rfc.trim().toUpperCase())}`
    );
    return response.data;
  },

  validarRfcSat: async (rfc: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `/clientes/validar-sat/${encodeURIComponent(rfc.trim().toUpperCase())}`
    );
    return response.data;
  },

  registrarRfc: async (dto: CrearClienteDto): Promise<ApiResponse<ClienteDto>> => {
    const response = await apiClient.post<ApiResponse<ClienteDto>>(
      "/clientes/rfcs",
      dto
    );
    return response.data;
  },

  actualizarCliente: async (dto: CrearClienteDto): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put<ApiResponse<boolean>>("/clientes", dto);
    return response.data;
  },

  obtenerRegimenesFiscales: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/regimenes-fiscales"
    );
    return response.data;
  },

  obtenerUsosCfdi: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/usos-cfdi"
    );
    return response.data;
  },

  obtenerFormasPago: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/formas-pago"
    );
    return response.data;
  },

  obtenerEstados: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/estados"
    );
    return response.data;
  },

  obtenerMonedas: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/monedas"
    );
    return response.data;
  },

  obtenerMotivosCancelacion: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/motivos-cancelacion"
    );
    return response.data;
  },

  consultarFacturasCliente: async (
    idCliente: number
  ): Promise<ApiResponse<FacturaItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<FacturaItemDto[]>>(
      `/facturas/cliente/${idCliente}`
    );
    return response.data;
  },

  obtenerFacturaPorId: async (
    idCfdi: string
  ): Promise<ApiResponse<FacturaItemDto>> => {
    const response = await apiClient.get<ApiResponse<FacturaItemDto>>(
      `/facturas/${encodeURIComponent(idCfdi)}`
    );
    return response.data;
  },

  cancelarFactura: async (
    dto: CancelarFacturaRequestDto
  ): Promise<ApiResponse<CancelarFacturaResponseDto>> => {
    const response = await apiClient.post<ApiResponse<CancelarFacturaResponseDto>>(
      "/facturas/cancelar",
      dto
    );
    return response.data;
  },
};
