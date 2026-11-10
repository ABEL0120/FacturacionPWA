import { unwrapApiCall } from "../api/apiClient";
import { facturacionApi } from "../api/facturacionApi";
import {
  BuscarRfcResponseDto,
  ClienteFiscalDto,
  ClienteRfcItemDto,
  ConsultarTicketRequestDto,
  FactTicketInitResponseDto,
  FacturaTicketResponseDto,
  GenerarFacturaTicketRequestDto,
  RegistrarRfcRequestDto,
  TicketConsultaResponseDto,
  ValidarTicketsRequestDto,
  ValidarTicketsResponseDto,
} from "../types/facturacion.types";
import { buildFacturaPdfHtml } from "../utils/facturaPdfTemplate";

export const facturacionService = {
  inicializar: (
    numeroCliente: number,
    rfc?: string,
  ): Promise<FactTicketInitResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.inicializarFactTicket(numeroCliente, rfc),
      "No fue posible inicializar el módulo de facturación.",
    ),

  consultarTicket: (
    dto: ConsultarTicketRequestDto,
  ): Promise<TicketConsultaResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.consultarTicket(dto),
      "Error al consultar el ticket.",
    ),

  validarTickets: (
    dto: ValidarTicketsRequestDto,
  ): Promise<ValidarTicketsResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.validarTickets(dto),
      "Error al validar los tickets.",
    ),

  buscarRfc: (
    rfc: string,
    numeroCliente?: number | null,
  ): Promise<BuscarRfcResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.buscarRfc(rfc, numeroCliente),
      "Error al consultar el RFC.",
    ),

  listarRfcsCliente: (numeroCliente: number): Promise<ClienteRfcItemDto[]> =>
    unwrapApiCall(
      () => facturacionApi.listarRfcsCliente(numeroCliente),
      "Error al obtener RFCs del cliente.",
    ),

  registrarRfc: (dto: RegistrarRfcRequestDto): Promise<ClienteFiscalDto> =>
    unwrapApiCall(
      () => facturacionApi.registrarRfc(dto),
      "No fue posible guardar el registro fiscal.",
    ),

  vistaPrevia: (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<FacturaTicketResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.vistaPreviaFactura(dto),
      "Error al generar vista previa de factura.",
    ),

  generarFactura: (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<FacturaTicketResponseDto> =>
    unwrapApiCall(
      () => facturacionApi.generarFactura(dto),
      "Error al generar la factura.",
    ),

  descargarXml: (xmlSinTimbrar: string, nombreArchivo: string) => {
    if (!xmlSinTimbrar) {
      throw new Error("El comprobante no contiene XML generado para descargar.");
    }
    const blob = new Blob([xmlSinTimbrar], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  descargarPdf: (factura: FacturaTicketResponseDto) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error(
        "El navegador bloqueó la ventana emergente para generar el PDF. Habilita las ventanas emergentes e intenta nuevamente.",
      );
    }

    printWindow.document.write(buildFacturaPdfHtml(factura));
    printWindow.document.close();
  },
};

export default facturacionService;
