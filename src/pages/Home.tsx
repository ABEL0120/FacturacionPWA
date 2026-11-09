import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonSpinner,
} from "@ionic/react";
import { facturacionApi, TicketBusquedaParams } from "../api/facturacionApi";

export const Home: React.FC = () => {
  const [sucursal, setSucursal] = useState<string>("NaN");
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
      // Estructura lista para conectar con la API cuando esté disponible
      const params: TicketBusquedaParams = {
        sucursal,
        folio: folio.trim(),
        monto: monto.trim(),
      };
      
      // Llamada preparada
      // await facturacionApi.buscarTicket(params);
      setMensaje(`Buscando ticket folio: ${folio} con monto: $${monto}`);
    } catch (err: any) {
      setMensaje(err.message || "Error al buscar el ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      {/* Barra superior estilo El Tizoncito */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "#142642", "--color": "#ffffff" }} className="px-4 py-1">
          <div className="flex items-center gap-3">
            {/* Logo de trompo / flama */}
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-white text-white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C10.5 4 8 7 8 10c0 1.8.8 3.4 2 4.5V19c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-4.5c1.2-1.1 2-2.7 2-4.5 0-3-2.5-6-4-8zm-1 19h2v2h-2v-2z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-sans">
                EL TIZONCITO
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider text-orange-400 font-bold uppercase">
                LOS CREADORES DEL TACO AL PASTOR
              </span>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-white" style={{ "--background": "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          {/* Título */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Facturación en línea
          </h1>

          {/* Banner de aviso naranja */}
          <div className="bg-[#f2720c] text-white px-4 py-3 rounded-md flex items-center gap-3 shadow-sm">
            <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
              !
            </div>
            <p className="text-xs sm:text-sm font-medium leading-snug">
              Solo cuenta con el mes en el que realizó su consumo para facturar
            </p>
          </div>

          {/* Subtítulo del formulario */}
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Introduce los datos de tu ticket para facturar:
          </p>

          {/* Formulario de búsqueda de ticket */}
          <form onSubmit={handleBuscar}>
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 sm:gap-4">
              {/* Sucursal */}
              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Sucursal
                </label>
                <div className="relative">
                  <select
                    value={sucursal}
                    onChange={(e) => setSucursal(e.target.value)}
                    className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="NaN">NaN</option>
                    <option value="1">Sucursal 1</option>
                    <option value="2">Sucursal 2</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
                    <svg
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Folio de Ticket */}
              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Folio de Ticket
                </label>
                <input
                  type="text"
                  placeholder="#"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Monto Total */}
              <div className="relative flex-1">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] font-medium text-slate-500 z-10">
                  Monto Total
                </label>
                <input
                  type="text"
                  placeholder="$"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-md bg-white text-slate-800 text-sm focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>

              {/* Botón Buscar */}
              <div className="shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto h-11 px-8 bg-[#449d44] hover:bg-[#398439] active:bg-[#255625] text-white font-bold text-sm rounded-md transition-colors shadow-sm flex items-center justify-center uppercase tracking-wide disabled:opacity-50"
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

          {/* Mensaje o feedback provisional */}
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
