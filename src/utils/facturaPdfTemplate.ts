import { FacturaTicketResponseDto } from "../types/facturacion.types";
import {
  escapeHtml,
  formatEstatusCfdi,
  formatExportacion,
  formatFechaComprobante,
  formatMetodoPago,
  formatTipoComprobante,
} from "./formatters";

export const buildFacturaPdfHtml = (
  factura: FacturaTicketResponseDto,
): string => {
  const esVistaPrevia = factura.estadoTimbrado === "VISTA_PREVIA";
  const folioCompleto = `${factura.serie}-${factura.folioTentativo}`;
  const encabezadoFolio = factura.timbrado
    ? "FACTURA CFDI 4.0"
    : esVistaPrevia
      ? "VISTA PREVIA CFDI 4.0"
      : "PRE-FACTURA CFDI 4.0";

  const estatusBanner = factura.timbrado
    ? "COMPROBANTE FISCAL DIGITAL TIMBRADO ANTE EL SAT"
    : esVistaPrevia
      ? "VISTA PREVIA INFORMATIVA — DOCUMENTO PRELIMINAR SIN TIMBRE FISCAL DIGITAL"
      : "PRE-FACTURA EN ESPERA DE FIRMA Y TIMBRADO PAC — SIN VALIDEZ FISCAL DEFINITIVA";

  const conceptosRows = (factura.conceptos || [])
    .map(
      (c, idx) => `
      <tr class="${idx % 2 === 1 ? "row-alt" : ""}">
        <td class="mono">${escapeHtml(c.claveProdServ)}</td>
        <td class="num">${Number(c.cantidad).toFixed(2)}</td>
        <td>${escapeHtml(c.claveUnidad)} · ${escapeHtml(c.unidad)}</td>
        <td class="desc">${escapeHtml(c.descripcion)}</td>
        <td class="num">$${Number(c.valorUnitario).toFixed(2)}</td>
        <td class="num">$${Number(c.descuento).toFixed(2)}</td>
        <td class="num strong">$${Number(c.importe).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const ncSection = factura.notaCreditoPrevia
    ? `<div class="box" style="margin-top: 12px;">
        <div class="box-head">CFDI Relacionado — Nota de Crédito Previa (Factura Global)</div>
        <div class="box-body nc-grid">
          <div><span class="lbl">Folio Tentativo:</span> <strong>${escapeHtml(factura.notaCreditoPrevia.serie)}-${factura.notaCreditoPrevia.folioTentativo}</strong></div>
          <div><span class="lbl">Tipo Relación SAT:</span> ${escapeHtml(factura.notaCreditoPrevia.tipoRelacion)}</div>
          <div><span class="lbl">Importe Total:</span> <strong>$${Number(factura.notaCreditoPrevia.total).toFixed(2)} ${escapeHtml(factura.moneda)}</strong></div>
          <div class="nc-full"><span class="lbl">UUID Relacionado:</span> <span class="mono">${escapeHtml(factura.notaCreditoPrevia.uuidsRelacionados)}</span></div>
        </div>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Comprobante ${escapeHtml(folioCompleto)}</title>
  <style>
    @page {
      size: letter;
      margin: 12mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 18px;
      font-size: 11px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet-header {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      gap: 16px;
      padding-bottom: 14px;
      border-bottom: 2px solid #010080;
    }
    .emitter { flex: 1; min-width: 0; }
    .emitter-eyebrow {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #0b5ed7;
      margin-bottom: 3px;
    }
    .emitter-name {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 6px 0;
      line-height: 1.2;
    }
    .meta-list { font-size: 10.5px; color: #334155; }
    .meta-list div { margin-bottom: 2px; }
    .lbl { color: #64748b; font-weight: 600; }
    .folio-card {
      width: 225px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #ffffff;
      flex-shrink: 0;
    }
    .folio-head {
      background: #010080;
      color: #ffffff;
      text-align: center;
      padding: 6px 10px;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .folio-body {
      padding: 10px 12px;
      text-align: right;
    }
    .folio-num {
      font-size: 16px;
      font-weight: 900;
      color: #010080;
      margin-bottom: 4px;
    }
    .folio-meta {
      font-size: 10px;
      color: #475569;
      line-height: 1.45;
    }
    .test-chip {
      display: inline-block;
      margin-top: 5px;
      padding: 2px 7px;
      border-radius: 4px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    .status-strip {
      margin: 12px 0;
      padding: 8px 12px;
      border-radius: 6px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e3a8a;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-align: center;
    }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 12px 0;
    }
    .box {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #ffffff;
    }
    .box-head {
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 10px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #010080;
    }
    .box-body {
      padding: 9px 10px;
      font-size: 10.5px;
      color: #1e293b;
      line-height: 1.5;
    }
    .concepts-wrap {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin: 12px 0;
    }
    table.concepts {
      width: 100%;
      border-collapse: collapse;
    }
    table.concepts th {
      background: #010080;
      color: #ffffff;
      padding: 7px 8px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
    }
    table.concepts td {
      padding: 7px 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10.5px;
      color: #0f172a;
      vertical-align: top;
    }
    table.concepts tr:last-child td { border-bottom: none; }
    table.concepts tr.row-alt td { background: #f8fafc; }
    .num { text-align: right !important; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .strong { font-weight: 800; }
    .desc { font-weight: 600; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 9.5px; }
    .bottom-grid {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      gap: 12px;
      margin-top: 12px;
    }
    .amount-words {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      padding: 10px 12px;
    }
    .totals-box {
      width: 260px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 6px 10px;
      font-size: 10.5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .totals-final td {
      background: #010080;
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      border-bottom: none;
      padding: 8px 10px;
    }
    .nc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
    }
    .nc-full { grid-column: 1 / -1; word-break: break-all; }
    .chain-box {
      margin-top: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      padding: 9px 10px;
    }
    .chain-title {
      font-size: 9px;
      font-weight: 800;
      color: #010080;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }
    .chain-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8.5px;
      color: #334155;
      word-break: break-all;
      line-height: 1.4;
    }
    .legal-footer {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      text-align: center;
      font-size: 9px;
      color: #64748b;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet-header">
    <div class="emitter">
      <div class="emitter-eyebrow">Comprobante Fiscal Digital por Internet • CFDI 4.0</div>
      <h1 class="emitter-name">${escapeHtml(factura.emisor.nombre || "EMISOR CFDI 4.0")}</h1>
      <div class="meta-list">
        <div><span class="lbl">RFC Emisor:</span> <strong>${escapeHtml(factura.emisor.rfc)}</strong></div>
        <div><span class="lbl">Régimen Fiscal:</span> ${escapeHtml(factura.emisor.regimenFiscal)} - ${escapeHtml(factura.emisor.regimenFiscalDesc)}</div>
        <div><span class="lbl">Lugar de Expedición:</span> CP ${escapeHtml(factura.lugarExpedicion)}</div>
      </div>
    </div>

    <div class="folio-card">
      <div class="folio-head">${escapeHtml(encabezadoFolio)}</div>
      <div class="folio-body">
        <div class="folio-num">${escapeHtml(folioCompleto)}</div>
        <div class="folio-meta">
          <div><span class="lbl">Tipo:</span> ${escapeHtml(formatTipoComprobante(factura.tipoDeComprobante))}</div>
          <div><span class="lbl">Emisión:</span> ${escapeHtml(formatFechaComprobante(factura.fechaEmision))}</div>
          <div><span class="lbl">Estatus:</span> ${escapeHtml(formatEstatusCfdi(factura.estadoTimbrado, factura.timbrado))}</div>
        </div>
        ${factura.esPrueba ? '<span class="test-chip">AMBIENTE DE PRUEBA</span>' : ""}
      </div>
    </div>
  </div>

  <div class="status-strip">${escapeHtml(estatusBanner)}</div>

  <div class="two-col">
    <div class="box">
      <div class="box-head">Datos del Receptor</div>
      <div class="box-body">
        <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px;">${escapeHtml(factura.receptor.nombre)}</div>
        <div><span class="lbl">RFC:</span> <strong>${escapeHtml(factura.receptor.rfc)}</strong> · <span class="lbl">CP:</span> ${escapeHtml(factura.receptor.domicilioFiscalReceptor)}</div>
        <div><span class="lbl">Régimen:</span> ${escapeHtml(factura.receptor.regimenFiscalReceptor)} - ${escapeHtml(factura.receptor.regimenFiscalReceptorDesc)}</div>
        <div><span class="lbl">Uso CFDI:</span> ${escapeHtml(factura.receptor.usoCfdi)} - ${escapeHtml(factura.receptor.usoCfdiDesc)}</div>
        ${factura.receptor.mail ? `<div><span class="lbl">Correo:</span> ${escapeHtml(factura.receptor.mail)}</div>` : ""}
      </div>
    </div>

    <div class="box">
      <div class="box-head">Datos de Pago y Comprobante</div>
      <div class="box-body">
        <div><span class="lbl">Forma de Pago:</span> ${escapeHtml(factura.formaPago)} - ${escapeHtml(factura.formaPagoDescripcion)}</div>
        <div><span class="lbl">Método de Pago:</span> ${escapeHtml(formatMetodoPago(factura.metodoPago))}</div>
        <div><span class="lbl">Moneda / T.C.:</span> ${escapeHtml(factura.moneda)} (${Number(factura.tipoCambio).toFixed(4)})</div>
        <div><span class="lbl">Exportación:</span> ${escapeHtml(formatExportacion(factura.exportacion))}</div>
      </div>
    </div>
  </div>

  <div class="concepts-wrap">
    <table class="concepts">
      <thead>
        <tr>
          <th>Clave SAT</th>
          <th class="num">Cant.</th>
          <th>Unidad</th>
          <th>Descripción</th>
          <th class="num">V. Unitario</th>
          <th class="num">Desc.</th>
          <th class="num">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${conceptosRows}
      </tbody>
    </table>
  </div>

  <div class="bottom-grid">
    <div class="amount-words">
      <div class="chain-title" style="margin-bottom: 4px;">Importe con Letra</div>
      <div style="font-weight: 800; font-size: 10.5px; color: #0f172a;">${escapeHtml(factura.importeConLetra)}</div>
    </div>

    <div class="totals-box">
      <table class="totals-table">
        <tr>
          <td class="lbl">Subtotal</td>
          <td class="num strong">$${Number(factura.subtotal).toFixed(2)}</td>
        </tr>
        ${
          factura.descuento > 0
            ? `<tr><td class="lbl">Descuento</td><td class="num strong">-$${Number(factura.descuento).toFixed(2)}</td></tr>`
            : ""
        }
        <tr>
          <td class="lbl">IVA Trasladado</td>
          <td class="num strong">$${Number(factura.iva).toFixed(2)}</td>
        </tr>
        <tr class="totals-final">
          <td>TOTAL</td>
          <td class="num">$${Number(factura.total).toFixed(2)} ${escapeHtml(factura.moneda)}</td>
        </tr>
      </table>
    </div>
  </div>

  ${ncSection}

  <div class="chain-box">
    <div class="chain-title">Cadena Original del Complemento (Pre-Timbrado)</div>
    <div class="chain-text">${escapeHtml(factura.cadenaOriginal)}</div>
  </div>

  <div class="legal-footer">
    Representación impresa preliminar de un CFDI 4.0 — Generado por Ventio Facturación.
  </div>
</body>
</html>`;
};

export const imprimirHtmlEnPagina = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");

  let cleaned = false;
  let fallbackTimer = 0;

  const removeIframe = () => {
    if (cleaned) return;
    cleaned = true;
    window.clearTimeout(fallbackTimer);
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  };

  const cleanupAfterPrint = () => {
    window.setTimeout(removeIframe, 600);
  };

  fallbackTimer = window.setTimeout(removeIframe, 120000);

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) {
      removeIframe();
      return;
    }
    win.addEventListener("afterprint", cleanupAfterPrint, { once: true });
    window.setTimeout(() => {
      win.focus();
      win.print();
    }, 80);
  };

  iframe.srcdoc = html;
  document.body.appendChild(iframe);
};
