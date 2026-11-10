import React from "react";
import { IonIcon } from "@ionic/react";
import { arrowBackOutline, eyeOutline, mailOutline } from "ionicons/icons";
import {
  CatalogoItemDto,
  ClienteFiscalDto,
  MonedaCatalogoDto,
  TicketConsultaResponseDto,
  TicketResumenInfo,
} from "../../types/facturacion.types";
import { formatMoney } from "../../utils/formatters";
import { ActionButton } from "../common/ActionButton";
import { FormInput, FormSelect } from "../common/FormField";

interface PasoDatosEmisionProps {
  ticketsSeleccionados: TicketConsultaResponseDto[];
  ticketResumen: TicketResumenInfo;
  cliente: ClienteFiscalDto;
  regimenFiscal: string;
  onRegimenFiscalChange: (value: string) => void;
  usoCfdi: string;
  onUsoCfdiChange: (value: string) => void;
  formaPago: string;
  onFormaPagoChange: (value: string) => void;
  moneda: string;
  onMonedaChange: (value: string) => void;
  tipoCambio: string;
  onTipoCambioChange: (value: string) => void;
  emailEnvio: string;
  onEmailEnvioChange: (value: string) => void;
  regimenesCatalogo: CatalogoItemDto[];
  usosCfdiCatalogo: CatalogoItemDto[];
  formasPagoCatalogo: CatalogoItemDto[];
  monedasCatalogo: MonedaCatalogoDto[];
  loadingVistaPrevia: boolean;
  loadingGenerar: boolean;
  onVistaPrevia: () => void;
  onGenerarFactura: () => void;
  onVolverPaso2: () => void;
}

export const PasoDatosEmision: React.FC<PasoDatosEmisionProps> = ({
  ticketsSeleccionados,
  ticketResumen,
  cliente,
  regimenFiscal,
  onRegimenFiscalChange,
  usoCfdi,
  onUsoCfdiChange,
  formaPago,
  onFormaPagoChange,
  moneda,
  onMonedaChange,
  tipoCambio,
  onTipoCambioChange,
  emailEnvio,
  onEmailEnvioChange,
  regimenesCatalogo,
  usosCfdiCatalogo,
  formasPagoCatalogo,
  monedasCatalogo,
  loadingVistaPrevia,
  loadingGenerar,
  onVistaPrevia,
  onGenerarFactura,
  onVolverPaso2,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerarFactura();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onVolverPaso2}
          className="inline-flex items-center gap-1.5 min-h-9 py-1.5 px-2.5 -ml-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-[#010080] hover:bg-slate-100 transition-colors"
        >
          <IonIcon icon={arrowBackOutline} className="text-base shrink-0" />
          <span>Cambiar RFC Receptor</span>
        </button>

        <span className="text-xs font-black text-[#010080]">
          Receptor: {cliente.rfc}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          Paso 3: Régimen Fiscal, Uso de CFDI y Emisión
        </h1>
        <p className="text-xs text-slate-500">
          Confirma el régimen fiscal, uso de CFDI y correo de envío. Puedes
          consultar una vista previa antes de generar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
          <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider">
            Ticket(s) a Facturar ({ticketResumen.sucursalNombre})
          </span>
          <p className="font-bold text-slate-800 text-sm">
            {ticketsSeleccionados.map((t) => t.folio).join(", ")} •{" "}
            {formatMoney(ticketResumen.total)} {moneda}
          </p>
          <p className="text-slate-500">
            Subtotal: {formatMoney(ticketResumen.subtotal)} • IVA:{" "}
            {formatMoney(ticketResumen.iva)}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
          <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider">
            Datos del Receptor
          </span>
          <p className="font-bold text-slate-800 text-sm truncate">
            {cliente.razonSocial}
          </p>
          <p className="text-slate-500">
            RFC: {cliente.rfc} • CP: {cliente.codigoPostal}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-4">
          <FormSelect
            label="Régimen Fiscal del Receptor *"
            surface="white"
            value={regimenFiscal}
            onChange={(e) => onRegimenFiscalChange(e.target.value)}
          >
            {regimenesCatalogo.map((item) => (
              <option key={item.numero} value={item.numero}>
                {item.numero} - {item.descripcion}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            label="Tipo de Gasto / Uso de CFDI *"
            surface="white"
            value={usoCfdi}
            onChange={(e) => onUsoCfdiChange(e.target.value)}
          >
            {usosCfdiCatalogo.map((item) => (
              <option key={item.numero} value={item.numero}>
                {item.numero} - {item.descripcion}
              </option>
            ))}
          </FormSelect>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Moneda"
              surface="white"
              value={moneda}
              onChange={(e) => onMonedaChange(e.target.value)}
            >
              {monedasCatalogo.map((item) => (
                <option key={item.numero} value={item.numero}>
                  {item.numero} - {item.descripcion}
                </option>
              ))}
            </FormSelect>

            {moneda !== "MXN" ? (
              <FormInput
                label="Tipo de Cambio *"
                surface="white"
                type="number"
                step="0.0001"
                value={tipoCambio}
                onChange={(e) => onTipoCambioChange(e.target.value)}
              />
            ) : (
              <FormInput
                label="Correo de Envío"
                surface="white"
                type="email"
                icon={mailOutline}
                value={emailEnvio}
                onChange={(e) => onEmailEnvioChange(e.target.value)}
                placeholder="factura@cliente.com"
              />
            )}
          </div>

          {moneda !== "MXN" && (
            <FormInput
              label="Correo de Envío"
              surface="white"
              type="email"
              icon={mailOutline}
              value={emailEnvio}
              onChange={(e) => onEmailEnvioChange(e.target.value)}
              placeholder="factura@cliente.com"
            />
          )}

          {ticketResumen.formaPagoSat ? (
            <div className="bg-[#eef5ff] border border-[#b6d4fe] rounded-xl p-3.5 text-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
                Forma de Pago (Registrada en Ticket)
              </span>
              <p className="font-bold text-slate-800">
                {ticketResumen.formaPagoSat}
                {ticketResumen.formaPagoDesc
                  ? ` - ${ticketResumen.formaPagoDesc}`
                  : ""}
              </p>
            </div>
          ) : (
            <FormSelect
              label="Forma de Pago (Respaldo SAT) *"
              surface="white"
              value={formaPago}
              onChange={(e) => onFormaPagoChange(e.target.value)}
            >
              {formasPagoCatalogo.map((item) => (
                <option key={item.numero} value={item.numero}>
                  {item.numero} - {item.descripcion}
                </option>
              ))}
            </FormSelect>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <ActionButton
            variant="soft"
            loading={loadingVistaPrevia}
            disabled={loadingGenerar}
            onClick={onVistaPrevia}
            icon={eyeOutline}
            iconClassName="text-base shrink-0"
            className="w-full sm:w-auto px-5 text-xs sm:text-sm whitespace-nowrap"
          >
            Vista Previa
          </ActionButton>

          <ActionButton
            type="submit"
            variant="primary"
            loading={loadingGenerar}
            disabled={loadingVistaPrevia}
            className="w-full sm:w-auto sm:flex-1 shadow-[#010080]/25"
          >
            Generar Factura
          </ActionButton>

          <ActionButton
            variant="neutral"
            onClick={onVolverPaso2}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Atrás
          </ActionButton>
        </div>
      </form>
    </div>
  );
};
