export const normalizarRfc = (value: string): string =>
  value.trim().toUpperCase();

export const soloDigitos = (value: string): string =>
  value.replace(/\D/g, "");

export const esRfcLongitudValida = (value: string): boolean => {
  const limpio = normalizarRfc(value);
  return limpio.length >= 12 && limpio.length <= 13;
};

export const esCodigoPostalValido = (value: string): boolean =>
  value.trim().length === 5;

export const esTelefonoValido = (value: string): boolean =>
  value.trim().length >= 10;

export const esEmailValido = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export const esPasswordLongitudValida = (value: string): boolean =>
  value.length >= 3 && value.length <= 13;

export const parseEnteroPositivo = (value: string): number | null => {
  const limpio = value.trim();
  if (!limpio) return null;
  const parsed = Number(limpio);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

