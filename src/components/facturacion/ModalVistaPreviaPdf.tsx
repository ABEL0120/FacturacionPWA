import React, { useCallback, useEffect, useState } from "react";
import { IonIcon, IonModal, IonSpinner } from "@ionic/react";
import {
  arrowBackOutline,
  downloadOutline,
  printOutline,
} from "ionicons/icons";
import { FacturaTicketResponseDto } from "../../types/facturacion.types";
import { facturacionService } from "../../services/facturacionService";
import { useAlert } from "../../hooks/useAlert";
import { useToast } from "../../hooks/useToast";
import {
  formatEstatusCfdi,
  formatExportacion,
  formatFechaComprobante,
  formatMetodoPago,
  formatMoney,
  formatTipoComprobante,
  getErrorMessage,
} from "../../utils/formatters";

interface ModalVistaPreviaPdfProps {
  isOpen: boolean;
  factura: FacturaTicketResponseDto;
  onClose: () => void;
}

const SHEET_WIDTH = 760;

export const ModalVistaPreviaPdf: React.FC<ModalVistaPreviaPdfProps> = ({
  isOpen,
  factura,
  onClose,
}) => {
  const { showSuccess } = useToast();
  const { showErrorAlert } = useAlert();

  const [viewportNode, setViewportNode] = useState<HTMLDivElement | null>(null);
  const [sheetNode, setSheetNode] = useState<HTMLElement | null>(null);

  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(984);
  const [downloading, setDownloading] = useState(false);

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

  const measureLayout = useCallback(() => {
    const padding = window.innerWidth < 640 ? 24 : 48;
    const widthSource =
      viewportNode && viewportNode.clientWidth > 0
        ? viewportNode.clientWidth
        : Math.min(window.innerWidth, 900);
    const available = Math.max(280, widthSource - padding);
    const nextScale = Math.min(1, Math.max(0.32, available / SHEET_WIDTH));
    setScale(nextScale);

    if (sheetNode && sheetNode.scrollHeight > 0) {
      setSheetHeight(Math.max(984, sheetNode.scrollHeight));
    }
  }, [viewportNode, sheetNode]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(measureLayout);
    const t1 = window.setTimeout(measureLayout, 80);
    const t2 = window.setTimeout(measureLayout, 260);

    const observer = new ResizeObserver(measureLayout);
    if (viewportNode) observer.observe(viewportNode);
    if (sheetNode) observer.observe(sheetNode);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      observer.disconnect();
    };
  }, [isOpen, factura, viewportNode, sheetNode, measureLayout]);

  const handleDescargar = async () => {
    setDownloading(true);
    let errorMsg: string | null = null;
    try {
      await facturacionService.descargarPdf(factura);
      showSuccess("PDF descargado correctamente.");
    } catch (err: unknown) {
      errorMsg = getErrorMessage(
        err,
        "No fue posible generar el archivo PDF.",
      );
    } finally {
      setDownloading(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo descargar el PDF",
        message: errorMsg,
      });
    }
  };

  const handleImprimir = async () => {
    try {
      facturacionService.imprimirPdf(factura);
    } catch (err: unknown) {
      await showErrorAlert({
        title: "No se pudo imprimir el comprobante",
        message: getErrorMessage(
          err,
          "No fue posible preparar el documento para impresión.",
        ),
      });
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidPresent={measureLayout}
      onDidDismiss={onClose}
      className="ventio-pdf-modal"
    >
      <div className="h-full flex flex-col bg-slate-700 overflow-hidden">
        <header
          className="bg-[#010080] text-white px-3 sm:px-5 pb-2.5 flex items-center justify-between gap-2 shrink-0 shadow-md border-b border-white/10"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver al comprobante"
            className="min-h-10 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shrink-0"
          >
            <IonIcon icon={arrowBackOutline} className="text-base shrink-0" />
            <span>Volver</span>
          </button>

          <span className="hidden md:block text-xs font-extrabold tracking-wide text-blue-100 truncate px-2">
            Documento PDF · CFDI 4.0 ({folioCompleto})
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleImprimir}
              className="min-h-10 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shrink-0"
            >
              <IonIcon icon={printOutline} className="text-base shrink-0" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDescargar}
              disabled={downloading}
              className="min-h-10 px-3.5 py-2 rounded-xl bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60 shrink-0"
            >
              {downloading ? (
                <IonSpinner name="dots" className="h-4 text-white" />
              ) : (
                <>
                  <IonIcon
                    icon={downloadOutline}
                    className="text-base shrink-0"
                  />
                  <span className="sm:hidden">Descargar</span>
                  <span className="hidden sm:inline">Descargar PDF</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div
          ref={setViewportNode}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-600 p-3 sm:p-6 flex flex-col items-center"
        >
          <div
            style={{
              width: `${Math.round(SHEET_WIDTH * scale)}px`,
              height: `${Math.ceil(sheetHeight * scale)}px`,
            }}
            className="relative shrink-0 shadow-2xl shadow-slate-950/45 rounded-xs overflow-hidden bg-white"
          >
            <article
              ref={setSheetNode}
              aria-label={`Vista previa PDF de comprobante ${folioCompleto}`}
              style={{
                width: `${SHEET_WIDTH}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
              className="bg-white text-slate-900 p-7 select-text flex flex-col min-h-[984px] text-[11px] leading-[1.45]"
            >
              <div className="flex justify-between items-stretch gap-4 pb-3.5 border-b-2 border-[#010080]">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-extrabold tracking-widest uppercase text-[#0b5ed7] mb-1">
                    Comprobante Fiscal Digital por Internet · CFDI 4.0
                  </div>
                  <h2 className="text-base font-black text-slate-900 m-0 mb-1.5 leading-tight">
                    {factura.emisor.nombre || "EMISOR CFDI 4.0"}
                  </h2>
                  <div className="text-[10.5px] text-slate-700 space-y-0.5">
                    <div>
                      <span className="text-slate-500 font-semibold">
                        RFC Emisor:
                      </span>{" "}
                      <strong>{factura.emisor.rfc}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Régimen Fiscal:
                      </span>{" "}
                      {factura.emisor.regimenFiscal} -{" "}
                      {factura.emisor.regimenFiscalDesc}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Lugar de Expedición:
                      </span>{" "}
                      CP {factura.lugarExpedicion}
                    </div>
                  </div>
                </div>

                <div className="w-[225px] border border-slate-300 rounded-md overflow-hidden bg-white shrink-0">
                  <div className="bg-[#010080] text-white text-center py-1.5 px-2.5 text-[9.5px] font-extrabold tracking-wider uppercase">
                    {encabezadoFolio}
                  </div>
                  <div className="py-2.5 px-3 text-right">
                    <div className="text-base font-black text-[#010080] mb-1">
                      {folioCompleto}
                    </div>
                    <div className="text-[10px] text-slate-600 leading-[1.45] space-y-0.5">
                      <div>
                        <span className="text-slate-500 font-semibold">
                          Tipo:
                        </span>{" "}
                        {formatTipoComprobante(factura.tipoDeComprobante)}
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold">
                          Emisión:
                        </span>{" "}
                        {formatFechaComprobante(factura.fechaEmision)}
                      </div>
                      <div>
                        <span className="text-slate-500 font-semibold">
                          Estatus:
                        </span>{" "}
                        {formatEstatusCfdi(
                          factura.estadoTimbrado,
                          factura.timbrado,
                        )}
                      </div>
                    </div>
                    {factura.esPrueba && (
                      <span className="inline-block mt-1.5 py-0.5 px-2 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[9px] font-extrabold tracking-wide">
                        AMBIENTE DE PRUEBA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="my-3 py-2 px-3 rounded-md bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a] text-[9.5px] font-extrabold tracking-wide text-center">
                {estatusBanner}
              </div>

              <div className="grid grid-cols-2 gap-3 my-3">
                <div className="border border-slate-300 rounded-md overflow-hidden bg-white">
                  <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-2.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#010080]">
                    Datos del Receptor
                  </div>
                  <div className="py-2 px-2.5 text-[10.5px] text-slate-800 leading-[1.5]">
                    <div className="font-extrabold text-slate-900 mb-0.5">
                      {factura.receptor.nombre}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">RFC:</span>{" "}
                      <strong>{factura.receptor.rfc}</strong> ·{" "}
                      <span className="text-slate-500 font-semibold">CP:</span>{" "}
                      {factura.receptor.domicilioFiscalReceptor}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Régimen:
                      </span>{" "}
                      {factura.receptor.regimenFiscalReceptor} -{" "}
                      {factura.receptor.regimenFiscalReceptorDesc}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Uso CFDI:
                      </span>{" "}
                      {factura.receptor.usoCfdi} - {factura.receptor.usoCfdiDesc}
                    </div>
                    {factura.receptor.mail && (
                      <div>
                        <span className="text-slate-500 font-semibold">
                          Correo:
                        </span>{" "}
                        {factura.receptor.mail}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-slate-300 rounded-md overflow-hidden bg-white">
                  <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-2.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#010080]">
                    Datos de Pago y Comprobante
                  </div>
                  <div className="py-2 px-2.5 text-[10.5px] text-slate-800 leading-[1.5]">
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Forma de Pago:
                      </span>{" "}
                      {factura.formaPago} - {factura.formaPagoDescripcion}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Método de Pago:
                      </span>{" "}
                      {formatMetodoPago(factura.metodoPago)}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Moneda / T.C.:
                      </span>{" "}
                      {factura.moneda} ({Number(factura.tipoCambio).toFixed(4)})
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Exportación:
                      </span>{" "}
                      {formatExportacion(factura.exportacion)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 rounded-md overflow-hidden my-3">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#010080] text-white">
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-left">
                        Clave SAT
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-right">
                        Cant.
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-left">
                        Unidad
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-left">
                        Descripción
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-right">
                        V. Unitario
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-right">
                        Desc.
                      </th>
                      <th className="py-2 px-2 text-[9px] font-extrabold uppercase tracking-wider text-right">
                        Importe
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {factura.conceptos.map((c, idx) => (
                      <tr
                        key={c.secuencia}
                        className={`border-b border-slate-200 last:border-b-0 ${
                          idx % 2 === 1 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <td className="py-2 px-2 font-mono text-[9.5px] text-slate-700 align-top">
                          {c.claveProdServ}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] text-slate-900 text-right tabular-nums whitespace-nowrap align-top">
                          {Number(c.cantidad).toFixed(2)}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] text-slate-800 align-top">
                          {c.claveUnidad} · {c.unidad}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] font-semibold text-slate-900 align-top">
                          {c.descripcion}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] text-slate-900 text-right tabular-nums whitespace-nowrap align-top">
                          {formatMoney(c.valorUnitario)}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] text-slate-900 text-right tabular-nums whitespace-nowrap align-top">
                          {formatMoney(c.descuento)}
                        </td>
                        <td className="py-2 px-2 text-[10.5px] font-extrabold text-slate-900 text-right tabular-nums whitespace-nowrap align-top">
                          {formatMoney(c.importe)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-stretch gap-3 mt-3">
                <div className="flex-1 border border-slate-300 rounded-md bg-slate-50 py-2.5 px-3">
                  <div className="text-[9px] font-extrabold text-[#010080] uppercase tracking-wider mb-1">
                    Importe con Letra
                  </div>
                  <div className="font-extrabold text-[10.5px] text-slate-900">
                    {factura.importeConLetra}
                  </div>
                </div>

                <div className="w-[260px] border border-slate-300 rounded-md overflow-hidden shrink-0">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 px-2.5 text-[10.5px] text-slate-500 font-semibold">
                          Subtotal
                        </td>
                        <td className="py-1.5 px-2.5 text-[10.5px] font-extrabold text-slate-900 text-right tabular-nums whitespace-nowrap">
                          {formatMoney(factura.subtotal)}
                        </td>
                      </tr>
                      {factura.descuento > 0 && (
                        <tr className="border-b border-slate-200">
                          <td className="py-1.5 px-2.5 text-[10.5px] text-slate-500 font-semibold">
                            Descuento
                          </td>
                          <td className="py-1.5 px-2.5 text-[10.5px] font-extrabold text-slate-900 text-right tabular-nums whitespace-nowrap">
                            -{formatMoney(factura.descuento)}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-slate-200">
                        <td className="py-1.5 px-2.5 text-[10.5px] text-slate-500 font-semibold">
                          IVA Trasladado
                        </td>
                        <td className="py-1.5 px-2.5 text-[10.5px] font-extrabold text-slate-900 text-right tabular-nums whitespace-nowrap">
                          {formatMoney(factura.iva)}
                        </td>
                      </tr>
                      <tr className="bg-[#010080] text-white font-black text-xs">
                        <td className="py-2 px-2.5">TOTAL</td>
                        <td className="py-2 px-2.5 text-right tabular-nums whitespace-nowrap">
                          {formatMoney(factura.total)} {factura.moneda}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {factura.notaCreditoPrevia && (
                <div className="mt-3 border border-slate-300 rounded-md overflow-hidden bg-white">
                  <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-2.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#010080]">
                    CFDI Relacionado — Nota de Crédito Previa (Factura Global)
                  </div>
                  <div className="py-2 px-2.5 text-[10.5px] text-slate-800 grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Folio Tentativo:
                      </span>{" "}
                      <strong>
                        {factura.notaCreditoPrevia.serie}-
                        {factura.notaCreditoPrevia.folioTentativo}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Tipo Relación SAT:
                      </span>{" "}
                      {factura.notaCreditoPrevia.tipoRelacion}
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">
                        Importe Total:
                      </span>{" "}
                      <strong>
                        {formatMoney(factura.notaCreditoPrevia.total)}{" "}
                        {factura.moneda}
                      </strong>
                    </div>
                    <div className="col-span-2 break-all">
                      <span className="text-slate-500 font-semibold">
                        UUID Relacionado:
                      </span>{" "}
                      <span className="font-mono text-[9.5px]">
                        {factura.notaCreditoPrevia.uuidsRelacionados}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 border border-slate-200 rounded-md bg-slate-50 py-2 px-2.5">
                <div className="text-[9px] font-extrabold text-[#010080] uppercase tracking-wider mb-1">
                  Cadena Original del Complemento (Pre-Timbrado)
                </div>
                <div className="font-mono text-[8.5px] text-slate-700 break-all leading-[1.4]">
                  {factura.cadenaOriginal}
                </div>
              </div>

              <footer className="mt-auto pt-4">
                <div className="pt-2 border-t border-slate-300 text-center text-[9px] text-slate-500">
                  Representación impresa preliminar de un CFDI 4.0 — Generado por
                  Ventio Facturación.
                </div>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </IonModal>
  );
};
