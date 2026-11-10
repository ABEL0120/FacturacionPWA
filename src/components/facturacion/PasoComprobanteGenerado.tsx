import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  documentTextOutline,
  downloadOutline,
  eyeOutline,
  informationCircleOutline,
  refreshOutline,
} from "ionicons/icons";
import { FacturaTicketResponseDto } from "../../types/facturacion.types";
import { facturacionService } from "../../services/facturacionService";
import { useAlert } from "../../hooks/useAlert";
import { useToast } from "../../hooks/useToast";
import {
  formatFechaComprobante,
  formatMoney,
  getErrorMessage,
} from "../../utils/formatters";
import { ActionButton } from "../common/ActionButton";
import { ModalVistaPreviaPdf } from "./ModalVistaPreviaPdf";

interface PasoComprobanteGeneradoProps {
  factura: FacturaTicketResponseDto;
  loadingGenerar: boolean;
  onConfirmarGenerar: () => void;
  onVolverEditar: () => void;
  onReiniciar: () => void;
}

export const PasoComprobanteGenerado: React.FC<PasoComprobanteGeneradoProps> = ({
  factura,
  loadingGenerar,
  onConfirmarGenerar,
  onVolverEditar,
  onReiniciar,
}) => {
  const { showErrorAlert } = useAlert();
  const { showSuccess } = useToast();
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [modalPdfOpen, setModalPdfOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const esVistaPrevia = factura.estadoTimbrado === "VISTA_PREVIA";
  const folioCompleto = `${factura.serie}-${factura.folioTentativo}`;

  const handleDescargarXml = async (xml: string, nombreArchivo: string) => {
    try {
      facturacionService.descargarXml(xml, nombreArchivo);
    } catch (err: unknown) {
      await showErrorAlert({
        title: "No se pudo descargar el XML",
        message: getErrorMessage(err, "No fue posible descargar el XML."),
      });
    }
  };

  const handleDescargarPdf = async () => {
    setDownloadingPdf(true);
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
      setDownloadingPdf(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo descargar el PDF",
        message: errorMsg,
      });
    }
  };

  const handleAbrirVistaPreviaPdf = () => {
    setModalPdfOpen(true);
  };

  const handleConfirmar = () => {
    setMostrarDetalles(false);
    onConfirmarGenerar();
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-7 shadow-lg shadow-slate-200/50 space-y-5 animate-fade-in">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  esVistaPrevia
                    ? "bg-[#eef5ff] text-[#0b5ed7] border-[#b6d4fe]"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }`}
              >
                <IonIcon
                  icon={esVistaPrevia ? eyeOutline : checkmarkCircleOutline}
                  className="text-xl"
                />
              </div>
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  esVistaPrevia ? "text-[#0b5ed7]" : "text-emerald-700"
                }`}
              >
                {esVistaPrevia
                  ? "Vista Previa CFDI 4.0"
                  : "Pre-factura CFDI 4.0"}
              </span>
            </div>

            <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-black text-slate-800 whitespace-nowrap shrink-0">
              Folio {folioCompleto}
            </span>
          </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {esVistaPrevia ? "Revisa tu comprobante" : "Comprobante listo"}
          </h1>
          <p className="text-xs text-slate-500 leading-snug mt-1">
            {esVistaPrevia
              ? "Confirma que los datos fiscales y el importe sean correctos antes de emitir."
              : "Pendiente de firma y timbrado PAC. Ya puedes descargar tu XML o PDF."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#b6d4fe]/80 bg-white overflow-hidden divide-y divide-slate-200/80">
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#f5f9ff] to-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              {esVistaPrevia ? "Total a facturar" : "Total del comprobante"}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#010080] tracking-tight leading-none mt-1 tabular-nums">
              {formatMoney(factura.total)}{" "}
              <span className="text-sm font-extrabold text-slate-500">
                {factura.moneda}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Subtotal {formatMoney(factura.subtotal)}
              {factura.descuento > 0
                ? ` · Descuento -${formatMoney(factura.descuento)}`
                : ""}{" "}
              · IVA {formatMoney(factura.iva)}
            </p>
          </div>

          <div className="sm:text-right text-xs text-slate-600 space-y-0.5">
            <div className="font-bold text-slate-800">
              {factura.formaPago} - {factura.formaPagoDescripcion}
            </div>
            <div className="text-[11px] text-slate-500">
              {formatFechaComprobante(factura.fechaEmision)}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#010080] block">
            Receptor
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="text-sm font-black text-slate-800 break-words">
              {factura.receptor.nombre}
            </span>
            <span className="text-xs font-extrabold text-[#0b5ed7] shrink-0">
              {factura.receptor.rfc}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Uso CFDI: {factura.receptor.usoCfdi} -{" "}
            {factura.receptor.usoCfdiDesc} · Régimen{" "}
            {factura.receptor.regimenFiscalReceptor} · CP{" "}
            {factura.receptor.domicilioFiscalReceptor}
          </p>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#010080]">
              Conceptos ({factura.conceptos.length})
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Importe
            </span>
          </div>

          <div className="space-y-2.5">
            {factura.conceptos.map((c) => (
              <div
                key={c.secuencia}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-800 block leading-snug">
                    {c.descripcion}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {c.cantidad} {c.unidad} · P.U.{" "}
                    {formatMoney(c.valorUnitario)}
                  </span>
                </div>
                <span className="font-black text-slate-800 shrink-0 tabular-nums text-right">
                  {formatMoney(c.importe)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {factura.notaCreditoPrevia && (
        <div className="bg-[#f5f9ff] border border-[#b6d4fe] rounded-2xl px-4 py-3 flex items-start gap-2.5 text-xs">
          <IonIcon
            icon={informationCircleOutline}
            className="text-lg text-[#0b5ed7] shrink-0 mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-[#010080] block leading-snug">
              Incluye Nota de Crédito ({factura.notaCreditoPrevia.serie}-
              {factura.notaCreditoPrevia.folioTentativo})
            </span>
            <span className="text-[11px] text-slate-600 block mt-0.5">
              Ticket incluido previamente en Factura Global · Total{" "}
              {formatMoney(factura.notaCreditoPrevia.total)} {factura.moneda}
            </span>
          </div>
        </div>
      )}

      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/70">
        <button
          type="button"
          onClick={() => setMostrarDetalles((prev) => !prev)}
          aria-expanded={mostrarDetalles}
          className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors"
        >
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-[#010080] block">
              Detalles fiscales y datos SAT
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Emisor, claves SAT, importe con letra y cadena original
            </span>
          </div>
          <IonIcon
            icon={chevronDownOutline}
            className={`text-lg text-slate-500 shrink-0 transition-transform duration-200 ${
              mostrarDetalles ? "rotate-180" : ""
            }`}
          />
        </button>

        {mostrarDetalles && (
          <div className="px-4 pb-4 pt-3.5 border-t border-slate-200 bg-white space-y-4 text-xs animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Emisor
                </span>
                <p className="font-bold text-slate-800">
                  {factura.emisor.nombre}
                </p>
                <p className="text-[11px] text-slate-500">
                  RFC: {factura.emisor.rfc} · Régimen{" "}
                  {factura.emisor.regimenFiscal}
                </p>
                <p className="text-[11px] text-slate-500">
                  Lugar de Expedición: CP {factura.lugarExpedicion}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Parámetros CFDI 4.0
                </span>
                <p className="text-[11px] text-slate-600">
                  Método / Moneda:{" "}
                  <strong className="text-slate-800">
                    {factura.metodoPago} · {factura.moneda} (TC{" "}
                    {Number(factura.tipoCambio).toFixed(2)})
                  </strong>
                </p>
                <p className="text-[11px] text-slate-600">
                  Estado:{" "}
                  <strong className="text-slate-800">
                    {factura.estadoTimbrado}
                  </strong>
                </p>
                {factura.receptor.mail && (
                  <p className="text-[11px] text-slate-500 truncate">
                    Envío: {factura.receptor.mail}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Importe con Letra
              </span>
              <p className="font-bold text-slate-700">
                {factura.importeConLetra}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Claves SAT de Conceptos
              </span>
              {factura.conceptos.map((c) => (
                <div
                  key={`sat-${c.secuencia}`}
                  className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-[11px] text-slate-600"
                >
                  <span className="font-bold text-slate-800 block">
                    {c.descripcion}
                  </span>
                  <span>
                    ProdServ: {c.claveProdServ} · Unidad: {c.claveUnidad} · Obj.
                    Impuesto: {c.objetoImp}
                  </span>
                </div>
              ))}
            </div>

            {factura.notaCreditoPrevia && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#010080] block">
                  Nota de Crédito Relacionada
                </span>
                <p className="text-[11px] text-slate-600">
                  Folio:{" "}
                  <strong className="text-slate-800">
                    {factura.notaCreditoPrevia.serie}-
                    {factura.notaCreditoPrevia.folioTentativo}
                  </strong>{" "}
                  · Relación SAT {factura.notaCreditoPrevia.tipoRelacion}
                </p>
                <p className="text-[11px] text-slate-500 break-all">
                  UUID Global: {factura.notaCreditoPrevia.uuidsRelacionados}
                </p>
                {esVistaPrevia && factura.notaCreditoPrevia.xmlSinTimbrar && (
                  <ActionButton
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      handleDescargarXml(
                        factura.notaCreditoPrevia!.xmlSinTimbrar,
                        `PreNotaCredito_${factura.notaCreditoPrevia!.serie}_${factura.notaCreditoPrevia!.folioTentativo}.xml`,
                      )
                    }
                    icon={documentTextOutline}
                    iconClassName="text-sm shrink-0"
                  >
                    Descargar XML Nota de Crédito Previa
                  </ActionButton>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Cadena Original CFDI 4.0
              </span>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
                {factura.cadenaOriginal}
              </pre>
            </div>
          </div>
        )}
      </div>

      {esVistaPrevia ? (
        <div className="pt-1 space-y-3">
          <ActionButton
            variant="primary"
            loading={loadingGenerar}
            onClick={handleConfirmar}
            className="w-full px-4 text-xs sm:text-sm"
          >
            Confirmar y Generar Pre-Factura
          </ActionButton>

          <div className="grid grid-cols-2 gap-2.5">
            <ActionButton
              variant="outlineAccent"
              size="sm"
              onClick={handleAbrirVistaPreviaPdf}
              icon={eyeOutline}
              iconClassName="text-base shrink-0"
              className="w-full px-3"
            >
              PDF Previo
            </ActionButton>

            <ActionButton
              variant="outlineAccent"
              size="sm"
              onClick={() =>
                handleDescargarXml(
                  factura.xmlSinTimbrar,
                  `PreFactura_${factura.serie}_${factura.folioTentativo}_${factura.receptor.rfc}.xml`,
                )
              }
              icon={documentTextOutline}
              iconClassName="text-base shrink-0"
              className="w-full px-3"
            >
              XML Previo
            </ActionButton>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5">
            <ActionButton
              variant="neutral"
              size="sm"
              onClick={onVolverEditar}
              icon={arrowBackOutline}
              iconClassName="text-base shrink-0"
              className="w-full px-3"
            >
              Volver a Editar
            </ActionButton>

            <ActionButton
              variant="neutral"
              size="sm"
              onClick={onReiniciar}
              icon={refreshOutline}
              iconClassName="text-base shrink-0"
              className="w-full px-3"
            >
              Otro Ticket
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="pt-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <ActionButton
              variant="primary"
              loading={downloadingPdf}
              onClick={handleDescargarPdf}
              icon={downloadOutline}
              iconClassName="text-lg text-[#38bdf8] shrink-0"
              className="w-full"
            >
              Descargar PDF
            </ActionButton>

            <ActionButton
              variant="accent"
              onClick={() =>
                handleDescargarXml(
                  factura.xmlSinTimbrar,
                  `PreFactura_${factura.serie}_${factura.folioTentativo}_${factura.receptor.rfc}.xml`,
                )
              }
              icon={documentTextOutline}
              iconClassName="text-lg text-white shrink-0"
              className="w-full"
            >
              Descargar XML
            </ActionButton>
          </div>

          <ActionButton
            variant="outlineAccent"
            size="sm"
            onClick={handleAbrirVistaPreviaPdf}
            icon={eyeOutline}
            iconClassName="text-base shrink-0"
            className="w-full"
          >
            Vista Previa e Impresión PDF
          </ActionButton>

          {factura.notaCreditoPrevia?.xmlSinTimbrar && (
            <ActionButton
              variant="outlineAccent"
              size="sm"
              onClick={() =>
                handleDescargarXml(
                  factura.notaCreditoPrevia!.xmlSinTimbrar,
                  `PreNotaCredito_${factura.notaCreditoPrevia!.serie}_${factura.notaCreditoPrevia!.folioTentativo}.xml`,
                )
              }
              icon={documentTextOutline}
              iconClassName="text-base shrink-0"
              className="w-full"
            >
              Descargar XML Nota de Crédito ({factura.notaCreditoPrevia.serie}-
              {factura.notaCreditoPrevia.folioTentativo})
            </ActionButton>
          )}

          <div className="pt-2 border-t border-slate-100">
            <ActionButton
              variant="neutralPrimary"
              size="sm"
              onClick={onReiniciar}
              icon={refreshOutline}
              iconClassName="text-base shrink-0"
              className="w-full"
            >
              Facturar Otro Ticket
            </ActionButton>
          </div>
        </div>
      )}
    </div>

    <ModalVistaPreviaPdf
      isOpen={modalPdfOpen}
      factura={factura}
      onClose={() => setModalPdfOpen(false)}
    />
  </>
  );
};
