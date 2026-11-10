import { CatalogoItemDto } from "../types/facturacion.types";

export const escapeHtml = (value: string): string =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const formatMoney = (value: number | string | undefined | null): string =>
  `$${Number(value ?? 0).toFixed(2)}`;

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
