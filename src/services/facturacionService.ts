import { extractApiErrorMessage } from "../api/apiClient";
import {
  BuscarRfcResponseDto,
  ClienteFiscalDto,
  ClienteRfcItemDto,
  ConsultarTicketRequestDto,
  facturacionApi,
  FactTicketInitResponseDto,
  FacturaTicketResponseDto,
  GenerarFacturaTicketRequestDto,
  RegistrarRfcRequestDto,
  TicketConsultaResponseDto,
  ValidarTicketsRequestDto,
  ValidarTicketsResponseDto,
} from "../api/facturacionApi";

const escapeHtml = (value: string): string =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const facturacionService = {
  inicializar: async (
    numeroCliente: number,
    rfc?: string,
  ): Promise<FactTicketInitResponseDto> => {
    try {
      const response = await facturacionApi.inicializarFactTicket(numeroCliente, rfc);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No fue posible inicializar el módulo.");
    } catch (err: any) {
      throw new Error(
        extractApiErrorMessage(err, "No fue posible inicializar el módulo de facturación."),
      );
    }
  },

  consultarTicket: async (
    dto: ConsultarTicketRequestDto,
  ): Promise<TicketConsultaResponseDto> => {
    try {
      const response = await facturacionApi.consultarTicket(dto);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No se pudo consultar el ticket.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al consultar el ticket."));
    }
  },

  validarTickets: async (
    dto: ValidarTicketsRequestDto,
  ): Promise<ValidarTicketsResponseDto> => {
    try {
      const response = await facturacionApi.validarTickets(dto);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No se pudieron validar los tickets.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al validar los tickets."));
    }
  },

  buscarRfc: async (
    rfc: string,
    numeroCliente?: number | null,
  ): Promise<BuscarRfcResponseDto> => {
    try {
      const response = await facturacionApi.buscarRfc(rfc, numeroCliente);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No se pudo consultar el RFC.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al consultar el RFC."));
    }
  },

  listarRfcsCliente: async (numeroCliente: number): Promise<ClienteRfcItemDto[]> => {
    try {
      const response = await facturacionApi.listarRfcsCliente(numeroCliente);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error(response.message || "No se pudieron cargar los RFCs del cliente.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al obtener RFCs del cliente."));
    }
  },

  registrarRfc: async (dto: RegistrarRfcRequestDto): Promise<ClienteFiscalDto> => {
    try {
      const response = await facturacionApi.registrarRfc(dto);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No fue posible registrar el RFC.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "No fue posible guardar el registro fiscal."));
    }
  },

  vistaPrevia: async (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<FacturaTicketResponseDto> => {
    try {
      const response = await facturacionApi.vistaPreviaFactura(dto);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No fue posible generar la vista previa.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al generar vista previa de factura."));
    }
  },

  generarFactura: async (
    dto: GenerarFacturaTicketRequestDto,
  ): Promise<FacturaTicketResponseDto> => {
    try {
      const response = await facturacionApi.generarFactura(dto);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || "No fue posible generar la estructura CFDI 4.0.");
    } catch (err: any) {
      throw new Error(extractApiErrorMessage(err, "Error al generar la factura."));
    }
  },

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
    if (!printWindow) return;

    const esVistaPrevia = factura.estadoTimbrado === "VISTA_PREVIA";
    const estatusTexto = factura.timbrado
      ? "CFDI 4.0 TIMBRADO"
      : esVistaPrevia
        ? "VISTA PREVIA CFDI 4.0 — PENDIENTE DE TIMBRADO"
        : "PRE-FACTURA CFDI 4.0 — PENDIENTE DE FIRMA Y TIMBRADO";

    const conceptosRows = (factura.conceptos || [])
      .map(
        (c) => `
      <tr>
        <td>${escapeHtml(c.claveProdServ)}</td>
        <td>${Number(c.cantidad).toFixed(2)}</td>
        <td>${escapeHtml(c.claveUnidad)} (${escapeHtml(c.unidad)})</td>
        <td>${escapeHtml(c.descripcion)}</td>
        <td style="text-align: right;">$${Number(c.valorUnitario).toFixed(2)}</td>
        <td style="text-align: right;">$${Number(c.descuento).toFixed(2)}</td>
        <td style="text-align: right;"><strong>$${Number(c.importe).toFixed(2)}</strong></td>
      </tr>`,
      )
      .join("");

    const ncSection = factura.notaCreditoPrevia
      ? `<div class="card" style="margin-top: 12px; border-color: #f59e0b; background: #fffbeb;">
          <div class="card-title" style="color: #92400e;">Nota de Crédito Previa (Ticket proveniente de Factura Global)</div>
          <div>Serie y Folio Tentativo: <strong>${escapeHtml(factura.notaCreditoPrevia.serie)}-${factura.notaCreditoPrevia.folioTentativo}</strong> | Tipo Comprobante: ${escapeHtml(factura.notaCreditoPrevia.tipoDeComprobante)} | Relación SAT: ${escapeHtml(factura.notaCreditoPrevia.tipoRelacion)}</div>
          <div>UUIDs Relacionados: <span style="word-break: break-all;">${escapeHtml(factura.notaCreditoPrevia.uuidsRelacionados)}</span></div>
          <div>Subtotal: $${Number(factura.notaCreditoPrevia.subtotal).toFixed(2)} | Total: <strong>$${Number(factura.notaCreditoPrevia.total).toFixed(2)}</strong></div>
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Pre-Factura ${escapeHtml(factura.serie)}-${factura.folioTentativo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 24px; font-size: 12px; line-height: 1.45; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 16px; border-bottom: 2px solid #010080; }
    .brand { font-size: 22px; font-weight: 900; color: #010080; margin: 0; }
    .subbrand { font-size: 11px; color: #0b5ed7; font-weight: 700; text-transform: uppercase; }
    .status-banner { margin: 12px 0; padding: 10px 14px; border-radius: 8px; background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; font-weight: 800; font-size: 11px; }
    .prueba-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #fef3c7; color: #92400e; border: 1px solid #f59e0b; font-weight: 800; font-size: 10px; margin-left: 6px; }
    .folio-box { text-align: right; background: #eef5ff; padding: 10px 14px; border-radius: 8px; border: 1px solid #b6d4fe; min-width: 190px; }
    .folio-box strong { font-size: 15px; color: #010080; display: block; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #010080; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0; }
    th { background: #010080; color: white; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    .totals { width: 290px; margin-left: auto; margin-top: 8px; }
    .totals table td { border: none; padding: 4px 8px; }
    .total-row { font-size: 14px; font-weight: 900; color: #010080; background: #eef5ff; }
    .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #475569; word-break: break-all; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; background: #0b5ed7; color: white; font-size: 10px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 16px; text-align: right;">
    <button onclick="window.print()" style="background:#010080; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:bold; cursor:pointer;">Imprimir / Guardar como PDF</button>
  </div>
  <div class="header">
    <div>
      <h1 class="brand">${escapeHtml(factura.emisor.nombre || "EMISOR CFDI 4.0")}</h1>
      <div class="subbrand">Comprobante Fiscal Digital CFDI 4.0</div>
      <div style="font-size: 11px; margin-top: 4px; color: #475569;">
        RFC Emisor: <strong>${escapeHtml(factura.emisor.rfc)}</strong><br/>
        Régimen Fiscal: ${escapeHtml(factura.emisor.regimenFiscal)} - ${escapeHtml(factura.emisor.regimenFiscalDesc)}<br/>
        Lugar de Expedición: ${escapeHtml(factura.lugarExpedicion)}
      </div>
    </div>
    <div class="folio-box">
      <span class="badge">TIPO ${escapeHtml(factura.tipoDeComprobante)}</span>
      ${factura.esPrueba ? '<span class="prueba-badge">PRUEBA</span>' : ""}
      <strong>${escapeHtml(factura.serie)}-${factura.folioTentativo}</strong>
      <div style="font-size: 10px; color: #475569; margin-top: 4px;">Estado: ${escapeHtml(factura.estadoTimbrado)}</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Emisión: ${escapeHtml(factura.fechaEmision)}</div>
    </div>
  </div>

  <div class="status-banner">${escapeHtml(estatusTexto)}</div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Datos del Receptor</div>
      <div><strong>${escapeHtml(factura.receptor.nombre)}</strong></div>
      <div>RFC: <strong>${escapeHtml(factura.receptor.rfc)}</strong></div>
      <div>Domicilio Fiscal (CP): ${escapeHtml(factura.receptor.domicilioFiscalReceptor)}</div>
      <div>Régimen Fiscal: ${escapeHtml(factura.receptor.regimenFiscalReceptor)} - ${escapeHtml(factura.receptor.regimenFiscalReceptorDesc)}</div>
      <div>Uso de CFDI: ${escapeHtml(factura.receptor.usoCfdi)} - ${escapeHtml(factura.receptor.usoCfdiDesc)}</div>
      ${factura.receptor.mail ? `<div>Correo: ${escapeHtml(factura.receptor.mail)}</div>` : ""}
    </div>
    <div class="card">
      <div class="card-title">Datos Generales del Comprobante</div>
      <div>Folio Tentativo: <strong>${escapeHtml(factura.serie)}-${factura.folioTentativo}</strong></div>
      <div>Forma de Pago: ${escapeHtml(factura.formaPago)} - ${escapeHtml(factura.formaPagoDescripcion)}</div>
      <div>Método de Pago: ${escapeHtml(factura.metodoPago)}</div>
      <div>Moneda: ${escapeHtml(factura.moneda)} (TC: ${Number(factura.tipoCambio).toFixed(4)})</div>
      <div>Exportación: ${escapeHtml(factura.exportacion)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Clave SAT</th>
        <th>Cant.</th>
        <th>Unidad</th>
        <th>Descripción</th>
        <th style="text-align: right;">Valor Unit.</th>
        <th style="text-align: right;">Desc.</th>
        <th style="text-align: right;">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${conceptosRows}
    </tbody>
  </table>

  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
    <div class="card" style="flex: 1;">
      <div class="card-title">Importe con Letra</div>
      <div><strong>${escapeHtml(factura.importeConLetra)}</strong></div>
    </div>
    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">$${Number(factura.subtotal).toFixed(2)}</td>
        </tr>
        ${
          factura.descuento > 0
            ? `<tr><td>Descuento:</td><td style="text-align: right;">-$${Number(factura.descuento).toFixed(2)}</td></tr>`
            : ""
        }
        <tr>
          <td>IVA Trasladado:</td>
          <td style="text-align: right;">$${Number(factura.iva).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL:</td>
          <td style="text-align: right;">$${Number(factura.total).toFixed(2)} ${escapeHtml(factura.moneda)}</td>
        </tr>
      </table>
    </div>
  </div>

  ${ncSection}

  <div class="footer">
    <div><strong>Cadena Original CFDI 4.0 (Pre-Timbrado):</strong></div>
    <div style="margin-top: 4px;">${escapeHtml(factura.cadenaOriginal)}</div>
    <div style="margin-top: 10px; text-align: center; font-weight: bold;">
      Documento preliminar sin timbre fiscal digital (en espera de firma y datos del timbrador PAC).
    </div>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  },
};

export default facturacionService;
