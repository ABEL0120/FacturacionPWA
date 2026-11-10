import { apiClient } from "./apiClient";
import { ApiResponse } from "../types/auth.types";
import {
  BuscarRfcResponseDto,
  CatalogoItemDto,
  ClienteFiscalDto,
  ClienteRfcItemDto,
  ConsultarTicketRequestDto,
  FactTicketInitResponseDto,
  FacturaTicketResponseDto,
  GenerarFacturaTicketRequestDto,
  MonedaCatalogoDto,
  RegistrarRfcRequestDto,
  TicketConsultaResponseDto,
  ValidarTicketsRequestDto,
  ValidarTicketsResponseDto,
} from "../types/facturacion.types";

export * from "../types/facturacion.types";

export const facturacionApi = {
  inicializarFactTicket: async (
    numeroCliente: number,
    rfc?: string,
  ): Promise<ApiResponse<FactTicketInitResponseDto>> => {
    const response = await apiClient.get<ApiResponse<FactTicketInitResponseDto>>(
      `/fact-ticket/inicializar/${numeroCliente}`,
      {
        params: rfc?.trim() ? { rfc: rfc.trim().toUpperCase() } : undefined,
      },
    );
    return response.data;
  },

  consultarTicket: async (
    dto: ConsultarTicketRequestDto,
  ): Promise<ApiResponse<TicketConsultaResponseDto>> => {
    const response = await apiClient.post<ApiResponse<TicketConsultaResponseDto>>(
      "/fact-ticket/ticket/consultar",
      dto,
    );
    return response.data;
  },

  validarTickets: async (
    dto: ValidarTicketsRequestDto,
  ): Promise<ApiResponse<ValidarTicketsResponseDto>> => {
    const response = await apiClient.post<ApiResponse<ValidarTicketsResponseDto>>(
      "/fact-ticket/ticket/validar",
      dto,
    );
    return response.data;
  },

  buscarRfc: async (
    rfc: string,
    numeroCliente?: number | null,
  ): Promise<ApiResponse<BuscarRfcResponseDto>> => {
    const params: Record<string, string | number> = {
      rfc: rfc.trim().toUpperCase(),
    };
    if (numeroCliente && numeroCliente > 0) {
      params.numeroCliente = numeroCliente;
    }
    const response = await apiClient.get<ApiResponse<BuscarRfcResponseDto>>(
      "/fact-ticket/rfc",
      { params },
    );
    return response.data;
  },

  listarRfcsCliente: async (
    numeroCliente: number,
  ): Promise<ApiResponse<ClienteRfcItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<ClienteRfcItemDto[]>>(
      `/fact-ticket/cliente/${numeroCliente}/rfcs`,
    );
    return response.data;
  },

  registrarRfc: async (
    dto: RegistrarRfcRequestDto,
  ): Promise<ApiResponse<ClienteFiscalDto>> => {
    const response = await apiClient.post<ApiResponse<ClienteFiscalDto>>(
      "/fact-ticket/rfc",
      dto,
    );
    return response.data;
  },

  vistaPreviaFactura: async (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<ApiResponse<FacturaTicketResponseDto>> => {
    const response = await apiClient.post<ApiResponse<FacturaTicketResponseDto>>(
      "/fact-ticket/vista-previa",
      dto,
    );
    return response.data;
  },

  generarFactura: async (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<ApiResponse<FacturaTicketResponseDto>> => {
    const response = await apiClient.post<ApiResponse<FacturaTicketResponseDto>>(
      "/fact-ticket/generar",
      dto,
    );
    return response.data;
  },

  obtenerRegimenesFiscales: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/regimenes-fiscales",
    );
    return response.data;
  },

  obtenerUsosCfdi: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/usos-cfdi",
    );
    return response.data;
  },

  obtenerFormasPago: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/formas-pago",
    );
    return response.data;
  },

  obtenerEstados: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/estados",
    );
    return response.data;
  },

  obtenerMonedas: async (): Promise<ApiResponse<MonedaCatalogoDto[]>> => {
    const response = await apiClient.get<ApiResponse<MonedaCatalogoDto[]>>(
      "/catalogos-sat/monedas",
    );
    return response.data;
  },

  obtenerMotivosCancelacion: async (): Promise<ApiResponse<CatalogoItemDto[]>> => {
    const response = await apiClient.get<ApiResponse<CatalogoItemDto[]>>(
      "/catalogos-sat/motivos-cancelacion",
    );
    return response.data;
  },
};
