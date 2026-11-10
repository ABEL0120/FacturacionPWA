import React from "react";
import { IonIcon } from "@ionic/react";
import {
  addCircleOutline,
  arrowForwardOutline,
  receiptOutline,
  trashOutline,
} from "ionicons/icons";
import {
  TicketConsultaResponseDto,
  TicketResumenInfo,
} from "../../types/facturacion.types";
import { formatMoney } from "../../utils/formatters";
import { ActionButton } from "../common/ActionButton";
import { AlertBanner } from "../common/AlertBanner";

interface TicketResumenCardProps {
  ticketsSeleccionados: TicketConsultaResponseDto[];
  resumen: TicketResumenInfo;
  onQuitarTicket: (folio: string) => void;
  onAgregarOtro: () => void;
  onContinuar: () => void;
}

export const TicketResumenCard: React.FC<TicketResumenCardProps> = ({
  ticketsSeleccionados,
  resumen,
  onQuitarTicket,
  onAgregarOtro,
  onContinuar,
}) => {
  return (
    <div className="bg-[#eef5ff] border-2 border-[#b6d4fe] rounded-3xl p-5 sm:p-8 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#b6d4fe]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#010080] text-white flex items-center justify-center shadow-md shrink-0">
            <IonIcon
              icon={receiptOutline}
              className="text-2xl text-[#38bdf8]"
            />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-black text-[#010080] uppercase tracking-wider">
              {ticketsSeleccionados.length > 1
                ? `${ticketsSeleccionados.length} Tickets Validados`
                : "Ticket Encontrado"}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-800 break-words">
              {ticketsSeleccionados.map((t) => t.folio).join(", ")}
            </h3>
            <p className="text-xs text-slate-600">
              {resumen.sucursalNombre}
              {resumen.fecha ? ` • ${resumen.fecha}` : ""}
            </p>
            {resumen.formaPagoSat && (
              <p className="text-[11px] font-bold text-[#010080] mt-0.5">
                Forma de Pago SAT: {resumen.formaPagoSat}
                {resumen.formaPagoDesc ? ` - ${resumen.formaPagoDesc}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {resumen.requiereNotaCredito && (
        <AlertBanner
          variant="warning"
          title="Ticket incluido previamente en Factura Global"
          message={
            <>
              Al generar el comprobante se incluirá una Nota de Crédito previa
              relacionada
              {resumen.uuidGlobal
                ? ` (UUID Global: ${resumen.uuidGlobal})`
                : ""}
              .
            </>
          }
        />
      )}

      {ticketsSeleccionados.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-[#010080]">
            Tickets Incluidos:
          </p>
          <div className="flex flex-wrap gap-2">
            {ticketsSeleccionados.map((t) => (
              <div
                key={t.folio}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs"
              >
                <span className="font-bold text-slate-800">
                  {t.folio} ({formatMoney(t.total)})
                </span>
                <button
                  type="button"
                  onClick={() => onQuitarTicket(t.folio)}
                  aria-label={`Quitar ticket ${t.folio}`}
                  className="text-rose-500 hover:text-rose-700 p-0.5"
                >
                  <IonIcon icon={trashOutline} className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-wider text-[#010080]">
          Desglose de Partidas:
        </p>
        <div className="space-y-2">
          {resumen.partidas.map((item, idx) => (
            <div
              key={`${item.folio}-${item.numero}-${idx}`}
              className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-800 block">
                  {item.descripcion}
                </span>
                <span className="text-slate-500 block">
                  Clave SAT: {item.claveProdServSat} • Cant: {item.cantidad}{" "}
                  {item.unidadMedida || item.unidadMedidaSat}
                  {item.exento === "S" ? " • Exento" : ""}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-black text-slate-800 block">
                  {formatMoney(item.total)}
                </span>
                <span className="text-slate-500 text-[11px]">
                  Sub: {formatMoney(item.subtotal)} • IVA: {formatMoney(item.iva)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 bg-white rounded-xl p-3.5 border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold">{formatMoney(resumen.subtotal)}</span>
            </div>
            {resumen.descuento > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Descuento:</span>
                <span className="font-bold">
                  -{formatMoney(resumen.descuento)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>IVA:</span>
              <span className="font-bold">{formatMoney(resumen.iva)}</span>
            </div>
            <div className="flex justify-between font-black text-sm text-[#010080] pt-1.5 border-t border-slate-100">
              <span>TOTAL:</span>
              <span>{formatMoney(resumen.total)} MXN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#b6d4fe] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <ActionButton
          variant="outlineAccent"
          onClick={onAgregarOtro}
          icon={addCircleOutline}
          iconClassName="text-base text-[#0b5ed7] shrink-0"
          className="w-full sm:w-auto px-5 text-xs"
        >
          Agregar Otro Ticket
        </ActionButton>

        <ActionButton
          variant="accent"
          onClick={onContinuar}
          icon={arrowForwardOutline}
          iconPosition="end"
          iconClassName="text-base shrink-0"
          className="w-full sm:w-auto px-8"
        >
          Continuar a Datos Fiscales
        </ActionButton>
      </div>
    </div>
  );
};
