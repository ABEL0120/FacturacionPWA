import React from "react";
import { UserSession } from "../../types/auth.types";
import { FactTicketInitResponseDto } from "../../types/facturacion.types";

interface SessionInfoCardProps {
  user: UserSession;
  initData: FactTicketInitResponseDto | null;
  rfcActivo?: string | null;
}

export const SessionInfoCard: React.FC<SessionInfoCardProps> = ({
  user,
  initData,
  rfcActivo,
}) => {
  const rfcMostrar = rfcActivo || user.rfc;

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium">
          Sesión iniciada como:
        </p>
        <p className="text-sm font-black text-slate-800 truncate">
          {user.nombre || user.email}
        </p>
        {initData?.emisorRazonSocial && (
          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            Emisor: {initData.emisorRazonSocial} ({initData.emisorRfc})
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        {user.moduloDestino === "Menu" && (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black rounded-lg uppercase tracking-wider">
            Menú Admin
          </span>
        )}
        {rfcMostrar && (
          <span className="px-2.5 py-1 bg-[#010080] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
            RFC: {rfcMostrar}
          </span>
        )}
      </div>
    </div>
  );
};

