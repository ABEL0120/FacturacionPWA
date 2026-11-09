import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { logOutOutline, logInOutline } from "ionicons/icons";
import { facturacionApi, TicketBusquedaParams } from "../api/facturacionApi";
import { VentioLogo } from "../components/VentioLogo";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();

  const [sucursal, setSucursal] = useState<string>("1");
  const [folio, setFolio] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folio.trim() || !monto.trim()) {
      setMensaje("Por favor ingresa el folio y monto del ticket.");
      return;
    }

    setLoading(true);
    setMensaje(null);

    try {
      const params: TicketBusquedaParams = {
        sucursal,
        folio: folio.trim(),
        monto: monto.trim(),
      };

      setMensaje(`Buscando ticket folio: ${folio} con monto: $${monto}`);
    } catch (err: any) {
      setMensaje(err.message || "Error al buscar el ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="ventio-toolbar px-2 py-1">
          <IonButtons slot="start">
            <IonMenuButton
              autoHide={false}
              style={{ color: "#ffffff", "--color": "#ffffff" }}
              className="text-white mr-1"
            />
          </IonButtons>
          <div className="flex items-center gap-3">
            <VentioLogo className="w-8 h-8 shrink-0 drop-shadow" variant="white" />
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-sans">
                VENTIO
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-[#38bdf8] font-bold uppercase">
                FACTURACIÓN ELECTRÓNICA CFDI 4.0
              </span>
            </div>
          </div>
          <IonButtons slot="end">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  history.replace("/login");
                  logout();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
              >
                <IonIcon icon={logOutOutline} className="text-sm" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => history.push("/login")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b5ed7] hover:bg-[#0a58ca] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <IonIcon icon={logInOutline} className="text-sm" />
                <span>Acceder</span>
              </button>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-white" style={{ "--background": "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Sesión iniciada como:
                </p>
                <p className="text-sm font-black text-slate-800">
                  {user.nombre || user.email}
                </p>
              </div>
              {user.rfc && (
                <span className="px-2.5 py-1 bg-[#010080] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                  RFC: {user.rfc}
                </span>
              )}
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Facturación en línea
          </h1>

          <div className="bg-gradient-to-r from-[#010080] to-[#0b5ed7] text-white px-4 py-3.5 rounded-xl flex items-center gap-3 shadow-md shadow-[#010080]/15">
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
              !
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Solo cuenta con el mes en el que realizó su consumo para facturar
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Introduce los datos de tu ticket para facturar:
          </p>

          <form onSubmit={handleBuscar}>
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4">
              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Sucursal
                </label>
                <div className="relative">
                  <select
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-1 focus:ring-[#0b5ed7] appearance-none cursor-pointer"
                  >
                    <option value="1">Sucursal 1</option>
                    <option value="2">Sucursal 2</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Folio de Ticket
                </label>
                <input
                  type="text"
                  placeholder="#"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-1 focus:ring-[#0b5ed7] placeholder:text-slate-400"
                />
              </div>

              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Monto Total
                </label>
                <input
                  type="text"
                  placeholder="$"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-1 focus:ring-[#0b5ed7] placeholder:text-slate-400"
                />
              </div>

              <div className="shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto h-11 px-8 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-bold text-sm rounded-md transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center uppercase tracking-wide disabled:opacity-50"
                >
                  {loading ? (
                    <IonSpinner name="dots" className="text-white h-5" />
                  ) : (
                    "BUSCAR"
                  )}
                </button>
              </div>
            </div>
          </form>

          {mensaje && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-700">
              {mensaje}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
