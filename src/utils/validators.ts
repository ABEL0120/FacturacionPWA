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

export interface PasswordReglaResultado {
  longitudValida: boolean;
  tieneMayuscula: boolean;
  tieneMinuscula: boolean;
  tieneNumero: boolean;
  tieneEspecial: boolean;
  esValida: boolean;
}

export const evaluarPasswordRegistro = (
  value: string,
): PasswordReglaResultado => {
  const longitudValida = value.length >= 8 && value.length <= 13;
  const tieneMayuscula = /[A-Z]/.test(value);
  const tieneMinuscula = /[a-z]/.test(value);
  const tieneNumero = /[0-9]/.test(value);
  const tieneEspecial = /[#*$!@&%]/.test(value);

  return {
    longitudValida,
    tieneMayuscula,
    tieneMinuscula,
    tieneNumero,
    tieneEspecial,
    esValida:
      longitudValida &&
      tieneMayuscula &&
      tieneMinuscula &&
      tieneNumero &&
      tieneEspecial,
  };
};

export const esPasswordRegistroValida = (value: string): boolean =>
  evaluarPasswordRegistro(value).esValida;

export const parseEnteroPositivo = (value: string): number | null => {
  const limpio = value.trim();
  if (!limpio) return null;
  const parsed = Number(limpio);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

export const soloDecimal = (value: string): string => {
  const limpio = value.replace(/[^0-9.]/g, "");
  const partes = limpio.split(".");
  if (partes.length <= 1) return limpio;
  return `${partes[0]}.${partes.slice(1).join("").slice(0, 2)}`;
};

export const parseImportePositivo = (value: string): number | null => {
  const limpio = value.trim();
  if (!limpio || !/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  const parsed = Number(limpio);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

