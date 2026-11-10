import { CatalogoItemDto } from "../types/facturacion.types";

export const escapeHtml = (value: string): string =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export const formatMoney = (value: number | string | undefined | null): string =>
  `$${Number(value ?? 0).toFixed(2)}`;

export const formatFechaComprobante = (
  fecha: string | undefined | null,
): string => {
  if (!fecha) return "—";
  const match = fecha
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) return fecha;
  const [, anio, mesStr, diaStr, hora, minuto] = match;
  const mesNombre = MESES_CORTOS[Number(mesStr) - 1] ?? mesStr;
  const base = `${Number(diaStr)} ${mesNombre} ${anio}`;
  return hora && minuto ? `${base}, ${hora}:${minuto}` : base;
};

export const formatTipoComprobante = (tipo: string | undefined | null): string => {
  switch ((tipo || "").trim().toUpperCase()) {
    case "I":
      return "I - Ingreso";
    case "E":
      return "E - Egreso";
    case "T":
      return "T - Traslado";
    case "P":
      return "P - Pago";
    case "N":
      return "N - Nómina";
    default:
      return tipo || "I - Ingreso";
  }
};

export const formatMetodoPago = (metodo: string | undefined | null): string => {
  switch ((metodo || "").trim().toUpperCase()) {
    case "PUE":
      return "PUE - Pago en una sola exhibición";
    case "PPD":
      return "PPD - Pago en parcialidades o diferido";
    default:
      return metodo || "PUE";
  }
};

export const formatExportacion = (exp: string | undefined | null): string => {
  switch ((exp || "").trim()) {
    case "01":
      return "01 - No aplica";
    case "02":
      return "02 - Definitiva";
    case "03":
      return "03 - Temporal";
    case "04":
      return "04 - Definitiva distinta a A1";
    default:
      return exp || "01 - No aplica";
  }
};

export const formatEstatusCfdi = (
  estadoTimbrado: string | undefined | null,
  timbrado: boolean,
): string => {
  if (timbrado) return "CFDI 4.0 Timbrado";
  if (estadoTimbrado === "VISTA_PREVIA") return "Vista Previa";
  if (estadoTimbrado === "PENDIENTE_TIMBRADOR") return "Pendiente de Timbrado";
  return estadoTimbrado || "En proceso";
};

export const resolverEstadoDefault = (estados: CatalogoItemDto[]): string => {
  const coahuila = estados.find(
    (item) => item.descripcion.trim().toLowerCase() === "coahuila",
  );
  if (coahuila) return coahuila.descripcion;
  return estados.length > 0 ? estados[0].descripcion : "Coahuila";
};

export const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
};

export const isNotAllowedError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "name" in err &&
  (err as { name?: unknown }).name === "NotAllowedError";
