import { apiClient } from "./apiClient";
import { ApiResponse } from "../types/auth.types";
import {
  CfdiArchivoBlobResult,
  CfdiConsultaItemDto,
  EnviarCorreoCfdiRequestDto,
} from "../types/cfdiConsulta.types";

function extraerNombreArchivoHeader(
  disposition: string | undefined,
  fallback: string,
): string {
  if (!disposition) return fallback;
  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }
  return fallback;
}

async function extraerMensajeErrorBlob(
  err: unknown,
  fallback: string,
): Promise<string> {
  const errObj =
    typeof err === "object" && err !== null
      ? (err as { response?: { data?: unknown }; message?: unknown })
      : null;

  const data = errObj?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = (await data.text()).trim();
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: unknown };
          if (typeof parsed.message === "string" && parsed.message.trim()) {
            return parsed.message.trim();
          }
        } catch {
          if (!text.startsWith("<")) return text;
        }
      }
    } catch {
      return fallback;
    }
  }

  if (typeof errObj?.message === "string" && errObj.message.trim()) {
    return errObj.message.trim();
  }

  return fallback;
}

export const cfdiConsultaApi = {
  consultarCfdis: async (
    numeroCliente: number,
    serie?: string,
    folio?: string,
  ): Promise<ApiResponse<CfdiConsultaItemDto[]>> => {
    const params: Record<string, string | number> = { numeroCliente };
    if (serie?.trim()) params.serie = serie.trim();
    if (folio?.trim()) params.folio = folio.trim();

    const response = await apiClient.get<ApiResponse<CfdiConsultaItemDto[]>>(
      "/cfdi-consulta",
      { params },
    );
    return response.data;
  },

  descargarArchivo: async (
    idCfdi: string,
    tipo: "pdf" | "xml",
    numeroCliente?: number,
  ): Promise<CfdiArchivoBlobResult> => {
    const fallbackName = `${idCfdi.trim()}.${tipo}`;
    try {
      const response = await apiClient.get<Blob>(
        `/cfdi-consulta/${encodeURIComponent(idCfdi.trim())}/archivo`,
        {
          params: {
            tipo,
            ...(numeroCliente && numeroCliente > 0 ? { numeroCliente } : {}),
          },
          responseType: "blob",
        },
      );
      const fileName = extraerNombreArchivoHeader(
        response.headers["content-disposition"] as string | undefined,
        fallbackName,
      );
      return { blob: response.data, fileName };
    } catch (err: unknown) {
      const msg = await extraerMensajeErrorBlob(err, "No existe el Archivo");
      throw new Error(msg);
    }
  },

  enviarCorreo: async (
    idCfdi: string,
    dto: EnviarCorreoCfdiRequestDto,
  ): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.post<ApiResponse<boolean>>(
      `/cfdi-consulta/${encodeURIComponent(idCfdi.trim())}/enviar-correo`,
      dto,
    );
    return response.data;
  },
};
