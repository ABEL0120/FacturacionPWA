import React from "react";
import { IonIcon } from "@ionic/react";
import {
  addCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  businessOutline,
  searchOutline,
} from "ionicons/icons";
import {
  ClienteFiscalDto,
  ClienteRfcItemDto,
  TicketConsultaResponseDto,
} from "../../types/facturacion.types";
import { formatMoney } from "../../utils/formatters";
import { normalizarRfc } from "../../utils/validators";
import { ActionButton } from "../common/ActionButton";

interface PasoSeleccionarRfcProps {
  ticketsSeleccionados: TicketConsultaResponseDto[];
  totalResumen: number;
  rfcsCliente: ClienteRfcItemDto[];
  rfcBusqueda: string;
  onRfcBusquedaChange: (value: string) => void;
  cliente: ClienteFiscalDto | null;
  loadingRfc: boolean;
  puedeRegistrarRfc: boolean;
  onBuscarRfc: (rfc?: string) => void;
  onAbrirRegistroRfc: (rfcInicial?: string) => void;
  onLimpiarCliente: () => void;
  onVolverPaso1: () => void;
  onContinuarPaso3: () => void;
}

export const PasoSeleccionarRfc: React.FC<PasoSeleccionarRfcProps> = ({
  ticketsSeleccionados,
  totalResumen,
  rfcsCliente,
  rfcBusqueda,
  onRfcBusquedaChange,
  cliente,
  loadingRfc,
  puedeRegistrarRfc,
  onBuscarRfc,
  onAbrirRegistroRfc,
  onLimpiarCliente,
  onVolverPaso1,
  onContinuarPaso3,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscarRfc(rfcBusqueda);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onVolverPaso1}
          className="inline-flex items-center gap-1.5 min-h-9 py-1.5 px-2.5 -ml-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-[#010080] hover:bg-slate-100 transition-colors"
        >
          <IonIcon icon={arrowBackOutline} className="text-base shrink-0" />
          <span>Volver a datos del Ticket</span>
        </button>

        <span className="text-xs font-black text-[#010080]">
          Ticket(s): {ticketsSeleccionados.map((t) => t.folio).join(", ")} (
          {formatMoney(totalResumen)})
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          Paso 2: Consulta o Registro de RFC
        </h1>
        <p className="text-xs text-slate-500">
          Selecciona un RFC guardado o busca un RFC receptor. Si no existe,
          podrás darlo de alta inmediatamente.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5"
      >
        {rfcsCliente.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Tus RFCs Registrados (Selector Rápido):
            </span>
            <div className="flex flex-wrap gap-2">
              {rfcsCliente.map((item) => {
                const seleccionado =
                  cliente?.rfc?.toUpperCase() === item.rfc.toUpperCase();
                return (
                  <button
                    key={`${item.numeroCliente}-${item.rfc}`}
                    type="button"
                    onClick={() => {
                      onRfcBusquedaChange(item.rfc);
                      onBuscarRfc(item.rfc);
                    }}
                    className={`min-h-10 py-1.5 px-3 rounded-xl text-xs font-bold transition-all border text-left flex items-center gap-1.5 ${
                      seleccionado
                        ? "bg-[#010080] text-white border-[#010080] shadow-sm"
                        : "bg-[#eef5ff] hover:bg-[#dceafe] text-[#010080] border-[#b6d4fe]"
                    }`}
                  >
                    <IonIcon
                      icon={businessOutline}
                      className="text-sm shrink-0"
                    />
                    <span>
                      {item.rfc}
                      {item.razonSocial ? ` • ${item.razonSocial}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            RFC Receptor *
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              maxLength={13}
              value={rfcBusqueda}
              onChange={(e) =>
                onRfcBusquedaChange(normalizarRfc(e.target.value))
              }
              placeholder="XAXX010101000"
              className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 h-12 px-4 rounded-xl border border-slate-300 text-sm font-bold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
            />

            <ActionButton
              type="submit"
              variant="primary"
              loading={loadingRfc}
              icon={searchOutline}
              iconClassName="text-base shrink-0"
              className="w-full sm:w-auto px-8 tracking-wide whitespace-nowrap"
            >
              Buscar RFC
            </ActionButton>
          </div>
        </div>

        {puedeRegistrarRfc && (
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => onAbrirRegistroRfc(rfcBusqueda)}
              className="min-h-9 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#010080] transition-colors inline-flex items-center gap-1.5"
            >
              <IonIcon
                icon={addCircleOutline}
                className="text-sm text-[#0b5ed7] shrink-0"
              />
              <span>Registrar Nuevo RFC</span>
            </button>
          </div>
        )}
      </form>

      {cliente && (
        <div className="bg-[#eef5ff] border-2 border-[#b6d4fe] rounded-3xl p-5 sm:p-8 space-y-5 animate-fade-in">
          <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#b6d4fe]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#010080] text-white flex items-center justify-center shadow-md shrink-0">
                <IonIcon
                  icon={businessOutline}
                  className="text-2xl text-[#38bdf8]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-[#010080] uppercase tracking-wider">
                  Contribuyente Encontrado
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 break-words">
                  {cliente.razonSocial}
                </h3>
                <p className="text-xs text-slate-600 font-bold">
                  RFC: {cliente.rfc}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">
                Domicilio Fiscal (CP):
              </span>
              <span className="font-bold text-slate-800">
                CP {cliente.codigoPostal || "N/A"}
                {cliente.direccion ? ` • ${cliente.direccion}` : ""}
                {cliente.numeroExt ? ` #${cliente.numeroExt}` : ""}
                {cliente.colonia ? `, ${cliente.colonia}` : ""}
                {cliente.delegacion ? `, ${cliente.delegacion}` : ""}
                {cliente.estado ? `, ${cliente.estado}` : ""}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <div>
                <span className="text-slate-500">Régimen Fiscal: </span>
                <span className="font-bold text-slate-800">
                  {cliente.regimenFiscal || "612"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Uso de CFDI: </span>
                <span className="font-bold text-slate-800">
                  {cliente.usoCfdi || "G03"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#b6d4fe] flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <ActionButton
              variant="outline"
              size="sm"
              onClick={onLimpiarCliente}
              className="w-full sm:w-auto text-slate-600"
            >
              Buscar otro RFC
            </ActionButton>

            <ActionButton
              variant="accent"
              onClick={onContinuarPaso3}
              icon={arrowForwardOutline}
              iconPosition="end"
              iconClassName="text-base shrink-0"
              className="w-full sm:w-auto px-8"
            >
              Confirmar RFC y Continuar
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
