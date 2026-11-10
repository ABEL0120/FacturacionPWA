import React from "react";
import { searchOutline } from "ionicons/icons";
import {
  TicketConsultaResponseDto,
  TicketResumenInfo,
} from "../../types/facturacion.types";
import { soloDigitos } from "../../utils/validators";
import { ActionButton } from "../common/ActionButton";
import { AlertBanner } from "../common/AlertBanner";
import { FormInput } from "../common/FormField";
import { TicketResumenCard } from "./TicketResumenCard";

interface PasoBuscarTicketProps {
  folio: string;
  onFolioChange: (value: string) => void;
  transaccion: string;
  onTransaccionChange: (value: string) => void;
  agregarOtroTicket: boolean;
  onCancelarAgregarOtro: () => void;
  onIniciarAgregarOtro: () => void;
  ticketsSeleccionados: TicketConsultaResponseDto[];
  ticketResumen: TicketResumenInfo;
  loadingTicket: boolean;
  ticketError: string;
  onBuscarTicket: () => void;
  onQuitarTicket: (folio: string) => void;
  onContinuarPaso2: () => void;
}

export const PasoBuscarTicket: React.FC<PasoBuscarTicketProps> = ({
  folio,
  onFolioChange,
  transaccion,
  onTransaccionChange,
  agregarOtroTicket,
  onCancelarAgregarOtro,
  onIniciarAgregarOtro,
  ticketsSeleccionados,
  ticketResumen,
  loadingTicket,
  ticketError,
  onBuscarTicket,
  onQuitarTicket,
  onContinuarPaso2,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscarTicket();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          Paso 1: Búsqueda del Ticket
        </h1>
        <p className="text-xs text-slate-500">
          Ubica en tu ticket de compra el Folio (Ticket) y la Transacción (REF:)
          e ingrésalos para continuar
        </p>
      </div>

      <AlertBanner
        variant="info"
        message="Solo cuentas con el mes en curso para emitir la factura de tu consumo."
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5"
      >
        {agregarOtroTicket && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#eef5ff] border border-[#b6d4fe] px-3.5 py-2 rounded-xl text-xs">
            <span className="font-bold text-[#010080]">
              Agregando un ticket adicional de la misma sucursal (
              {ticketResumen.sucursalNombre})
            </span>
            <button
              type="button"
              onClick={onCancelarAgregarOtro}
              className="text-[#0b5ed7] font-bold hover:underline"
            >
              Cancelar adicional
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            label="Transacción (REF:) *"
            surface="white"
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={transaccion}
            onChange={(e) => onTransaccionChange(soloDigitos(e.target.value))}
            placeholder="REF: (Ej: 123456)"
            className="font-bold"
          />
        </div>

        {ticketError && <AlertBanner variant="error" message={ticketError} />}

        <ActionButton
          type="submit"
          variant="primary"
          loading={loadingTicket}
          icon={searchOutline}
          iconClassName="text-lg shrink-0"
          className="w-full px-5 tracking-wide"
        >
          {agregarOtroTicket
            ? "Validar y Agregar Ticket"
            : "Cargar Información del Ticket"}
        </ActionButton>
      </form>

      {ticketsSeleccionados.length > 0 && (
        <TicketResumenCard
          ticketsSeleccionados={ticketsSeleccionados}
          resumen={ticketResumen}
          onQuitarTicket={onQuitarTicket}
          onAgregarOtro={onIniciarAgregarOtro}
          onContinuar={onContinuarPaso2}
        />
      )}
    </div>
  );
};
