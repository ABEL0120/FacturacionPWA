import type { jsPDF } from "jspdf";
import { FacturaTicketResponseDto } from "../types/facturacion.types";
import {
  formatEstatusCfdi,
  formatExportacion,
  formatFechaComprobante,
  formatMetodoPago,
  formatTipoComprobante,
} from "./formatters";

type RgbColor = [number, number, number];

const NAVY: RgbColor = [1, 0, 128];
const BLUE: RgbColor = [11, 94, 215];
const DARK_BLUE: RgbColor = [30, 58, 138];
const INK: RgbColor = [15, 23, 42];
const SLATE: RgbColor = [71, 85, 105];
const MUTED: RgbColor = [100, 116, 139];
const BORDER: RgbColor = [203, 213, 225];
const LIGHT_BORDER: RgbColor = [226, 232, 240];
const ICE_BG: RgbColor = [239, 246, 255];
const ICE_BORDER: RgbColor = [191, 219, 254];
const PANEL_BG: RgbColor = [248, 250, 252];
const HEADER_BG: RgbColor = [241, 245, 249];
const WHITE: RgbColor = [255, 255, 255];

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN_X = 34;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const MAX_Y = PAGE_H - 44;

const money = (value: number | string | undefined | null): string =>
  `$${Number(value ?? 0).toFixed(2)}`;

const ensureSpace = (doc: jsPDF, currentY: number, needed: number): number => {
  if (currentY + needed <= MAX_Y) return currentY;
  doc.addPage();
  return 38;
};

export const descargarFacturaPdfReal = async (
  factura: FacturaTicketResponseDto,
): Promise<void> => {
  const { jsPDF: JsPdfCtor } = await import("jspdf");
  const doc = new JsPdfCtor({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

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
      ? "VISTA PREVIA INFORMATIVA - DOCUMENTO PRELIMINAR SIN TIMBRE FISCAL DIGITAL"
      : "PRE-FACTURA EN ESPERA DE FIRMA Y TIMBRADO PAC - SIN VALIDEZ FISCAL DEFINITIVA";

  let y = 34;

  const folioCardW = 198;
  const folioCardX = MARGIN_X + CONTENT_W - folioCardW;
  const emitterW = CONTENT_W - folioCardW - 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text("COMPROBANTE FISCAL DIGITAL POR INTERNET · CFDI 4.0", MARGIN_X, y + 8);

  doc.setFontSize(13.5);
  doc.setTextColor(...INK);
  const emisorNombreLines = doc.splitTextToSize(
    factura.emisor.nombre || "EMISOR CFDI 4.0",
    emitterW,
  ) as string[];
  doc.text(emisorNombreLines, MARGIN_X, y + 23);

  let emitterY = y + 23 + emisorNombreLines.length * 15 + 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(`RFC Emisor: ${factura.emisor.rfc || "N/A"}`, MARGIN_X, emitterY);
  emitterY += 12;

  const regEmisorLines = doc.splitTextToSize(
    `Régimen Fiscal: ${factura.emisor.regimenFiscal} - ${factura.emisor.regimenFiscalDesc || ""}`,
    emitterW,
  ) as string[];
  doc.text(regEmisorLines, MARGIN_X, emitterY);
  emitterY += regEmisorLines.length * 11;

  doc.text(
    `Lugar de Expedición: CP ${factura.lugarExpedicion || "N/A"}`,
    MARGIN_X,
    emitterY,
  );
  emitterY += 12;

  const folioCardH = factura.esPrueba ? 82 : 68;
  doc.setDrawColor(...BORDER);
  doc.setFillColor(...WHITE);
  doc.roundedRect(folioCardX, y, folioCardW, folioCardH, 4, 4, "FD");

  doc.setFillColor(...NAVY);
  doc.roundedRect(folioCardX, y, folioCardW, 18, 4, 4, "F");
  doc.rect(folioCardX, y + 10, folioCardW, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text(encabezadoFolio, folioCardX + folioCardW / 2, y + 12, {
    align: "center",
  });

  const folioTextX = folioCardX + folioCardW - 10;
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(folioCompleto, folioTextX, y + 34, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(
    `Tipo: ${formatTipoComprobante(factura.tipoDeComprobante)}`,
    folioTextX,
    y + 46,
    { align: "right" },
  );
  doc.text(
    `Emisión: ${formatFechaComprobante(factura.fechaEmision)}`,
    folioTextX,
    y + 57,
    { align: "right" },
  );

  if (factura.esPrueba) {
    doc.setFillColor(...HEADER_BG);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(folioCardX + folioCardW - 102, y + 63, 92, 13, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text("AMBIENTE DE PRUEBA", folioCardX + folioCardW - 56, y + 72, {
      align: "center",
    });
  }

  y = Math.max(emitterY, y + folioCardH) + 8;

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.4);
  doc.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
  doc.setLineWidth(0.6);
  y += 10;

  doc.setFillColor(...ICE_BG);
  doc.setDrawColor(...ICE_BORDER);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 20, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(...DARK_BLUE);
  doc.text(estatusBanner, MARGIN_X + CONTENT_W / 2, y + 12.5, {
    align: "center",
  });
  y += 30;

  const colGap = 12;
  const halfW = (CONTENT_W - colGap) / 2;
  const innerCardW = halfW - 18;

  const recNombreLines = doc.splitTextToSize(
    factura.receptor.nombre || "",
    innerCardW,
  ) as string[];
  const recRegLines = doc.splitTextToSize(
    `Régimen: ${factura.receptor.regimenFiscalReceptor} - ${factura.receptor.regimenFiscalReceptorDesc || ""}`,
    innerCardW,
  ) as string[];
  const recUsoLines = doc.splitTextToSize(
    `Uso CFDI: ${factura.receptor.usoCfdi} - ${factura.receptor.usoCfdiDesc || ""}`,
    innerCardW,
  ) as string[];

  const leftCardLines =
    2 +
    recNombreLines.length +
    recRegLines.length +
    recUsoLines.length +
    (factura.receptor.mail ? 1 : 0);

  const pagoFormaLines = doc.splitTextToSize(
    `Forma de Pago: ${factura.formaPago} - ${factura.formaPagoDescripcion || ""}`,
    innerCardW,
  ) as string[];
  const pagoMetodoLines = doc.splitTextToSize(
    `Método de Pago: ${formatMetodoPago(factura.metodoPago)}`,
    innerCardW,
  ) as string[];
  const rightCardLines = 3 + pagoFormaLines.length + pagoMetodoLines.length;

  const boxHeadH = 18;
  const boxH = Math.max(leftCardLines, rightCardLines) * 11.5 + boxHeadH + 14;

  doc.setDrawColor(...BORDER);
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN_X, y, halfW, boxH, 4, 4, "FD");
  doc.roundedRect(MARGIN_X + halfW + colGap, y, halfW, boxH, 4, 4, "FD");

  doc.setFillColor(...HEADER_BG);
  doc.roundedRect(MARGIN_X, y, halfW, boxHeadH, 4, 4, "F");
  doc.rect(MARGIN_X, y + 10, halfW, 8, "F");
  doc.roundedRect(MARGIN_X + halfW + colGap, y, halfW, boxHeadH, 4, 4, "F");
  doc.rect(MARGIN_X + halfW + colGap, y + 10, halfW, 8, "F");

  doc.setDrawColor(...LIGHT_BORDER);
  doc.line(MARGIN_X, y + boxHeadH, MARGIN_X + halfW, y + boxHeadH);
  doc.line(
    MARGIN_X + halfW + colGap,
    y + boxHeadH,
    MARGIN_X + CONTENT_W,
    y + boxHeadH,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("DATOS DEL RECEPTOR", MARGIN_X + 9, y + 12);
  doc.text(
    "DATOS DE PAGO Y COMPROBANTE",
    MARGIN_X + halfW + colGap + 9,
    y + 12,
  );

  let ly = y + boxHeadH + 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(recNombreLines, MARGIN_X + 9, ly);
  ly += recNombreLines.length * 11;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...SLATE);
  doc.text(
    `RFC: ${factura.receptor.rfc} · CP: ${factura.receptor.domicilioFiscalReceptor || "N/A"}`,
    MARGIN_X + 9,
    ly,
  );
  ly += 11.5;
  doc.text(recRegLines, MARGIN_X + 9, ly);
  ly += recRegLines.length * 11;
  doc.text(recUsoLines, MARGIN_X + 9, ly);
  ly += recUsoLines.length * 11;
  if (factura.receptor.mail) {
    doc.text(`Correo: ${factura.receptor.mail}`, MARGIN_X + 9, ly);
  }

  let ry = y + boxHeadH + 13;
  const rx = MARGIN_X + halfW + colGap + 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...INK);
  doc.text(pagoFormaLines, rx, ry);
  ry += pagoFormaLines.length * 11;
  doc.text(pagoMetodoLines, rx, ry);
  ry += pagoMetodoLines.length * 11;
  doc.setTextColor(...SLATE);
  doc.text(
    `Moneda / T.C.: ${factura.moneda} (${Number(factura.tipoCambio).toFixed(4)})`,
    rx,
    ry,
  );
  ry += 11.5;
  doc.text(
    `Exportación: ${formatExportacion(factura.exportacion)}`,
    rx,
    ry,
  );
  ry += 11.5;
  doc.text(
    `Estatus: ${formatEstatusCfdi(factura.estadoTimbrado, factura.timbrado)}`,
    rx,
    ry,
  );

  y += boxH + 12;

  const colWidths = [56, 38, 64, 198, 64, 52, 72];
  const headers = [
    "Clave SAT",
    "Cant.",
    "Unidad",
    "Descripción",
    "V. Unitario",
    "Desc.",
    "Importe",
  ];

  const drawTableHeader = (topY: number): number => {
    doc.setFillColor(...NAVY);
    doc.roundedRect(MARGIN_X, topY, CONTENT_W, 20, 4, 4, "F");
    doc.rect(MARGIN_X, topY + 12, CONTENT_W, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(...WHITE);

    let cx = MARGIN_X;
    headers.forEach((label, idx) => {
      const w = colWidths[idx];
      const isRight = idx === 1 || idx >= 4;
      doc.text(label, isRight ? cx + w - 6 : cx + 6, topY + 13, {
        align: isRight ? "right" : "left",
      });
      cx += w;
    });
    return topY + 20;
  };

  y = ensureSpace(doc, y, 50);
  let tableStartY = y;
  y = drawTableHeader(y);

  (factura.conceptos || []).forEach((c, idx) => {
    const descLines = doc.splitTextToSize(
      c.descripcion || "",
      colWidths[3] - 10,
    ) as string[];
    const unitLines = doc.splitTextToSize(
      `${c.claveUnidad} · ${c.unidad}`,
      colWidths[2] - 8,
    ) as string[];
    const rowLines = Math.max(descLines.length, unitLines.length, 1);
    const rowH = rowLines * 10.5 + 10;

    if (y + rowH > MAX_Y) {
      doc.setDrawColor(...BORDER);
      doc.roundedRect(MARGIN_X, tableStartY, CONTENT_W, y - tableStartY, 4, 4, "S");
      doc.addPage();
      y = 38;
      tableStartY = y;
      y = drawTableHeader(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(...PANEL_BG);
      doc.rect(MARGIN_X, y, CONTENT_W, rowH, "F");
    }

    doc.setDrawColor(...LIGHT_BORDER);
    doc.line(MARGIN_X, y + rowH, MARGIN_X + CONTENT_W, y + rowH);

    const ty = y + 12;
    let cx = MARGIN_X;

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(c.claveProdServ || "", cx + 6, ty);
    cx += colWidths[0];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...INK);
    doc.text(Number(c.cantidad).toFixed(2), cx + colWidths[1] - 6, ty, {
      align: "right",
    });
    cx += colWidths[1];

    doc.text(unitLines, cx + 6, ty);
    cx += colWidths[2];

    doc.setFont("helvetica", "bold");
    doc.text(descLines, cx + 6, ty);
    cx += colWidths[3];

    doc.setFont("helvetica", "normal");
    doc.text(money(c.valorUnitario), cx + colWidths[4] - 6, ty, {
      align: "right",
    });
    cx += colWidths[4];

    doc.text(money(c.descuento), cx + colWidths[5] - 6, ty, {
      align: "right",
    });
    cx += colWidths[5];

    doc.setFont("helvetica", "bold");
    doc.text(money(c.importe), cx + colWidths[6] - 6, ty, {
      align: "right",
    });

    y += rowH;
  });

  doc.setDrawColor(...BORDER);
  doc.roundedRect(MARGIN_X, tableStartY, CONTENT_W, y - tableStartY, 4, 4, "S");
  y += 14;

  const totalsW = 212;
  const wordsW = CONTENT_W - totalsW - 12;
  const wordLines = doc.splitTextToSize(
    factura.importeConLetra || "",
    wordsW - 20,
  ) as string[];
  const hasDesc = factura.descuento > 0;
  const totalsRowsCount = hasDesc ? 4 : 3;
  const bottomH = Math.max(
    wordLines.length * 11.5 + 32,
    totalsRowsCount * 18 + 8,
  );

  y = ensureSpace(doc, y, bottomH + 10);

  doc.setFillColor(...PANEL_BG);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(MARGIN_X, y, wordsW, bottomH, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text("IMPORTE CON LETRA", MARGIN_X + 10, y + 14);
  doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(wordLines, MARGIN_X + 10, y + 28);

  const tx = MARGIN_X + wordsW + 12;
  doc.setFillColor(...WHITE);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(tx, y, totalsW, bottomH, 4, 4, "FD");

  let rowY = y;
  const totalLabelX = tx + 10;
  const totalValX = tx + totalsW - 10;
  const normalRowH = (bottomH - 22) / (hasDesc ? 3 : 2);

  const drawTotalRow = (label: string, val: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text(label, totalLabelX, rowY + normalRowH / 2 + 3);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(val, totalValX, rowY + normalRowH / 2 + 3, { align: "right" });
    rowY += normalRowH;
    doc.setDrawColor(...LIGHT_BORDER);
    doc.line(tx, rowY, tx + totalsW, rowY);
  };

  drawTotalRow("Subtotal", money(factura.subtotal));
  if (hasDesc) {
    drawTotalRow("Descuento", `-${money(factura.descuento)}`);
  }
  drawTotalRow("IVA Trasladado", money(factura.iva));

  doc.setFillColor(...NAVY);
  doc.roundedRect(tx, rowY, totalsW, y + bottomH - rowY, 4, 4, "F");
  doc.rect(tx, rowY, totalsW, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL", totalLabelX, rowY + (y + bottomH - rowY) / 2 + 3.5);
  doc.text(
    `${money(factura.total)} ${factura.moneda}`,
    totalValX,
    rowY + (y + bottomH - rowY) / 2 + 3.5,
    { align: "right" },
  );

  y += bottomH + 12;

  if (factura.notaCreditoPrevia) {
    const nc = factura.notaCreditoPrevia;
    const ncUuidLines = doc.splitTextToSize(
      `UUID Relacionado: ${nc.uuidsRelacionados}`,
      CONTENT_W - 20,
    ) as string[];
    const ncH = 44 + ncUuidLines.length * 10.5;
    y = ensureSpace(doc, y, ncH + 10);

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(MARGIN_X, y, CONTENT_W, ncH, 4, 4, "FD");
    doc.setFillColor(...HEADER_BG);
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 18, 4, 4, "F");
    doc.rect(MARGIN_X, y + 10, CONTENT_W, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.text(
      "CFDI RELACIONADO - NOTA DE CRÉDITO PREVIA (FACTURA GLOBAL)",
      MARGIN_X + 10,
      y + 12,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...INK);
    doc.text(
      `Folio Tentativo: ${nc.serie}-${nc.folioTentativo}   |   Tipo Relación SAT: ${nc.tipoRelacion}   |   Importe Total: ${money(nc.total)} ${factura.moneda}`,
      MARGIN_X + 10,
      y + 32,
    );

    doc.setFont("courier", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...SLATE);
    doc.text(ncUuidLines, MARGIN_X + 10, y + 44);
    y += ncH + 12;
  }

  const cadenaLines = doc.splitTextToSize(
    factura.cadenaOriginal || "",
    CONTENT_W - 20,
  ) as string[];
  const cadenaH = cadenaLines.length * 9.5 + 28;
  y = ensureSpace(doc, y, cadenaH + 24);

  doc.setFillColor(...PANEL_BG);
  doc.setDrawColor(...LIGHT_BORDER);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, cadenaH, 4, 4, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text(
    "CADENA ORIGINAL DEL COMPLEMENTO (PRE-TIMBRADO)",
    MARGIN_X + 10,
    y + 13,
  );
  doc.setFont("courier", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(...SLATE);
  doc.text(cadenaLines, MARGIN_X + 10, y + 25);

  y += cadenaH + 12;
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN_X, y, MARGIN_X + CONTENT_W, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    "Representación impresa preliminar de un CFDI 4.0 - Generado por Ventio Facturación.",
    MARGIN_X + CONTENT_W / 2,
    y + 12,
    { align: "center" },
  );

  const fileName = `PreFactura_${factura.serie}_${factura.folioTentativo}_${factura.receptor.rfc}.pdf`;
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
};
