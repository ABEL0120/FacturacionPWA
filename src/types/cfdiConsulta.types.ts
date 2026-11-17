export interface CfdiConsultaItemDto {
  idCfdi: string;
  serie: string;
  folio: number;
  rfcReceptor: string;
  subTotal: number;
  ivaImporte: number;
  total: number;
  fechaTimbre: string;
  fecha: string;
  orden: number;
  sucursal: number;
  sucursalDesc: string;
  uuid: string;
}

export interface EnviarCorreoCfdiRequestDto {
  numeroCliente: number;
  correoDestino?: string | null;
}

export interface CfdiArchivoBlobResult {
  blob: Blob;
  fileName: string;
}
