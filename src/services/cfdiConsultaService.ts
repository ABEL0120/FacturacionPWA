import { unwrapApiCall } from "../api/apiClient";
import { cfdiConsultaApi } from "../api/cfdiConsultaApi";
import {
  CfdiArchivoBlobResult,
  CfdiConsultaItemDto,
  EnviarCorreoCfdiRequestDto,
} from "../types/cfdiConsulta.types";

export const cfdiConsultaService = {
  consultar: (
    numeroCliente: number,
    serie?: string,
    folio?: string,
  ): Promise<CfdiConsultaItemDto[]> =>
    unwrapApiCall(
      () => cfdiConsultaApi.consultarCfdis(numeroCliente, serie, folio),
      "Error al consultar las facturas emitidas.",
    ),

  obtenerArchivo: (
    idCfdi: string,
    tipo: "pdf" | "xml",
    numeroCliente?: number,
  ): Promise<CfdiArchivoBlobResult> =>
    cfdiConsultaApi.descargarArchivo(idCfdi, tipo, numeroCliente),

  guardarBlobEnDispositivo: (blob: Blob, nombreArchivo: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  enviarCorreo: (
    idCfdi: string,
    dto: EnviarCorreoCfdiRequestDto,
  ): Promise<boolean> =>
    unwrapApiCall(
      () => cfdiConsultaApi.enviarCorreo(idCfdi, dto),
      "No se ha podido enviar el correo.",
      false,
    ),
};
