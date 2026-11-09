import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonSpinner,
  IonIcon,
  useIonToast,
  IonModal,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  logOutOutline,
  logInOutline,
  receiptOutline,
  searchOutline,
  businessOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  arrowBackOutline,
  downloadOutline,
  documentTextOutline,
  mailOutline,
  alertCircleOutline,
  refreshOutline,
  addCircleOutline,
  closeOutline,
  cardOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { VentioLogo } from "../components/VentioLogo";
import { useAuth } from "../context/AuthContext";
import {
  facturacionService,
  TicketInfo,
  ClienteFiscal,
  FacturaGenerada,
} from "../services/facturacionService";

export const Home: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();
  const [present] = useIonToast();

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);

  const [serie, setSerie] = useState<string>("A");
  const [folio, setFolio] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<boolean>(false);

  const [rfcBusqueda, setRfcBusqueda] = useState<string>("");
  const [cliente, setCliente] = useState<ClienteFiscal | null>(null);
  const [loadingRfc, setLoadingRfc] = useState<boolean>(false);
  const [rfcNoRegistrado, setRfcNoRegistrado] = useState<boolean>(false);
  const [modalRegistro, setModalRegistro] = useState<boolean>(false);

  const [nuevoRfc, setNuevoRfc] = useState<string>("");
  const [nuevoRazonSocial, setNuevoRazonSocial] = useState<string>("");
  const [nuevoDireccion, setNuevoDireccion] = useState<string>("");
  const [nuevoNoExt, setNuevoNoExt] = useState<string>("");
  const [nuevoNoInt, setNuevoNoInt] = useState<string>("");
  const [nuevoColonia, setNuevoColonia] = useState<string>("");
  const [nuevoCp, setNuevoCp] = useState<string>("");
  const [nuevoMunicipio, setNuevoMunicipio] = useState<string>("");
  const [nuevoCiudad, setNuevoCiudad] = useState<string>("");
  const [nuevoEstado, setNuevoEstado] = useState<string>("Coahuila");
  const [nuevoRegimen, setNuevoRegimen] = useState<string>("612");
  const [nuevoEmail, setNuevoEmail] = useState<string>("");
  const [nuevoTelefono, setNuevoTelefono] = useState<string>("");
  const [loadingGuardarRfc, setLoadingGuardarRfc] = useState<boolean>(false);

  const [regimenFiscal, setRegimenFiscal] = useState<string>("612");
  const [usoCfdi, setUsoCfdi] = useState<string>("G03");
  const [formaPago, setFormaPago] = useState<string>("01");
  const [emailEnvio, setEmailEnvio] = useState<string>("");
  const [loadingGenerar, setLoadingGenerar] = useState<boolean>(false);

  const [facturaEmitida, setFacturaEmitida] = useState<FacturaGenerada | null>(null);

  useEffect(() => {
    if (user?.rfc) {
      setRfcBusqueda(user.rfc);
    }
    if (user?.email) {
      setEmailEnvio(user.email);
    }
  }, [user]);

  const handleBuscarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folio.trim()) {
      present({
        message: "Por favor ingresa el folio del ticket.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!monto.trim() || Number(monto) <= 0) {
      present({
        message: "Por favor ingresa el monto total válido del ticket.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoadingTicket(true);
    try {
      const ticketInfo = await facturacionService.buscarTicket(
        serie,
        folio,
        Number(monto)
      );
      setTicket(ticketInfo);
      present({
        message: "¡Ticket encontrado y validado con éxito!",
        duration: 2000,
        color: "success",
        position: "top",
      });
    } catch (err: any) {
      present({
        message: err.message || "Error al buscar el ticket.",
        duration: 3000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleBuscarRfc = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rfcLimpio = rfcBusqueda.trim().toUpperCase();

    if (!rfcLimpio || rfcLimpio.length < 12) {
      present({
        message: "Ingresa un RFC válido de 12 o 13 caracteres.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoadingRfc(true);
    setRfcNoRegistrado(false);

    try {
      const res = await facturacionService.buscarRfc(rfcLimpio);
      if (res) {
        setCliente(res);
        setRegimenFiscal(res.regimenFiscal || "612");
        setUsoCfdi(res.usoCfdi || "G03");
        setFormaPago(res.formaPago || "01");
        setEmailEnvio(res.email || user?.email || "");
        present({
          message: `RFC ${res.rfc} verificado correctamente.`,
          duration: 2000,
          color: "success",
          position: "top",
        });
      } else {
        setCliente(null);
        setRfcNoRegistrado(true);
        setNuevoRfc(rfcLimpio);
        setNuevoEmail(user?.email || "");
        setNuevoTelefono(user?.telefono || "");
        present({
          message: `El RFC ${rfcLimpio} no está registrado en el catálogo.`,
          duration: 3000,
          color: "warning",
          position: "top",
        });
      }
    } catch {
      present({
        message: "Error al consultar el RFC.",
        duration: 3000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingRfc(false);
    }
  };

  const handleGuardarNuevoCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevoRfc.trim() || nuevoRfc.trim().length < 12) {
      present({
        message: "Ingresa un RFC válido de 12 o 13 caracteres.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!nuevoRazonSocial.trim()) {
      present({
        message: "Ingresa la Razón Social o Nombre Completo.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!nuevoCp.trim() || nuevoCp.trim().length !== 5) {
      present({
        message: "Ingresa un Código Postal válido de 5 dígitos.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoadingGuardarRfc(true);
    try {
      const guardado = await facturacionService.guardarNuevoRfc({
        rfc: nuevoRfc.trim().toUpperCase(),
        razonSocial: nuevoRazonSocial.trim().toUpperCase(),
        direccion: nuevoDireccion.trim() || "Domicilio Conocido",
        noExterior: nuevoNoExt.trim() || "S/N",
        noInterior: nuevoNoInt.trim(),
        colonia: nuevoColonia.trim() || "Centro",
        cp: nuevoCp.trim(),
        municipio: nuevoMunicipio.trim() || "Torreón",
        ciudad: nuevoCiudad.trim() || "Torreón",
        estado: nuevoEstado.trim() || "Coahuila",
        regimenFiscal: nuevoRegimen,
        email: nuevoEmail.trim(),
        telefono: nuevoTelefono.trim(),
      });

      setCliente(guardado);
      setRfcBusqueda(guardado.rfc);
      setRegimenFiscal(guardado.regimenFiscal);
      setEmailEnvio(guardado.email);
      setRfcNoRegistrado(false);
      setModalRegistro(false);

      present({
        message: "¡Cliente fiscal registrado exitosamente!",
        duration: 2500,
        color: "success",
        position: "top",
      });
    } catch {
      present({
        message: "No fue posible guardar el registro fiscal.",
        duration: 3000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingGuardarRfc(false);
    }
  };

  const handleGenerarFactura = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticket || !cliente) {
      present({
        message: "Datos incompletos para generar la factura.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!regimenFiscal) {
      present({
        message: "Selecciona el Régimen Fiscal de la factura.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!usoCfdi) {
      present({
        message: "Selecciona el Uso de CFDI (Tipo de Gasto).",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoadingGenerar(true);
    try {
      const factura = await facturacionService.generarFactura(
        ticket,
        cliente,
        regimenFiscal,
        usoCfdi,
        formaPago
      );
      setFacturaEmitida(factura);
      setPaso(4);
      present({
        message: "¡Factura generada y timbrada exitosamente!",
        duration: 3000,
        color: "success",
        position: "top",
      });
    } catch {
      present({
        message: "Error al generar la factura. Intenta de nuevo.",
        duration: 3000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingGenerar(false);
    }
  };

  const handleReiniciar = () => {
    setPaso(1);
    setFolio("");
    setMonto("");
    setTicket(null);
    setCliente(null);
    setRfcNoRegistrado(false);
    setFacturaEmitida(null);
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
            <VentioLogo
              className="w-8 h-8 shrink-0 drop-shadow"
              variant="white"
            />
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
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
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

          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div
              className={`flex items-center gap-2 text-xs font-black transition-all ${
                paso === 1
                  ? "text-[#010080]"
                  : paso > 1
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  paso === 1
                    ? "bg-[#010080] text-white"
                    : paso > 1
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {paso > 1 ? (
                  <IonIcon icon={checkmarkCircleOutline} className="text-sm" />
                ) : (
                  "1"
                )}
              </div>
              <span className="hidden sm:inline">1. Ticket</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

            <div
              className={`flex items-center gap-2 text-xs font-black transition-all ${
                paso === 2
                  ? "text-[#010080]"
                  : paso > 2
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  paso === 2
                    ? "bg-[#010080] text-white"
                    : paso > 2
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {paso > 2 ? (
                  <IonIcon icon={checkmarkCircleOutline} className="text-sm" />
                ) : (
                  "2"
                )}
              </div>
              <span className="hidden sm:inline">2. RFC Receptor</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

            <div
              className={`flex items-center gap-2 text-xs font-black transition-all ${
                paso === 3
                  ? "text-[#010080]"
                  : paso > 3
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  paso === 3
                    ? "bg-[#010080] text-white"
                    : paso > 3
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {paso > 3 ? (
                  <IonIcon icon={checkmarkCircleOutline} className="text-sm" />
                ) : (
                  "3"
                )}
              </div>
              <span className="hidden sm:inline">3. Régimen y Emisión</span>
            </div>
          </div>

          {paso === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  Paso 1: Búsqueda del Ticket
                </h1>
                <p className="text-xs text-slate-500">
                  Ingresa la serie, folio y monto total tal como aparece en tu comprobante de compra
                </p>
              </div>

              <div className="bg-gradient-to-r from-[#010080] to-[#0b5ed7] text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md shadow-[#010080]/15">
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  !
                </div>
                <p className="text-xs sm:text-sm font-medium leading-snug">
                  Solo cuentas con el mes en el que realizaste tu consumo para emitir tu factura.
                </p>
              </div>

              <form
                onSubmit={handleBuscarTicket}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Serie del Ticket
                    </label>
                    <input
                      type="text"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value.toUpperCase())}
                      placeholder="A"
                      className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold uppercase focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Folio del Ticket *
                    </label>
                    <input
                      type="text"
                      value={folio}
                      onChange={(e) => setFolio(e.target.value)}
                      placeholder="10492"
                      className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Monto Total *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="350.00"
                      className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingTicket}
                  className="w-full h-12 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                >
                  {loadingTicket ? (
                    <IonSpinner name="dots" className="text-white h-5" />
                  ) : (
                    <>
                      <IonIcon icon={searchOutline} className="text-lg" />
                      <span>Cargar Información del Ticket</span>
                    </>
                  )}
                </button>
              </form>

              {ticket && (
                <div className="bg-[#eef5ff] border-2 border-[#b6d4fe] rounded-3xl p-6 sm:p-8 space-y-5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#b6d4fe]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#010080] text-white flex items-center justify-center shadow-md">
                        <IonIcon icon={receiptOutline} className="text-2xl text-[#38bdf8]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#010080] uppercase tracking-wider">
                          Ticket Encontrado
                        </span>
                        <h3 className="text-lg font-black text-slate-800">
                          {ticket.serie}-{ticket.folio}
                        </h3>
                        <p className="text-xs text-slate-500">{ticket.sucursal} • {ticket.fecha}</p>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black self-start sm:self-auto flex items-center gap-1.5 border border-emerald-200">
                      <IonIcon icon={checkmarkCircleOutline} className="text-sm text-emerald-600" />
                      <span>Ticket Válido para Facturar</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-[#010080]">
                      Desglose de Partidas:
                    </p>
                    <div className="space-y-2">
                      {ticket.conceptos.map((item) => (
                        <div
                          key={item.numero}
                          className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {item.descripcion}
                            </span>
                            <span className="text-slate-500">
                              Clave SAT: {item.claveSat} • Cant: {item.cantidad}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-800 block">
                              ${item.importe.toFixed(2)}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              IVA: ${item.iva.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <div className="w-60 bg-white rounded-xl p-3 border border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-bold">${ticket.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>IVA (16%):</span>
                          <span className="font-bold">${ticket.iva.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-black text-sm text-[#010080] pt-1 border-t border-slate-100">
                          <span>TOTAL:</span>
                          <span>${ticket.monto.toFixed(2)} MXN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#b6d4fe] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPaso(2)}
                      className="w-full sm:w-auto h-12 px-8 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <span>Continuar a Datos Fiscales</span>
                      <IonIcon icon={arrowForwardOutline} className="text-base" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 2 && ticket && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#010080] transition-colors"
                >
                  <IonIcon icon={arrowBackOutline} className="text-base" />
                  <span>Volver a datos del Ticket</span>
                </button>

                <span className="text-xs font-black text-[#010080]">
                  Ticket: {ticket.serie}-{ticket.folio} (${ticket.monto.toFixed(2)})
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  Paso 2: Asociación del RFC Receptor
                </h1>
                <p className="text-xs text-slate-500">
                  Ingresa tu RFC. Si ya está registrado se cargarán tus datos, o podrás registrarlo fácilmente.
                </p>
              </div>

              <form
                onSubmit={handleBuscarRfc}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    RFC Receptor *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      maxLength={13}
                      value={rfcBusqueda}
                      onChange={(e) => setRfcBusqueda(e.target.value.toUpperCase())}
                      placeholder="XAXX010101000"
                      className="flex-1 h-12 px-4 rounded-xl border border-slate-300 text-sm font-bold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                    />

                    <button
                      type="submit"
                      disabled={loadingRfc}
                      className="h-12 px-8 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                    >
                      {loadingRfc ? (
                        <IonSpinner name="dots" className="text-white h-5" />
                      ) : (
                        <>
                          <IonIcon icon={searchOutline} className="text-base" />
                          <span>Buscar RFC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {user?.rfc && user.rfc !== rfcBusqueda && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRfcBusqueda(user.rfc || "");
                      }}
                      className="text-xs font-bold text-[#0b5ed7] hover:underline flex items-center gap-1.5"
                    >
                      <IonIcon icon={businessOutline} className="text-sm" />
                      <span>Usar mi RFC de perfil: {user.rfc}</span>
                    </button>
                  </div>
                )}
              </form>

              {cliente && (
                <div className="bg-[#eef5ff] border-2 border-[#b6d4fe] rounded-3xl p-6 sm:p-8 space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between pb-4 border-b border-[#b6d4fe]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#010080] text-white flex items-center justify-center shadow-md">
                        <IonIcon icon={businessOutline} className="text-2xl text-[#38bdf8]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#010080] uppercase tracking-wider">
                          Contribuyente Encontrado
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-800">
                          {cliente.razonSocial}
                        </h3>
                        <p className="text-xs text-slate-600 font-bold">RFC: {cliente.rfc}</p>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-200">
                      <IonIcon icon={checkmarkCircleOutline} className="text-sm text-emerald-600" />
                      <span className="hidden sm:inline">RFC Activo</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Domicilio Fiscal (CP):</span>
                      <span className="font-bold text-slate-800">{cliente.cp} • {cliente.colonia}, {cliente.municipio}, {cliente.estado}</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Régimen Fiscal Asignado:</span>
                      <span className="font-bold text-slate-800">{cliente.regimenFiscal}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#b6d4fe] flex flex-col sm:flex-row justify-between items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCliente(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      Buscar otro RFC
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaso(3)}
                      className="w-full sm:w-auto h-12 px-8 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <span>Confirmar RFC y Continuar</span>
                      <IonIcon icon={arrowForwardOutline} className="text-base" />
                    </button>
                  </div>
                </div>
              )}

              {rfcNoRegistrado && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <IonIcon icon={alertCircleOutline} className="text-3xl text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-amber-900">
                        RFC no registrado en el sistema
                      </h3>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        El RFC <strong>{rfcBusqueda}</strong> no se encuentra en el catálogo. Para poder emitir tu comprobante CFDI 4.0 es necesario darlo de alta con tus datos fiscales oficiales.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setModalRegistro(true)}
                      className="h-12 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <IonIcon icon={addCircleOutline} className="text-lg text-[#38bdf8]" />
                      <span>Registrar este RFC Ahora</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRfcNoRegistrado(false)}
                      className="h-12 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors border border-slate-200"
                    >
                      Intentar con otro RFC
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 3 && ticket && cliente && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#010080] transition-colors"
                >
                  <IonIcon icon={arrowBackOutline} className="text-base" />
                  <span>Cambiar RFC Receptor</span>
                </button>

                <span className="text-xs font-black text-[#010080]">
                  Receptor: {cliente.rfc}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  Paso 3: Régimen Fiscal y Tipo de Gasto
                </h1>
                <p className="text-xs text-slate-500">
                  Configura el régimen fiscal del receptor y el uso que tendrá el comprobante para emitir tu factura
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider">
                    Ticket a Facturar
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {ticket.serie}-{ticket.folio} • ${ticket.monto.toFixed(2)} MXN
                  </p>
                  <p className="text-slate-500">
                    Subtotal: ${ticket.subtotal.toFixed(2)} • IVA: ${ticket.iva.toFixed(2)}
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
                    RFC: {cliente.rfc} • CP: {cliente.cp}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleGenerarFactura}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Régimen Fiscal del Receptor *
                    </label>
                    <select
                      value={regimenFiscal}
                      onChange={(e) => setRegimenFiscal(e.target.value)}
                      className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                      <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                      <option value="606">606 - Arrendamiento</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                      <option value="621">621 - Incorporación Fiscal</option>
                      <option value="625">625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                      <option value="616">616 - Sin obligaciones fiscales</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tipo de Gasto / Uso de CFDI *
                    </label>
                    <select
                      value={usoCfdi}
                      onChange={(e) => setUsoCfdi(e.target.value)}
                      className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="D01">D01 - Honorarios médicos, dentales y gastos hospitalarios</option>
                      <option value="D02">D02 - Gastos médicos por incapacidad o discapacidad</option>
                      <option value="D04">D04 - Donativos</option>
                      <option value="D07">D07 - Primas por seguros de gastos médicos</option>
                      <option value="D08">D08 - Gastos de transportación escolar obligatoria</option>
                      <option value="D10">D10 - Pagos por servicios educativos (colegiaturas)</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                      <option value="CP01">CP01 - Pagos</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Forma de Pago
                      </label>
                      <select
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                        className="w-full h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                      >
                        <option value="01">01 - Efectivo</option>
                        <option value="02">02 - Cheque nominativo</option>
                        <option value="03">03 - Transferencia electrónica</option>
                        <option value="04">04 - Tarjeta de crédito</option>
                        <option value="28">28 - Tarjeta de débito</option>
                        <option value="99">99 - Por definir</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Correo de Envío (PDF y XML)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">
                          <IonIcon icon={mailOutline} className="text-lg" />
                        </span>
                        <input
                          type="email"
                          value={emailEnvio}
                          onChange={(e) => setEmailEnvio(e.target.value)}
                          placeholder="factura@cliente.com"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loadingGenerar}
                    className="flex-1 h-12 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#010080]/25 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {loadingGenerar ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon icon={shieldCheckmarkOutline} className="text-lg text-[#38bdf8]" />
                        <span>Generar Factura CFDI 4.0</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                  >
                    Atrás
                  </button>
                </div>
              </form>
            </div>
          )}

          {paso === 4 && facturaEmitida && (
            <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-xl shadow-emerald-500/5 space-y-8 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <IonIcon icon={checkmarkCircleOutline} className="text-5xl" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full uppercase tracking-widest border border-emerald-200 inline-block">
                  CFDI 4.0 Timbrado Exitosamente
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  ¡Tu Factura ha sido Generada!
                </h1>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Comprobante fiscal digital por internet generado conforme a las disposiciones del SAT
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Folio y Serie:</span>
                  <span className="font-black text-slate-800 text-sm">
                    {facturaEmitida.serie}-{facturaEmitida.folioFactura}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Folio Fiscal (UUID):</span>
                  <span className="font-bold text-[#010080] text-[11px] select-all">
                    {facturaEmitida.uuid}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Receptor:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[240px]">
                    {facturaEmitida.receptor.razonSocial}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">RFC:</span>
                  <span className="font-black text-slate-800">
                    {facturaEmitida.receptor.rfc}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 font-black text-sm text-[#010080]">
                  <span>Total Facturado:</span>
                  <span>${facturaEmitida.total.toFixed(2)} MXN</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => facturacionService.descargarPdf(facturaEmitida)}
                  className="flex-1 h-12 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <IonIcon icon={downloadOutline} className="text-lg text-[#38bdf8]" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => facturacionService.descargarXml(facturaEmitida)}
                  className="flex-1 h-12 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <IonIcon icon={documentTextOutline} className="text-lg text-white" />
                  <span>Descargar XML</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    present({
                      message: `Factura enviada a ${emailEnvio || facturaEmitida.receptor.email}`,
                      duration: 3000,
                      color: "success",
                      position: "top",
                    });
                  }}
                  className="h-11 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <IonIcon icon={mailOutline} className="text-sm text-[#0b5ed7]" />
                  <span>Reenviar a Correo</span>
                </button>

                <button
                  type="button"
                  onClick={handleReiniciar}
                  className="h-11 px-6 bg-slate-100 hover:bg-slate-200 text-[#010080] font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <IonIcon icon={refreshOutline} className="text-sm" />
                  <span>Facturar Otro Ticket</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <IonModal
          isOpen={modalRegistro}
          onDidDismiss={() => setModalRegistro(false)}
          className="ion-modal-custom"
        >
          <div className="h-full bg-slate-100 overflow-y-auto p-4 sm:p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#010080] text-white flex items-center justify-center">
                    <IonIcon icon={businessOutline} className="text-lg text-[#38bdf8]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      Alta de Cliente Fiscal
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Captura los datos fiscales para emitir la factura del ticket
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRegistro(false)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <IonIcon icon={closeOutline} className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleGuardarNuevoCliente} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">RFC *</label>
                    <input
                      type="text"
                      maxLength={13}
                      value={nuevoRfc}
                      onChange={(e) => setNuevoRfc(e.target.value.toUpperCase())}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Razón Social / Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={nuevoRazonSocial}
                      onChange={(e) => setNuevoRazonSocial(e.target.value)}
                      placeholder="Tal como aparece en Constancia de Situación Fiscal"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700">Calle / Dirección *</label>
                    <input
                      type="text"
                      value={nuevoDireccion}
                      onChange={(e) => setNuevoDireccion(e.target.value)}
                      placeholder="Calle o avenida"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">No. Ext *</label>
                    <input
                      type="text"
                      value={nuevoNoExt}
                      onChange={(e) => setNuevoNoExt(e.target.value)}
                      placeholder="100"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Colonia *</label>
                    <input
                      type="text"
                      value={nuevoColonia}
                      onChange={(e) => setNuevoColonia(e.target.value)}
                      placeholder="Colonia"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">Código Postal (CP) *</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={nuevoCp}
                      onChange={(e) => setNuevoCp(e.target.value.replace(/\D/g, ""))}
                      placeholder="5 dígitos"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Delegación / Municipio *</label>
                    <input
                      type="text"
                      value={nuevoMunicipio}
                      onChange={(e) => setNuevoMunicipio(e.target.value)}
                      placeholder="Municipio"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Estado *</label>
                    <input
                      type="text"
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      placeholder="Estado"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Régimen Fiscal *</label>
                  <select
                    value={nuevoRegimen}
                    onChange={(e) => setNuevoRegimen(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                  >
                    <option value="601">601 - General de Ley Personas Morales</option>
                    <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                    <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados a Salarios</option>
                    <option value="606">606 - Arrendamiento</option>
                    <option value="612">612 - Personas Físicas con Actividades Empresariales y Profesionales</option>
                    <option value="621">621 - Incorporación Fiscal</option>
                    <option value="625">625 - Régimen de Plataformas Tecnológicas</option>
                    <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    <option value="616">616 - Sin obligaciones fiscales</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={nuevoEmail}
                      onChange={(e) => setNuevoEmail(e.target.value)}
                      placeholder="factura@correo.com"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Teléfono / Celular</label>
                    <input
                      type="tel"
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      placeholder="10 dígitos"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loadingGuardarRfc}
                    className="flex-1 h-12 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                  >
                    {loadingGuardarRfc ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon icon={checkmarkCircleOutline} className="text-base" />
                        <span>Guardar RFC y Continuar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalRegistro(false)}
                    className="h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
