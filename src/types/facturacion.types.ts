export type PasoFacturacion = 1 | 2 | 3 | 4;

export interface CatalogoItemDto {
  numero: string;
  descripcion: string;
  apFisica?: string | null;
  apMoral?: string | null;
}

export interface MonedaCatalogoDto {
  numero: string;
  descripcion: string;
  abreviatura: string;
  decimales: number;
}

export interface ClienteRfcItemDto {
  numeroCliente: number;
  rfc: string;
  razonSocial: string;
}

export interface ClienteFiscalDto {
  numeroCliente: number;
  razonSocial: string;
  rfc: string;
  direccion: string;
  numeroExt: string;
  numeroInt: string;
  colonia: string;
  ciudad: string;
  delegacion: string;
  estado: string;
  codigoPostal: string;
  telefono: string;
  mail: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
  validadoReceptor: string;
}

export interface FactTicketInitResponseDto {
  esPrueba: boolean;
  emisorRfc: string;
  emisorRazonSocial: string;
  emisorCp: string;
  emisorRegimenFiscal: string;
  rfcsCliente: ClienteRfcItemDto[];
  clienteSeleccionado: ClienteFiscalDto | null;
  monedas: MonedaCatalogoDto[];
  regimenesFiscales: CatalogoItemDto[];
  usosCfdi: CatalogoItemDto[];
  formasPago: CatalogoItemDto[];
  estadosMexico: CatalogoItemDto[];
}

export interface ConsultarTicketRequestDto {
  folio: string;
  serie?: string;
  total?: number | null;
  transaccion?: number | null;
  numeroCliente?: number | null;
  mailUsuario?: string | null;
}

export interface ValidarTicketsRequestDto {
  tickets: ConsultarTicketRequestDto[];
  numeroCliente?: number | null;
  mailUsuario?: string | null;
}

export interface TicketPartidaDto {
  numero: number;
  orden: number;
  folio: string;
  transaccion: number;
  sucursal: number;
  sucursalNombre: string;
  serieFactura: string;
  fecha: string;
  turno: number;
  tipo: string;
  producto: number;
  descripcion: string;
  claveProdServSat: string;
  claveProdServDesc: string;
  unidadMedidaSat: string;
  unidadMedida: string;
  exento: string;
  cantidad: number;
  precio: number;
  porcentajeIva: number;
  precioSinIva: number;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  totalFacturar: number;
  baseIva16: number;
  baseIva0: number;
  uuidGlobal: string;
  esGlobal: string;
}

export interface TicketConsultaResponseDto {
  folio: string;
  serie: string;
  serieFacturaSucursal: string;
  transaccion: number;
  sucursal: number;
  sucursalNombre: string;
  fecha: string;
  formaPagoSat: string;
  formaPagoDescripcion: string;
  requiereNotaCredito: boolean;
  uuidGlobal: string;
  subtotal: number;
  iva: number;
  descuento: number;
  total: number;
  partidas: TicketPartidaDto[];
}

export interface ValidarTicketsResponseDto {
  sucursal: number;
  sucursalNombre: string;
  serieFactura: string;
  formaPagoSat: string;
  formaPagoDescripcion: string;
  requiereNotaCredito: boolean;
  subtotalTotal: number;
  ivaTotal: number;
  descuentoTotal: number;
  granTotal: number;
  partidas: TicketPartidaDto[];
}

export interface BuscarRfcResponseDto {
  existe: boolean;
  requiereRegistro: boolean;
  rfc: string;
  cliente: ClienteFiscalDto | null;
}

export interface RegistrarRfcRequestDto {
  numeroCliente: number;
  rfc: string;
  razonSocial: string;
  direccion: string;
  numeroExt: string;
  numeroInt: string;
  colonia: string;
  delegacion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
  telefono: string;
  mail: string;
}

export interface TicketSeleccionadoDto {
  folio: string;
  serie?: string;
  total?: number | null;
  transaccion?: number | null;
}

export interface GenerarFacturaTicketRequestDto {
  numeroCliente: number;
  rfc: string;
  regimenFiscal: string;
  usoCfdi: string;
  formaPago?: string | null;
  moneda: string;
  tipoCambio: number;
  mail?: string | null;
  razonSocial?: string | null;
  codigoPostal?: string | null;
  direccion?: string | null;
  numeroExt?: string | null;
  numeroInt?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  delegacion?: string | null;
  estado?: string | null;
  tickets: TicketSeleccionadoDto[];
}

export interface EmisorCfdiDto {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  regimenFiscalDesc: string;
  lugarExpedicion: string;
}

export interface ReceptorCfdiDto {
  numeroCliente: number;
  rfc: string;
  nombre: string;
  domicilioFiscalReceptor: string;
  regimenFiscalReceptor: string;
  regimenFiscalReceptorDesc: string;
  usoCfdi: string;
  usoCfdiDesc: string;
  mail: string;
}

export interface ConceptoCfdiDto {
  secuencia: number;
  claveProdServ: string;
  noIdentificacion: string;
  cantidad: number;
  claveUnidad: string;
  unidad: string;
  descripcion: string;
  valorUnitario: number;
  importe: number;
  descuento: number;
  objetoImp: string;
}

export interface TrasladoCfdiDto {
  secuencia: number;
  noIdentificacion: string;
  base: number;
  impuesto: string;
  tipoFactor: string;
  tasaOCuota: number;
  importe: number;
}

export interface NotaCreditoPreviaDto {
  serie: string;
  folioTentativo: number;
  tipoDeComprobante: string;
  tipoRelacion: string;
  uuidsRelacionados: string;
  subtotal: number;
  total: number;
  cadenaOriginal: string;
  xmlSinTimbrar: string;
}

export interface FacturaTicketResponseDto {
  timbrado: boolean;
  estadoTimbrado: string;
  firmaOmitida: boolean;
  esPrueba: boolean;
  serie: string;
  folioTentativo: number;
  fechaEmision: string;
  formaPago: string;
  formaPagoDescripcion: string;
  metodoPago: string;
  moneda: string;
  tipoCambio: number;
  tipoDeComprobante: string;
  exportacion: string;
  lugarExpedicion: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  importeConLetra: string;
  emisor: EmisorCfdiDto;
  receptor: ReceptorCfdiDto;
  conceptos: ConceptoCfdiDto[];
  traslados: TrasladoCfdiDto[];
  cadenaOriginal: string;
  xmlSinTimbrar: string;
  notaCreditoPrevia: NotaCreditoPreviaDto | null;
}

export interface TicketResumenInfo {
  sucursalNombre: string;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  partidas: TicketPartidaDto[];
  requiereNotaCredito: boolean;
  formaPagoSat: string;
  formaPagoDesc: string;
  uuidGlobal: string;
  fecha: string;
}

export interface CatalogosSatData {
  regimenes: CatalogoItemDto[];
  usosCfdi: CatalogoItemDto[];
  formasPago: CatalogoItemDto[];
  estados: CatalogoItemDto[];
}

export interface CatalogosFactTicketData extends CatalogosSatData {
  monedas: MonedaCatalogoDto[];
}

