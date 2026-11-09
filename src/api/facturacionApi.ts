import { apiClient } from "./apiClient";

export interface TicketBusquedaParams {
  sucursal: string;
  folio: string;
  monto: number | string;
}

export interface TicketData {
  id?: string;
  sucursal?: string;
  folio?: string;
  monto?: number;
  fecha?: string;
  [key: string]: any;
}

export const facturacionApi = {
  buscarTicket: async (params: TicketBusquedaParams): Promise<TicketData> => {
    const response = await apiClient.post("/facturacion/buscar-ticket", params);
    return response.data;
  },

  obtenerSucursales: async (): Promise<Array<{ id: string; nombre: string }>> => {
    const response = await apiClient.get("/facturacion/sucursales");
    return response.data;
  },
};

