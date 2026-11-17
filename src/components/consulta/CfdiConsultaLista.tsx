import React from "react";
import { IonIcon, IonSpinner } from "@ionic/react";
import {
  codeSlashOutline,
  documentTextOutline,
  downloadOutline,
  eyeOutline,
  mailOutline,
  receiptOutline,
} from "ionicons/icons";
import { CfdiConsultaItemDto } from "../../types/cfdiConsulta.types";
import { formatFechaComprobante, formatMoney } from "../../utils/formatters";
import { ActionButton } from "../common/ActionButton";

interface CfdiConsultaListaProps {
  items: CfdiConsultaItemDto[];
  loading: boolean;
  accionActiva: string | null;
  tieneFiltros: boolean;
  onVerPdf: (item: CfdiConsultaItemDto) => void;
  onDescargarPdf: (item: CfdiConsultaItemDto) => void;
  onDescargarXml: (item: CfdiConsultaItemDto) => void;
  onEnviarCorreo: (item: CfdiConsultaItemDto) => void;
  onRestaurarFiltros: () => void;
  onIrAFacturar: () => void;
}

function formatFechaItem(item: CfdiConsultaItemDto): {
  texto: string;
  pendienteTimbre: boolean;
} {
  const timbre = item.fechaTimbre?.trim() || "";
  if (timbre) {
    return {
      texto: formatFechaComprobante(timbre),
      pendienteTimbre: false,
    };
  }
  const fechaBase = item.fecha?.trim() || "";
  return {
    texto: fechaBase ? formatFechaComprobante(fechaBase) : "Pendiente",
    pendienteTimbre: true,
  };
}

export const CfdiConsultaLista: React.FC<CfdiConsultaListaProps> = ({
  items,
  loading,
  accionActiva,
  tieneFiltros,
  onVerPdf,
  onDescargarPdf,
  onDescargarXml,
  onEnviarCorreo,
  onRestaurarFiltros,
  onIrAFacturar,
}) => {
  if (loading && items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-sm">
        <IonSpinner name="crescent" className="w-7 h-7 text-[#0b5ed7] mx-auto" />
        <p className="text-sm font-bold text-slate-700">
          Consultando comprobantes CFDI 4.0...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] flex items-center justify-center mx-auto">
          <IonIcon icon={documentTextOutline} className="text-2xl" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black text-slate-800">
            No se encontraron comprobantes
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {tieneFiltros
              ? "No hay facturas activas que coincidan con la serie o el folio ingresados."
              : "Aún no tienes facturas CFDI 4.0 registradas en tu cuenta."}
          </p>
        </div>
        <div className="flex justify-center">
          {tieneFiltros ? (
            <ActionButton
              variant="soft"
              size="sm"
              onClick={onRestaurarFiltros}
            >
              Mostrar Todas las Facturas
            </ActionButton>
          ) : (
            <ActionButton
              variant="primary"
              size="sm"
              onClick={onIrAFacturar}
              icon={receiptOutline}
            >
              Facturar un Ticket
            </ActionButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500">
          {items.length === 1
            ? "1 comprobante encontrado"
            : `${items.length} comprobantes encontrados`}
        </span>
        {loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b5ed7]">
            <IonSpinner name="crescent" className="w-3.5 h-3.5" />
            Actualizando...
          </span>
        )}
      </div>

      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#010080] text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-3 whitespace-nowrap">Id. CFDI</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Sucursal</th>
                <th className="py-3 px-2.5 whitespace-nowrap">RFC</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Fecha</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">
                  Ticket
                </th>
                <th className="py-3 px-2.5 whitespace-nowrap">UUID</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">
                  Subtotal
                </th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">
                  IVA
                </th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">
                  Total
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {items.map((item, idx) => {
                const fechaInfo = formatFechaItem(item);
                const busyVer = accionActiva === `${item.idCfdi}:ver`;
                const busyPdf = accionActiva === `${item.idCfdi}:pdf`;
                const busyXml = accionActiva === `${item.idCfdi}:xml`;
                const busyMail = accionActiva === `${item.idCfdi}:mail`;

                return (
                  <tr
                    key={`${item.idCfdi}-${idx}`}
                    className={
                      idx % 2 === 0
                        ? "bg-white hover:bg-[#f5f9ff] transition-colors"
                        : "bg-slate-50/60 hover:bg-[#f5f9ff] transition-colors"
                    }
                  >
                    <td className="py-2.5 px-3 font-extrabold text-[#010080] whitespace-nowrap">
                      {item.idCfdi}
                    </td>
                    <td
                      className="py-2.5 px-2.5 font-medium text-slate-700 max-w-[130px] truncate"
                      title={item.sucursalDesc || `Sucursal ${item.sucursal}`}
                    >
                      {item.sucursalDesc || `Sucursal ${item.sucursal}`}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                      {item.rfcReceptor || "—"}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="block text-slate-700">
                        {fechaInfo.texto}
                      </span>
                      {fechaInfo.pendienteTimbre && (
                        <span className="text-[10px] font-bold text-slate-400">
                          Sin timbre PAC
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-semibold tabular-nums whitespace-nowrap">
                      {item.orden > 0 ? item.orden : "—"}
                    </td>
                    <td
                      className="py-2.5 px-2.5 font-mono text-[11px] text-slate-500 max-w-[110px] truncate"
                      title={item.uuid || "Pendiente de timbrado"}
                    >
                      {item.uuid || "Sin UUID"}
                    </td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">
                      {formatMoney(item.subTotal)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right tabular-nums whitespace-nowrap">
                      {formatMoney(item.ivaImporte)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-black text-[#010080] tabular-nums whitespace-nowrap">
                      {formatMoney(item.total)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onVerPdf(item)}
                          disabled={Boolean(accionActiva)}
                          title={`Ver PDF ${item.idCfdi}`}
                          className="min-h-9 px-2 py-1.5 rounded-xl bg-[#eef5ff] hover:bg-[#dceafe] border border-[#b6d4fe] text-[#010080] font-bold text-[11px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {busyVer ? (
                            <IonSpinner name="dots" className="w-4 h-4" />
                          ) : (
                            <>
                              <IonIcon icon={eyeOutline} className="text-sm" />
                              <span>Ver</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDescargarPdf(item)}
                          disabled={Boolean(accionActiva)}
                          title={`Descargar PDF ${item.idCfdi}`}
                          className="min-h-9 px-2 py-1.5 rounded-xl bg-[#010080] hover:bg-[#02029a] text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {busyPdf ? (
                            <IonSpinner name="dots" className="w-4 h-4 text-white" />
                          ) : (
                            <>
                              <IonIcon
                                icon={downloadOutline}
                                className="text-sm"
                              />
                              <span>PDF</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDescargarXml(item)}
                          disabled={Boolean(accionActiva)}
                          title={`Descargar XML ${item.idCfdi}`}
                          className="min-h-9 px-2 py-1.5 rounded-xl bg-[#0b5ed7] hover:bg-[#0a58ca] text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {busyXml ? (
                            <IonSpinner name="dots" className="w-4 h-4 text-white" />
                          ) : (
                            <>
                              <IonIcon
                                icon={codeSlashOutline}
                                className="text-sm"
                              />
                              <span>XML</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onEnviarCorreo(item)}
                          disabled={Boolean(accionActiva)}
                          title={`Enviar por correo ${item.idCfdi}`}
                          aria-label={`Enviar correo ${item.idCfdi}`}
                          className="min-h-9 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                        >
                          {busyMail ? (
                            <IonSpinner name="dots" className="w-4 h-4" />
                          ) : (
                            <>
                              <IonIcon icon={mailOutline} className="text-sm" />
                              <span>Correo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item, idx) => {
          const fechaInfo = formatFechaItem(item);
          const busyVer = accionActiva === `${item.idCfdi}:ver`;
          const busyPdf = accionActiva === `${item.idCfdi}:pdf`;
          const busyXml = accionActiva === `${item.idCfdi}:xml`;
          const busyMail = accionActiva === `${item.idCfdi}:mail`;

          return (
            <article
              key={`${item.idCfdi}-card-${idx}`}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-black text-[#010080]">
                      {item.idCfdi}
                    </span>
                    {fechaInfo.pendienteTimbre && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Sin timbre PAC
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">
                    {item.sucursalDesc || `Sucursal ${item.sucursal}`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Total
                  </span>
                  <span className="text-base font-black text-[#010080] tabular-nums">
                    {formatMoney(item.total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    RFC Receptor
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {item.rfcReceptor || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Ticket / Orden
                  </span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {item.orden > 0 ? `#${item.orden}` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Fecha
                  </span>
                  <span className="text-slate-700">{fechaInfo.texto}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Subtotal · IVA
                  </span>
                  <span className="text-slate-700 tabular-nums">
                    {formatMoney(item.subTotal)} · {formatMoney(item.ivaImporte)}
                  </span>
                </div>

                {item.uuid && (
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      UUID SAT
                    </span>
                    <span className="font-mono text-[11px] text-slate-600 break-all">
                      {item.uuid}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onVerPdf(item)}
                  disabled={Boolean(accionActiva)}
                  className="min-h-10 px-3 py-2 rounded-xl bg-[#eef5ff] hover:bg-[#dceafe] border border-[#b6d4fe] text-[#010080] font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {busyVer ? (
                    <IonSpinner name="dots" className="w-4 h-4" />
                  ) : (
                    <>
                      <IonIcon icon={eyeOutline} className="text-base" />
                      <span>Ver PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDescargarPdf(item)}
                  disabled={Boolean(accionActiva)}
                  className="min-h-10 px-3 py-2 rounded-xl bg-[#010080] hover:bg-[#02029a] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {busyPdf ? (
                    <IonSpinner name="dots" className="w-4 h-4 text-white" />
                  ) : (
                    <>
                      <IonIcon icon={downloadOutline} className="text-base" />
                      <span>PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDescargarXml(item)}
                  disabled={Boolean(accionActiva)}
                  className="min-h-10 px-3 py-2 rounded-xl bg-[#0b5ed7] hover:bg-[#0a58ca] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {busyXml ? (
                    <IonSpinner name="dots" className="w-4 h-4 text-white" />
                  ) : (
                    <>
                      <IonIcon icon={codeSlashOutline} className="text-base" />
                      <span>XML</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onEnviarCorreo(item)}
                  disabled={Boolean(accionActiva)}
                  className="min-h-10 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {busyMail ? (
                    <IonSpinner name="dots" className="w-4 h-4" />
                  ) : (
                    <>
                      <IonIcon icon={mailOutline} className="text-base" />
                      <span>Enviar Correo</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
