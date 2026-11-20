import React from "react";
import { IonIcon } from "@ionic/react";
import { documentTextOutline, searchOutline } from "ionicons/icons";
import {
  TicketConsultaResponseDto,
  TicketResumenInfo,
} from "../../types/facturacion.types";
import { soloDecimal, soloDigitos } from "../../utils/validators";
import { ActionButton } from "../common/ActionButton";
import { AlertBanner } from "../common/AlertBanner";
import { FormInput } from "../common/FormField";
import { TicketResumenCard } from "./TicketResumenCard";

interface PasoBuscarTicketProps {
  folio: string;
  onFolioChange: (value: string) => void;
  transaccion: string;
  onTransaccionChange: (value: string) => void;
  total: string;
  onTotalChange: (value: string) => void;
  ticketsSeleccionados: TicketConsultaResponseDto[];
  ticketResumen: TicketResumenInfo;
  loadingTicket: boolean;
  onBuscarTicket: () => void;
  onQuitarTicket: (folio: string) => void;
  onContinuarPaso2: () => void;
  onConsultarFacturados: () => void;
}

export const PasoBuscarTicket: React.FC<PasoBuscarTicketProps> = ({
  folio,
  onFolioChange,
  transaccion,
  onTransaccionChange,
  total,
  onTotalChange,
  ticketsSeleccionados,
  ticketResumen,
  loadingTicket,
  onBuscarTicket,
  onQuitarTicket,
  onContinuarPaso2,
  onConsultarFacturados,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscarTicket();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Paso 1: Búsqueda del Ticket
          </h1>
          <p className="text-xs text-slate-500">
            Ubica en tu ticket de compra el Folio junto con la Transacción
            (REF:), el Total o ambos para continuar
          </p>
        </div>

        <button
          type="button"
          onClick={onConsultarFacturados}
          className="min-h-10 px-4 py-2 rounded-xl bg-[#eef5ff] hover:bg-[#dceafe] border border-[#b6d4fe] text-[#010080] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0 self-start sm:self-auto"
        >
          <IonIcon icon={documentTextOutline} className="text-base shrink-0" />
          <span>Consulta Facturados</span>
        </button>
      </div>

      <AlertBanner
        variant="info"
        message="Solo cuentas con el mes en curso para emitir la factura de tu consumo."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput
            label="Folio del Ticket *"
            surface="white"
            type="text"
            maxLength={15}
            value={folio}
            onChange={(e) => onFolioChange(e.target.value)}
            placeholder="Ticket (Ej: LA10000247 o 247)"
            className="font-bold"
          />

          <FormInput
            label="Transacción (REF:)"
            surface="white"
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={transaccion}
            onChange={(e) => onTransaccionChange(soloDigitos(e.target.value))}
            placeholder="REF: (Ej: 123456)"
            className="font-bold"
          />

          <FormInput
            label="Total ($)"
            surface="white"
            type="text"
            inputMode="decimal"
            maxLength={12}
            value={total}
            onChange={(e) => onTotalChange(soloDecimal(e.target.value))}
            placeholder="Ej: 245.50"
            className="font-bold"
          />
        </div>

        <p className="text-[11px] font-medium text-slate-500">
          Puedes consultar ingresando <strong>Folio y Transacción</strong>,{" "}
          <strong>Folio y Total</strong>, o los <strong>3 campos</strong>.
        </p>

        <ActionButton
          type="submit"
          variant="primary"
          loading={loadingTicket}
          icon={searchOutline}
          iconClassName="text-lg shrink-0"
          className="w-full px-5 tracking-wide"
        >
          Cargar Información del Ticket
        </ActionButton>
      </form>

      {ticketsSeleccionados.length > 0 && (
        <TicketResumenCard
          ticketsSeleccionados={ticketsSeleccionados}
          resumen={ticketResumen}
          onQuitarTicket={onQuitarTicket}
          onContinuar={onContinuarPaso2}
        />
      )}
    </div>
  );
};
