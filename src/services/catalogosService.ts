import { facturacionApi } from "../api/facturacionApi";
import { ApiResponse } from "../types/auth.types";
import {
  CatalogoItemDto,
  CatalogosFactTicketData,
  CatalogosSatData,
  MonedaCatalogoDto,
} from "../types/facturacion.types";

export const DEFAULT_REGIMENES_FISCALES: CatalogoItemDto[] = [
  { numero: "601", descripcion: "General de Ley Personas Morales" },
  { numero: "603", descripcion: "Personas Morales con Fines no Lucrativos" },
  { numero: "605", descripcion: "Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { numero: "606", descripcion: "Arrendamiento" },
  { numero: "607", descripcion: "Régimen de Enajenación o Adquisición de Bienes" },
  { numero: "608", descripcion: "Demás ingresos" },
  { numero: "610", descripcion: "Residentes en el Extranjero sin Establecimiento Permanente en México" },
  { numero: "611", descripcion: "Ingresos por Dividendos (socios y accionistas)" },
  { numero: "612", descripcion: "Personas Físicas con Actividades Empresariales y Profesionales" },
  { numero: "614", descripcion: "Ingresos por intereses" },
  { numero: "615", descripcion: "Régimen de los ingresos por obtención de premios" },
  { numero: "616", descripcion: "Sin obligaciones fiscales" },
  { numero: "620", descripcion: "Sociedades Cooperativas de Producción que optan por diferir sus ingresos" },
  { numero: "621", descripcion: "Incorporación Fiscal" },
  { numero: "622", descripcion: "Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras" },
  { numero: "623", descripcion: "Opcional para Grupos de Sociedades" },
  { numero: "624", descripcion: "Coordinados" },
  { numero: "625", descripcion: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { numero: "626", descripcion: "Régimen Simplificado de Confianza" },
  { numero: "627", descripcion: "Sin tipo de sociedad" },
];

export const DEFAULT_USOS_CFDI: CatalogoItemDto[] = [
  { numero: "G01", descripcion: "Adquisición de mercancías." },
  { numero: "G03", descripcion: "Gastos en general." },
  { numero: "S01", descripcion: "Sin Efectos Fiscales" },
];

export const DEFAULT_FORMAS_PAGO: CatalogoItemDto[] = [
  { numero: "01", descripcion: "Efectivo" },
  { numero: "02", descripcion: "Cheque nominativo" },
  { numero: "03", descripcion: "Transferencia electrónica de fondos" },
  { numero: "04", descripcion: "Tarjeta de crédito" },
  { numero: "28", descripcion: "Tarjeta de débito" },
  { numero: "99", descripcion: "Por definir" },
];

export const DEFAULT_ESTADOS: CatalogoItemDto[] = [
  { numero: "AGU", descripcion: "Aguascalientes" },
  { numero: "BCN", descripcion: "Baja California" },
  { numero: "BCS", descripcion: "Baja California Sur" },
  { numero: "CAM", descripcion: "Campeche" },
  { numero: "CHP", descripcion: "Chiapas" },
  { numero: "CHH", descripcion: "Chihuahua" },
  { numero: "CMX", descripcion: "Ciudad de México" },
  { numero: "COA", descripcion: "Coahuila" },
  { numero: "COL", descripcion: "Colima" },
  { numero: "DUR", descripcion: "Durango" },
  { numero: "MEX", descripcion: "Estado de México" },
  { numero: "GUA", descripcion: "Guanajuato" },
  { numero: "GRO", descripcion: "Guerrero" },
  { numero: "HID", descripcion: "Hidalgo" },
  { numero: "JAL", descripcion: "Jalisco" },
  { numero: "MIC", descripcion: "Michoacán" },
  { numero: "MOR", descripcion: "Morelos" },
  { numero: "NAY", descripcion: "Nayarit" },
  { numero: "NLE", descripcion: "Nuevo León" },
  { numero: "OAX", descripcion: "Oaxaca" },
  { numero: "PUE", descripcion: "Puebla" },
  { numero: "QUE", descripcion: "Querétaro" },
  { numero: "ROO", descripcion: "Quintana Roo" },
  { numero: "SLP", descripcion: "San Luis Potosí" },
  { numero: "SIN", descripcion: "Sinaloa" },
  { numero: "SON", descripcion: "Sonora" },
  { numero: "TAB", descripcion: "Tabasco" },
  { numero: "TAM", descripcion: "Tamaulipas" },
  { numero: "TLA", descripcion: "Tlaxcala" },
  { numero: "VER", descripcion: "Veracruz" },
  { numero: "YUC", descripcion: "Yucatán" },
  { numero: "ZAC", descripcion: "Zacatecas" },
];

export const DEFAULT_MONEDAS: MonedaCatalogoDto[] = [
  { numero: "MXN", descripcion: "Peso Mexicano", abreviatura: "MXN", decimales: 2 },
  { numero: "USD", descripcion: "Dólar estadounidense", abreviatura: "USD", decimales: 2 },
];

const resolveSettledCatalog = <T>(
  result: PromiseSettledResult<ApiResponse<T[]>>,
  fallback: T[],
  filterFn?: (item: T) => boolean,
): T[] => {
  if (
    result.status === "fulfilled" &&
    result.value?.success &&
    Array.isArray(result.value.data) &&
    result.value.data.length > 0
  ) {
    return filterFn ? result.value.data.filter(filterFn) : result.value.data;
  }
  return fallback;
};

const maxThreeCharCode = (item: CatalogoItemDto): boolean =>
  item.numero.trim().length <= 3;

let cachedCatalogos: CatalogosSatData | null = null;

export const catalogosService = {
  obtenerCatalogosSat: async (): Promise<CatalogosSatData> => {
    if (cachedCatalogos) {
      return cachedCatalogos;
    }

    const [regRes, usoRes, fpRes, estRes] = await Promise.allSettled([
      facturacionApi.obtenerRegimenesFiscales(),
      facturacionApi.obtenerUsosCfdi(),
      facturacionApi.obtenerFormasPago(),
      facturacionApi.obtenerEstados(),
    ]);

    const result: CatalogosSatData = {
      regimenes: resolveSettledCatalog(regRes, DEFAULT_REGIMENES_FISCALES, maxThreeCharCode),
      usosCfdi: resolveSettledCatalog(usoRes, DEFAULT_USOS_CFDI, maxThreeCharCode),
      formasPago: resolveSettledCatalog(fpRes, DEFAULT_FORMAS_PAGO, maxThreeCharCode),
      estados: resolveSettledCatalog(estRes, DEFAULT_ESTADOS),
    };

    const allLoadedFromApi = [regRes, usoRes, fpRes, estRes].every(
      (r) => r.status === "fulfilled",
    );
    if (allLoadedFromApi) {
      cachedCatalogos = result;
    }

    return result;
  },

  obtenerCatalogosFactTicketFallback: async (): Promise<CatalogosFactTicketData> => {
    const [regRes, usoRes, fpRes, estRes, monRes] = await Promise.allSettled([
      facturacionApi.obtenerRegimenesFiscales(),
      facturacionApi.obtenerUsosCfdi(),
      facturacionApi.obtenerFormasPago(),
      facturacionApi.obtenerEstados(),
      facturacionApi.obtenerMonedas(),
    ]);

    return {
      regimenes: resolveSettledCatalog(regRes, DEFAULT_REGIMENES_FISCALES),
      usosCfdi: resolveSettledCatalog(usoRes, DEFAULT_USOS_CFDI),
      formasPago: resolveSettledCatalog(fpRes, DEFAULT_FORMAS_PAGO),
      estados: resolveSettledCatalog(estRes, DEFAULT_ESTADOS),
      monedas: resolveSettledCatalog(monRes, DEFAULT_MONEDAS),
    };
  },
};
