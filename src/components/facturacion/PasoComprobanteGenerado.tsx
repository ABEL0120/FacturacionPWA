import React from "react";
import { IonIcon } from "@ionic/react";
import {
  arrowBackOutline,
  documentTextOutline,
  downloadOutline,
  eyeOutline,
  refreshOutline,
  warningOutline,
} from "ionicons/icons";
import { FacturaTicketResponseDto } from "../../types/facturacion.types";
import { facturacionService } from "../../services/facturacionService";
import { useAlert } from "../../hooks/useAlert";
import { formatMoney, getErrorMessage } from "../../utils/formatters";
import { ActionButton } from "../common/ActionButton";

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
  const { showErrorAlert, showWarningAlert } = useAlert();
  const esVistaPrevia = factura.estadoTimbrado === "VISTA_PREVIA";

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
    try {
      facturacionService.descargarPdf(factura);
    } catch (err: unknown) {
      await showWarningAlert({
        title: "No se pudo abrir la vista PDF",
        message: getErrorMessage(
          err,
          "No fue posible generar la vista de impresión PDF.",
        ),
      });
    }
  };

  return (
    <div className="bg-white border-2 border-[#b6d4fe] rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 animate-fade-in">
      <div className="text-center space-y-3">
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm border-2 ${
            esVistaPrevia
              ? "bg-[#eef5ff] text-[#0b5ed7] border-[#b6d4fe]"
              : "bg-amber-50 text-amber-600 border-amber-300"
          }`}
        >
          <IonIcon
            icon={esVistaPrevia ? eyeOutline : documentTextOutline}
            className="text-4xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-wider border inline-block ${
                esVistaPrevia
                  ? "bg-[#eef5ff] text-[#010080] border-[#b6d4fe]"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}
            >
              {esVistaPrevia
                ? "Vista Previa CFDI 4.0 — Solo lectura"
                : "Pre-factura CFDI 4.0 generada — Pendiente de firma y timbrado (en espera de datos del timbrador)"}
            </span>
            {factura.esPrueba && (
              <span className="px-3 py-1 bg-amber-200 text-amber-950 text-[11px] font-black rounded-full uppercase tracking-wider border border-amber-400">
                PROCESO DE PRUEBA
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            {esVistaPrevia
              ? "Vista Previa de Comprobante"
              : "Estructura CFDI 4.0 Lista"}
          </h1>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            {esVistaPrevia
              ? "Verifica todos los datos antes de confirmar y actualizar tu perfil fiscal."
              : "El XML se ha construido correctamente conforme a CFDI 4.0 y queda pendiente de firma digital y timbrado PAC."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
            Comprobante
          </span>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Folio Tentativo:</span>
            <span className="font-black text-slate-800">
              {factura.serie}-{factura.folioTentativo}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Fecha de Emisión:</span>
            <span className="font-semibold text-slate-800">
              {factura.fechaEmision}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Forma de Pago:</span>
            <span className="font-semibold text-slate-800 text-right">
              {factura.formaPago} - {factura.formaPagoDescripcion}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Método / Moneda:</span>
            <span className="font-semibold text-slate-800">
              {factura.metodoPago} • {factura.moneda} (TC{" "}
              {Number(factura.tipoCambio).toFixed(2)})
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Estado Timbrado:</span>
            <span className="font-bold text-amber-800">
              {factura.estadoTimbrado}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
            Emisor y Receptor
          </span>
          <div>
            <span className="text-slate-500 block">Emisor:</span>
            <span className="font-bold text-slate-800 block">
              {factura.emisor.nombre} ({factura.emisor.rfc})
            </span>
            <span className="text-slate-500 text-[11px]">
              Régimen: {factura.emisor.regimenFiscal} • Lugar Exp.:{" "}
              {factura.lugarExpedicion}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200">
            <span className="text-slate-500 block">Receptor:</span>
            <span className="font-bold text-slate-800 block">
              {factura.receptor.nombre} ({factura.receptor.rfc})
            </span>
            <span className="text-slate-500 text-[11px] block">
              CP: {factura.receptor.domicilioFiscalReceptor} • Régimen:{" "}
              {factura.receptor.regimenFiscalReceptor} -{" "}
              {factura.receptor.regimenFiscalReceptorDesc}
            </span>
            <span className="text-slate-500 text-[11px] block">
              Uso CFDI: {factura.receptor.usoCfdi} -{" "}
              {factura.receptor.usoCfdiDesc}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
        <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
          Conceptos ({factura.conceptos.length})
        </span>
        <div className="space-y-2">
          {factura.conceptos.map((c) => (
            <div
              key={c.secuencia}
              className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-800 block">
                  {c.descripcion}
                </span>
                <span className="text-slate-500">
                  SAT: {c.claveProdServ} • Cant: {c.cantidad} {c.unidad} (
                  {c.claveUnidad}) • P.U.: {formatMoney(c.valorUnitario)}
                </span>
              </div>
              <span className="font-black text-slate-800 shrink-0">
                {formatMoney(c.importe)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-3">
          <div className="text-slate-600">
            <span className="text-[10px] uppercase font-bold block text-slate-500">
              Importe con Letra:
            </span>
            <span className="font-bold text-slate-800">
              {factura.importeConLetra}
            </span>
          </div>
          <div className="sm:text-right space-y-0.5 shrink-0">
            <div className="text-slate-600">
              Subtotal: <strong>{formatMoney(factura.subtotal)}</strong>
            </div>
            {factura.descuento > 0 && (
              <div className="text-slate-600">
                Descuento: <strong>-{formatMoney(factura.descuento)}</strong>
              </div>
            )}
            <div className="text-slate-600">
              IVA: <strong>{formatMoney(factura.iva)}</strong>
            </div>
            <div className="text-sm font-black text-[#010080]">
              Total: {formatMoney(factura.total)} {factura.moneda}
            </div>
          </div>
        </div>
      </div>

      {factura.notaCreditoPrevia && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <IonIcon
              icon={warningOutline}
              className="text-xl text-amber-600 shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <span className="font-black text-amber-950 uppercase tracking-wide block">
                Nota de Crédito Previa (Ticket proveniente de Factura Global)
              </span>
              <p className="text-amber-900">
                Folio Tentativo:{" "}
                <strong>
                  {factura.notaCreditoPrevia.serie}-
                  {factura.notaCreditoPrevia.folioTentativo}
                </strong>{" "}
                • Relación SAT: {factura.notaCreditoPrevia.tipoRelacion} •
                Total: {formatMoney(factura.notaCreditoPrevia.total)}
              </p>
              <p className="text-amber-800 break-all">
                UUIDs Relacionados:{" "}
                {factura.notaCreditoPrevia.uuidsRelacionados}
              </p>
            </div>
          </div>
          {factura.notaCreditoPrevia.xmlSinTimbrar && (
            <ActionButton
              variant="amber"
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

      <details className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
        <summary className="font-black text-[#010080] cursor-pointer select-none">
          Ver Cadena Original CFDI 4.0
        </summary>
        <pre className="mt-3 p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
          {factura.cadenaOriginal}
        </pre>
      </details>

      {esVistaPrevia && (
        <div className="flex flex-col sm:flex-row gap-3">
          <ActionButton
            variant="primary"
            loading={loadingGenerar}
            onClick={onConfirmarGenerar}
            className="w-full sm:w-auto sm:flex-1 shadow-[#010080]/25"
          >
            Confirmar y Generar Pre-Factura
          </ActionButton>

          <ActionButton
            variant="neutral"
            onClick={onVolverEditar}
            icon={arrowBackOutline}
            iconClassName="text-base shrink-0"
            className="w-full sm:w-auto"
          >
            Volver a Editar
          </ActionButton>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
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
          className="w-full sm:w-auto sm:flex-1 text-xs sm:text-sm tracking-wide"
        >
          Descargar XML
        </ActionButton>

        <ActionButton
          variant="primary"
          onClick={handleDescargarPdf}
          icon={downloadOutline}
          iconClassName="text-lg text-[#38bdf8] shrink-0"
          className="w-full sm:w-auto sm:flex-1 text-xs sm:text-sm tracking-wide"
        >
          PDF
        </ActionButton>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center w-full">
        <ActionButton
          variant="neutralPrimary"
          size="sm"
          onClick={onReiniciar}
          icon={refreshOutline}
          iconClassName="text-sm shrink-0"
          className="w-full sm:w-auto"
        >
          Facturar Otro Ticket
        </ActionButton>
      </div>
    </div>
  );
};
