import React, { useState, useEffect, useCallback } from "react";
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
  shieldCheckmarkOutline,
  trashOutline,
  eyeOutline,
  warningOutline,
} from "ionicons/icons";
import { VentioLogo } from "../components/VentioLogo";
import { useAuth } from "../context/AuthContext";
import {
  CatalogoItemDto,
  ClienteFiscalDto,
  ClienteRfcItemDto,
  ConsultarTicketRequestDto,
  FactTicketInitResponseDto,
  FacturaTicketResponseDto,
  GenerarFacturaTicketRequestDto,
  MonedaCatalogoDto,
  TicketConsultaResponseDto,
  ValidarTicketsResponseDto,
} from "../api/facturacionApi";
import { facturacionService } from "../services/facturacionService";
import {
  catalogosService,
  DEFAULT_ESTADOS,
  DEFAULT_FORMAS_PAGO,
  DEFAULT_MONEDAS,
  DEFAULT_REGIMENES_FISCALES,
  DEFAULT_USOS_CFDI,
} from "../services/catalogosService";

export const Home: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();
  const [present] = useIonToast();

  const [initData, setInitData] = useState<FactTicketInitResponseDto | null>(null);
  const [loadingInit, setLoadingInit] = useState<boolean>(false);
  const [initError, setInitError] = useState<string>("");

  const [regimenesCatalogo, setRegimenesCatalogo] = useState<CatalogoItemDto[]>(
    DEFAULT_REGIMENES_FISCALES,
  );
  const [usosCfdiCatalogo, setUsosCfdiCatalogo] =
    useState<CatalogoItemDto[]>(DEFAULT_USOS_CFDI);
  const [formasPagoCatalogo, setFormasPagoCatalogo] =
    useState<CatalogoItemDto[]>(DEFAULT_FORMAS_PAGO);
  const [estadosCatalogo, setEstadosCatalogo] =
    useState<CatalogoItemDto[]>(DEFAULT_ESTADOS);
  const [monedasCatalogo, setMonedasCatalogo] =
    useState<MonedaCatalogoDto[]>(DEFAULT_MONEDAS);

  const [rfcsCliente, setRfcsCliente] = useState<ClienteRfcItemDto[]>([]);

  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);

  const [serie, setSerie] = useState<string>("");
  const [folio, setFolio] = useState<string>("");
  const [monto, setMonto] = useState<string>("");
  const [transaccion, setTransaccion] = useState<string>("");
  const [agregarOtroTicket, setAgregarOtroTicket] = useState<boolean>(false);
  const [ticketsSeleccionados, setTicketsSeleccionados] = useState<
    TicketConsultaResponseDto[]
  >([]);
  const [validacionGrupo, setValidacionGrupo] =
    useState<ValidarTicketsResponseDto | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<boolean>(false);
  const [ticketError, setTicketError] = useState<string>("");

  const [rfcBusqueda, setRfcBusqueda] = useState<string>("");
  const [cliente, setCliente] = useState<ClienteFiscalDto | null>(null);
  const [loadingRfc, setLoadingRfc] = useState<boolean>(false);
  const [rfcNoRegistrado, setRfcNoRegistrado] = useState<boolean>(false);
  const [rfcError, setRfcError] = useState<string>("");
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
  const [nuevoUsoCfdi, setNuevoUsoCfdi] = useState<string>("G03");
  const [nuevoFormaPago, setNuevoFormaPago] = useState<string>("01");
  const [nuevoEmail, setNuevoEmail] = useState<string>("");
  const [nuevoTelefono, setNuevoTelefono] = useState<string>("");
  const [loadingGuardarRfc, setLoadingGuardarRfc] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string>("");

  const [regimenFiscal, setRegimenFiscal] = useState<string>("612");
  const [usoCfdi, setUsoCfdi] = useState<string>("G03");
  const [formaPago, setFormaPago] = useState<string>("01");
  const [moneda, setMoneda] = useState<string>("MXN");
  const [tipoCambio, setTipoCambio] = useState<string>("1");
  const [emailEnvio, setEmailEnvio] = useState<string>("");
  const [loadingVistaPrevia, setLoadingVistaPrevia] = useState<boolean>(false);
  const [loadingGenerar, setLoadingGenerar] = useState<boolean>(false);
  const [generarError, setGenerarError] = useState<string>("");

  const [facturaEmitida, setFacturaEmitida] =
    useState<FacturaTicketResponseDto | null>(null);

  const primerTicket = ticketsSeleccionados[0] || null;
  const sucursalResumen = validacionGrupo
    ? validacionGrupo.sucursalNombre
    : primerTicket?.sucursalNombre || "";
  const subtotalResumen = validacionGrupo
    ? validacionGrupo.subtotalTotal
    : primerTicket?.subtotal || 0;
  const descuentoResumen = validacionGrupo
    ? validacionGrupo.descuentoTotal
    : primerTicket?.descuento || 0;
  const ivaResumen = validacionGrupo
    ? validacionGrupo.ivaTotal
    : primerTicket?.iva || 0;
  const totalResumen = validacionGrupo
    ? validacionGrupo.granTotal
    : primerTicket?.total || 0;
  const partidasResumen = validacionGrupo
    ? validacionGrupo.partidas
    : primerTicket?.partidas || [];
  const requiereNotaCreditoResumen = validacionGrupo
    ? validacionGrupo.requiereNotaCredito
    : Boolean(primerTicket?.requiereNotaCredito);
  const formaPagoTicketSat = (
    validacionGrupo
      ? validacionGrupo.formaPagoSat
      : primerTicket?.formaPagoSat || ""
  ).trim();
  const formaPagoTicketDesc = (
    validacionGrupo
      ? validacionGrupo.formaPagoDescripcion
      : primerTicket?.formaPagoDescripcion || ""
  ).trim();

  const resolverEstadoDefault = useCallback(
    (estados: CatalogoItemDto[]): string => {
      const match = estados.find(
        (item) => item.descripcion.trim().toLowerCase() === "coahuila",
      );
      if (match) return match.descripcion;
      return estados.length > 0 ? estados[0].descripcion : "Coahuila";
    },
    [],
  );

  const aplicarDatosCliente = useCallback(
    (c: ClienteFiscalDto, fpTicket?: string) => {
      const reg = c.regimenFiscal?.trim() || "612";
      const uso = c.usoCfdi?.trim() || "G03";
      const fp = c.formaPago?.trim() || "01";
      setCliente({ ...c, regimenFiscal: reg, usoCfdi: uso, formaPago: fp });
      setRfcBusqueda(c.rfc.trim().toUpperCase());
      setRegimenFiscal(reg);
      setUsoCfdi(uso);
      if (!fpTicket) {
        setFormaPago(fp);
      }
      setEmailEnvio(c.mail?.trim() || user?.email || "");
      setRfcNoRegistrado(false);
      setRfcError("");
    },
    [user?.email],
  );

  const cargarInicializacion = useCallback(async () => {
    if (user?.email) {
      setEmailEnvio((prev) => prev || user.email);
    }

    if (user?.numeroCliente && user.numeroCliente > 0) {
      setLoadingInit(true);
      setInitError("");
      try {
        const data = await facturacionService.inicializar(
          user.numeroCliente,
          user.rfc,
        );
        setInitData(data);

        if (data.regimenesFiscales?.length > 0) {
          setRegimenesCatalogo(data.regimenesFiscales);
        }
        if (data.usosCfdi?.length > 0) {
          setUsosCfdiCatalogo(data.usosCfdi);
        }
        if (data.formasPago?.length > 0) {
          setFormasPagoCatalogo(data.formasPago);
        }
        if (data.monedas?.length > 0) {
          setMonedasCatalogo(data.monedas);
        }
        if (data.estadosMexico?.length > 0) {
          setEstadosCatalogo(data.estadosMexico);
          setNuevoEstado(resolverEstadoDefault(data.estadosMexico));
        }

        setRfcsCliente(data.rfcsCliente || []);

        if (data.clienteSeleccionado) {
          aplicarDatosCliente(data.clienteSeleccionado);
        } else if (data.rfcsCliente?.length > 0) {
          setRfcBusqueda(data.rfcsCliente[0].rfc);
        } else if (user.rfc) {
          setRfcBusqueda(user.rfc);
        }
      } catch (err: any) {
        setInitError(err.message || "Error al inicializar catálogos de facturación.");
        const fallback =
          await catalogosService.obtenerCatalogosFactTicketFallback();
        setRegimenesCatalogo(fallback.regimenes);
        setUsosCfdiCatalogo(fallback.usosCfdi);
        setFormasPagoCatalogo(fallback.formasPago);
        setEstadosCatalogo(fallback.estados);
        setMonedasCatalogo(fallback.monedas);
        setNuevoEstado(resolverEstadoDefault(fallback.estados));
        if (user?.rfc) {
          setRfcBusqueda(user.rfc);
        }
      } finally {
        setLoadingInit(false);
      }
      return;
    }

    const fallback = await catalogosService.obtenerCatalogosFactTicketFallback();
    setRegimenesCatalogo(fallback.regimenes);
    setUsosCfdiCatalogo(fallback.usosCfdi);
    setFormasPagoCatalogo(fallback.formasPago);
    setEstadosCatalogo(fallback.estados);
    setMonedasCatalogo(fallback.monedas);
    setNuevoEstado(resolverEstadoDefault(fallback.estados));
    if (user?.rfc) {
      setRfcBusqueda(user.rfc);
    }
  }, [
    user?.numeroCliente,
    user?.rfc,
    user?.email,
    aplicarDatosCliente,
    resolverEstadoDefault,
  ]);

  useEffect(() => {
    cargarInicializacion();
  }, [cargarInicializacion]);

  const toConsultarRequest = (
    t: TicketConsultaResponseDto,
  ): ConsultarTicketRequestDto => ({
    folio: t.folio,
    serie: t.serie || "",
    total: t.total,
    transaccion: t.transaccion || null,
    numeroCliente:
      user?.numeroCliente && user.numeroCliente > 0 ? user.numeroCliente : null,
    mailUsuario: user?.email || null,
  });

  const handleBuscarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError("");

    if (!folio.trim()) {
      const msg = "Por favor ingresa el folio del ticket.";
      setTicketError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return;
    }

    const totalNum = Number(monto);
    if (!monto.trim() || Number.isNaN(totalNum) || totalNum <= 0) {
      const msg = "Por favor ingresa un monto total válido mayor a 0.";
      setTicketError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return;
    }

    const transaccionNum = transaccion.trim() ? Number(transaccion.trim()) : null;
    if (
      transaccion.trim() &&
      (Number.isNaN(transaccionNum) || (transaccionNum ?? 0) <= 0)
    ) {
      const msg = "El número de transacción debe ser un entero positivo.";
      setTicketError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return;
    }

    const requestDto: ConsultarTicketRequestDto = {
      folio: folio.trim(),
      serie: serie.trim(),
      total: totalNum,
      transaccion: transaccionNum,
      numeroCliente:
        user?.numeroCliente && user.numeroCliente > 0 ? user.numeroCliente : null,
      mailUsuario: user?.email || null,
    };

    setLoadingTicket(true);
    try {
      const consultado = await facturacionService.consultarTicket(requestDto);

      if (agregarOtroTicket && ticketsSeleccionados.length > 0) {
        const yaExiste = ticketsSeleccionados.some(
          (t) => t.folio.toUpperCase() === consultado.folio.toUpperCase(),
        );
        if (yaExiste) {
          throw new Error(`El ticket ${consultado.folio} ya está agregado.`);
        }

        const listaSolicitudes = [
          ...ticketsSeleccionados.map(toConsultarRequest),
          requestDto,
        ];
        const grupo = await facturacionService.validarTickets({
          tickets: listaSolicitudes,
          numeroCliente: requestDto.numeroCliente,
          mailUsuario: requestDto.mailUsuario,
        });

        setTicketsSeleccionados((prev) => [...prev, consultado]);
        setValidacionGrupo(grupo);
        setAgregarOtroTicket(false);
        setFolio("");
        setMonto("");
        setTransaccion("");
        present({
          message: `Ticket ${consultado.folio} agregado al comprobante.`,
          duration: 2000,
          color: "success",
          position: "top",
        });
      } else {
        setTicketsSeleccionados([consultado]);
        setValidacionGrupo(null);
        present({
          message: "¡Ticket encontrado y validado con éxito!",
          duration: 2000,
          color: "success",
          position: "top",
        });
      }
    } catch (err: any) {
      const msg = err.message || "Error al consultar el ticket.";
      setTicketError(msg);
      if (!agregarOtroTicket) {
        setTicketsSeleccionados([]);
        setValidacionGrupo(null);
      }
      present({
        message: msg,
        duration: 4000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleQuitarTicket = async (folioQuitar: string) => {
    const restantes = ticketsSeleccionados.filter((t) => t.folio !== folioQuitar);
    setTicketError("");

    if (restantes.length === 0) {
      setTicketsSeleccionados([]);
      setValidacionGrupo(null);
      setAgregarOtroTicket(false);
      return;
    }

    if (restantes.length === 1) {
      setTicketsSeleccionados(restantes);
      setValidacionGrupo(null);
      return;
    }

    setLoadingTicket(true);
    try {
      const grupo = await facturacionService.validarTickets({
        tickets: restantes.map(toConsultarRequest),
        numeroCliente:
          user?.numeroCliente && user.numeroCliente > 0 ? user.numeroCliente : null,
        mailUsuario: user?.email || null,
      });
      setTicketsSeleccionados(restantes);
      setValidacionGrupo(grupo);
    } catch (err: any) {
      setTicketError(err.message || "Error al recalcular los tickets.");
    } finally {
      setLoadingTicket(false);
    }
  };

  const abrirModalRegistroRfc = (rfcInicial: string) => {
    setNuevoRfc(rfcInicial.trim().toUpperCase());
    setNuevoRazonSocial("");
    setNuevoDireccion("");
    setNuevoNoExt("");
    setNuevoNoInt("");
    setNuevoColonia("");
    setNuevoCp("");
    setNuevoMunicipio("");
    setNuevoCiudad("");
    setNuevoEstado(resolverEstadoDefault(estadosCatalogo));
    setNuevoRegimen("612");
    setNuevoUsoCfdi("G03");
    setNuevoFormaPago("01");
    setNuevoEmail(user?.email || "");
    setNuevoTelefono(user?.telefono || "");
    setModalError("");
    setModalRegistro(true);
  };

  const ejecutarBusquedaRfc = async (rfcObjetivo: string) => {
    const rfcLimpio = rfcObjetivo.trim().toUpperCase();
    setRfcError("");

    if (!rfcLimpio || rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      const msg = "Ingresa un RFC válido de 12 o 13 caracteres.";
      setRfcError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return;
    }

    setLoadingRfc(true);
    setRfcNoRegistrado(false);

    try {
      const res = await facturacionService.buscarRfc(rfcLimpio, user?.numeroCliente);
      if (res.existe && res.cliente) {
        aplicarDatosCliente(res.cliente, formaPagoTicketSat);
        present({
          message: `RFC ${res.cliente.rfc} verificado correctamente.`,
          duration: 2000,
          color: "success",
          position: "top",
        });
      } else {
        setCliente(null);
        setRfcNoRegistrado(true);
        abrirModalRegistroRfc(res.rfc || rfcLimpio);
        present({
          message: `El RFC ${res.rfc || rfcLimpio} no está registrado. Completa el registro para continuar.`,
          duration: 3000,
          color: "warning",
          position: "top",
        });
      }
    } catch (err: any) {
      const msg = err.message || "Error al consultar el RFC.";
      setRfcError(msg);
      present({
        message: msg,
        duration: 3500,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingRfc(false);
    }
  };

  const handleBuscarRfc = async (e: React.FormEvent) => {
    e.preventDefault();
    await ejecutarBusquedaRfc(rfcBusqueda);
  };

  const handleGuardarNuevoCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!user?.numeroCliente || user.numeroCliente <= 0) {
      setModalError(
        "Se requiere una sesión de cliente con número de cliente válido para registrar un nuevo RFC.",
      );
      return;
    }

    const rfcLimpio = nuevoRfc.trim().toUpperCase();
    if (!rfcLimpio || rfcLimpio.length < 12 || rfcLimpio.length > 13) {
      setModalError("Ingresa un RFC válido de 12 o 13 caracteres.");
      return;
    }

    if (!nuevoRazonSocial.trim()) {
      setModalError("Ingresa la Razón Social o Nombre Completo.");
      return;
    }

    if (!nuevoCp.trim() || nuevoCp.trim().length !== 5) {
      setModalError("Ingresa un Código Postal válido de 5 dígitos.");
      return;
    }

    setLoadingGuardarRfc(true);
    try {
      const guardado = await facturacionService.registrarRfc({
        numeroCliente: user.numeroCliente,
        rfc: rfcLimpio,
        razonSocial: nuevoRazonSocial.trim().toUpperCase(),
        direccion: nuevoDireccion.trim(),
        numeroExt: nuevoNoExt.trim(),
        numeroInt: nuevoNoInt.trim(),
        colonia: nuevoColonia.trim(),
        delegacion: nuevoMunicipio.trim(),
        ciudad: nuevoCiudad.trim(),
        estado: nuevoEstado.trim() || "Coahuila",
        codigoPostal: nuevoCp.trim(),
        regimenFiscal: nuevoRegimen || "612",
        formaPago: nuevoFormaPago || "01",
        usoCfdi: nuevoUsoCfdi || "G03",
        telefono: nuevoTelefono.trim(),
        mail: nuevoEmail.trim(),
      });

      aplicarDatosCliente(guardado, formaPagoTicketSat);
      setModalRegistro(false);

      if (user.numeroCliente > 0) {
        try {
          const rfcsActualizados = await facturacionService.listarRfcsCliente(
            user.numeroCliente,
          );
          setRfcsCliente(rfcsActualizados);
        } catch {
          setRfcsCliente((prev) => {
            if (prev.some((item) => item.rfc === guardado.rfc)) return prev;
            return [
              ...prev,
              {
                numeroCliente: guardado.numeroCliente,
                rfc: guardado.rfc,
                razonSocial: guardado.razonSocial,
              },
            ];
          });
        }
      }

      present({
        message: "¡RFC registrado con éxito! Continúa con los datos fiscales.",
        duration: 2500,
        color: "success",
        position: "top",
      });

      setPaso(3);
    } catch (err: any) {
      const msg = err.message || "No fue posible guardar el RFC.";
      setModalError(msg);
      present({
        message: msg,
        duration: 3500,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingGuardarRfc(false);
    }
  };

  const validarCamposPaso3 = (): boolean => {
    setGenerarError("");
    if (ticketsSeleccionados.length === 0 || !cliente) {
      const msg = "Datos incompletos de ticket o receptor.";
      setGenerarError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return false;
    }
    if (!regimenFiscal) {
      const msg = "Selecciona el Régimen Fiscal del receptor.";
      setGenerarError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return false;
    }
    if (!usoCfdi) {
      const msg = "Selecciona el Tipo de Gasto / Uso de CFDI.";
      setGenerarError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return false;
    }
    if (!formaPagoTicketSat && !formaPago) {
      const msg = "Selecciona la Forma de Pago.";
      setGenerarError(msg);
      present({ message: msg, duration: 2500, color: "warning", position: "top" });
      return false;
    }
    return true;
  };

  const handleVistaPrevia = async () => {
    if (!validarCamposPaso3()) return;

    setLoadingVistaPrevia(true);
    try {
      const payload = construirPayloadFactura();
      const res = await facturacionService.vistaPrevia(payload);
      setFacturaEmitida(res);
      setPaso(4);
      present({
        message: "Vista previa CFDI 4.0 generada correctamente.",
        duration: 2500,
        color: "primary",
        position: "top",
      });
    } catch (err: any) {
      const msg = err.message || "Error al generar vista previa.";
      setGenerarError(msg);
      present({
        message: msg,
        duration: 3500,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingVistaPrevia(false);
    }
  };

  const construirPayloadFactura = (): GenerarFacturaTicketRequestDto => {
    if (!cliente || ticketsSeleccionados.length === 0) {
      throw new Error("Datos incompletos para emitir la factura.");
    }

    const monedaFinal = moneda.trim().toUpperCase() || "MXN";
    const tipoCambioNum = monedaFinal === "MXN" ? 1.0 : Number(tipoCambio);
    if (monedaFinal !== "MXN" && (Number.isNaN(tipoCambioNum) || tipoCambioNum <= 0)) {
      throw new Error("El tipo de cambio debe ser mayor a 0.");
    }

    return {
      numeroCliente: cliente.numeroCliente || user?.numeroCliente || 0,
      rfc: cliente.rfc,
      regimenFiscal,
      usoCfdi,
      formaPago: formaPagoTicketSat ? formaPagoTicketSat : formaPago || null,
      moneda: monedaFinal,
      tipoCambio: tipoCambioNum,
      mail: emailEnvio.trim() || cliente.mail || user?.email || null,
      razonSocial: cliente.razonSocial || null,
      codigoPostal: cliente.codigoPostal || null,
      direccion: cliente.direccion || null,
      numeroExt: cliente.numeroExt || null,
      numeroInt: cliente.numeroInt || null,
      colonia: cliente.colonia || null,
      ciudad: cliente.ciudad || null,
      delegacion: cliente.delegacion || null,
      estado: cliente.estado || null,
      tickets: ticketsSeleccionados.map((t) => ({
        folio: t.folio,
        serie: t.serie || "",
        total: t.total,
        transaccion: t.transaccion || null,
      })),
    };
  };

  const ejecutarGenerarFactura = async () => {
    if (!validarCamposPaso3()) return;

    setLoadingGenerar(true);
    try {
      const payload = construirPayloadFactura();
      const factura = await facturacionService.generarFactura(payload);
      setFacturaEmitida(factura);
      setCliente((prev) =>
        prev
          ? {
              ...prev,
              regimenFiscal:
                factura.receptor.regimenFiscalReceptor || prev.regimenFiscal,
              usoCfdi: factura.receptor.usoCfdi || prev.usoCfdi,
              mail: factura.receptor.mail || prev.mail,
            }
          : prev,
      );
      setPaso(4);
      present({
        message:
          "Pre-factura CFDI 4.0 generada. Pendiente de firma y timbrado.",
        duration: 3500,
        color: "success",
        position: "top",
      });
    } catch (err: any) {
      const msg = err.message || "Error al generar la factura.";
      setGenerarError(msg);
      present({
        message: msg,
        duration: 4000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoadingGenerar(false);
    }
  };

  const handleGenerarFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    await ejecutarGenerarFactura();
  };

  const handleReiniciar = () => {
    setPaso(1);
    setSerie("");
    setFolio("");
    setMonto("");
    setTransaccion("");
    setAgregarOtroTicket(false);
    setTicketsSeleccionados([]);
    setValidacionGrupo(null);
    setTicketError("");
    setRfcError("");
    setGenerarError("");
    setFacturaEmitida(null);
  };

  const mostrarProcesoPrueba = Boolean(
    initData?.esPrueba || facturaEmitida?.esPrueba,
  );

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="ventio-toolbar px-1 sm:px-2 py-1">
          <IonButtons slot="start">
            <IonMenuButton
              autoHide={false}
              style={{ color: "#ffffff", "--color": "#ffffff" }}
              className="text-white mr-1"
            />
          </IonButtons>
          <div className="flex items-center gap-2.5 min-w-0">
            <VentioLogo
              className="w-8 h-8 shrink-0 drop-shadow"
              variant="white"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white font-sans truncate">
                VENTIO
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wide sm:tracking-wider text-[#38bdf8] font-bold uppercase truncate">
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
                aria-label="Salir"
                className="min-h-10 min-w-10 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <IonIcon
                  icon={logOutOutline}
                  className="text-base sm:text-sm shrink-0"
                />
                <span className="hidden sm:inline">Salir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => history.push("/login")}
                className="min-h-10 px-3.5 py-2 rounded-xl bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              >
                <IonIcon
                  icon={logInOutline}
                  className="text-base sm:text-sm shrink-0"
                />
                <span>Acceder</span>
              </button>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="bg-white" style={{ "--background": "#ffffff" }}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          {isAuthenticated && user && (
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
                {(cliente?.rfc || user.rfc) && (
                  <span className="px-2.5 py-1 bg-[#010080] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                    RFC: {cliente?.rfc || user.rfc}
                  </span>
                )}
              </div>
            </div>
          )}

          {mostrarProcesoPrueba && (
            <div className="bg-amber-50 border-2 border-amber-300 text-amber-950 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
              <IonIcon
                icon={warningOutline}
                className="text-2xl text-amber-600 shrink-0"
              />
              <div className="text-xs leading-snug">
                <strong className="uppercase tracking-wider block font-black">
                  PROCESO DE PRUEBA
                </strong>
                <span>
                  El emisor se encuentra en ambiente de pruebas. Los comprobantes
                  utilizarán serie de prueba y no tienen validez fiscal definitiva.
                </span>
              </div>
            </div>
          )}

          {loadingInit && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#010080] bg-[#eef5ff] px-4 py-2.5 rounded-xl border border-[#b6d4fe]">
              <IonSpinner name="crescent" className="w-4 h-4 text-[#0b5ed7]" />
              <span>Inicializando catálogos SAT y datos fiscales...</span>
            </div>
          )}

          {initError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <IonIcon icon={alertCircleOutline} className="text-lg shrink-0 text-rose-600" />
                <span>{initError}</span>
              </div>
              <button
                type="button"
                onClick={cargarInicializacion}
                className="min-h-9 px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-bold text-rose-700 hover:bg-rose-100 shrink-0"
              >
                Reintentar
              </button>
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
                  Ingresa el folio, serie (si aplica) y total exacto tal como aparece
                  en tu ticket de compra
                </p>
              </div>

              <div className="bg-[#010080] text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md shadow-[#010080]/15">
                <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                  !
                </div>
                <p className="text-xs sm:text-sm font-medium leading-snug">
                  Solo cuentas con el mes en curso para emitir la factura de tu consumo.
                </p>
              </div>

              <form
                onSubmit={handleBuscarTicket}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5"
              >
                {agregarOtroTicket && (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-[#eef5ff] border border-[#b6d4fe] px-3.5 py-2 rounded-xl text-xs">
                    <span className="font-bold text-[#010080]">
                      Agregando un ticket adicional de la misma sucursal ({sucursalResumen})
                    </span>
                    <button
                      type="button"
                      onClick={() => setAgregarOtroTicket(false)}
                      className="text-[#0b5ed7] font-bold hover:underline"
                    >
                      Cancelar adicional
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Folio del Ticket *
                    </label>
                    <input
                      type="text"
                      value={folio}
                      onChange={(e) => setFolio(e.target.value)}
                      placeholder="Ej: LA10000247 o 247"
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Serie (Opcional)
                    </label>
                    <input
                      type="text"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value.toUpperCase())}
                      placeholder="Ej: LA (vacío si no aplica)"
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold uppercase focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Total del Ticket *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="350.00"
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Transacción (Opcional)
                    </label>
                    <input
                      type="number"
                      value={transaccion}
                      onChange={(e) => setTransaccion(e.target.value)}
                      placeholder="Opcional"
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-sm font-bold focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {ticketError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                    <IonIcon
                      icon={alertCircleOutline}
                      className="text-lg text-rose-600 shrink-0 mt-0.5"
                    />
                    <span className="font-semibold leading-snug">{ticketError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingTicket}
                  className="w-full min-h-12 py-3 px-5 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide shrink-0 disabled:opacity-50"
                >
                  {loadingTicket ? (
                    <IonSpinner name="dots" className="text-white h-5" />
                  ) : (
                    <>
                      <IonIcon
                        icon={searchOutline}
                        className="text-lg shrink-0"
                      />
                      <span>
                        {agregarOtroTicket
                          ? "Validar y Agregar Ticket"
                          : "Cargar Información del Ticket"}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {ticketsSeleccionados.length > 0 && (
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
                          {sucursalResumen}
                          {primerTicket?.fecha ? ` • ${primerTicket.fecha}` : ""}
                        </p>
                        {formaPagoTicketSat && (
                          <p className="text-[11px] font-bold text-[#010080] mt-0.5">
                            Forma de Pago SAT: {formaPagoTicketSat}
                            {formaPagoTicketDesc ? ` - ${formaPagoTicketDesc}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black self-start sm:self-auto flex items-center gap-1.5 border border-emerald-200 shrink-0">
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        className="text-sm text-emerald-600 shrink-0"
                      />
                      <span>Válido para Facturar</span>
                    </div>
                  </div>

                  {requiereNotaCreditoResumen && (
                    <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs">
                      <IonIcon
                        icon={warningOutline}
                        className="text-lg text-amber-600 shrink-0 mt-0.5"
                      />
                      <div>
                        <strong className="block font-black">
                          Ticket incluido previamente en Factura Global
                        </strong>
                        <span>
                          Al generar el comprobante se incluirá una Nota de Crédito
                          previa relacionada
                          {primerTicket?.uuidGlobal
                            ? ` (UUID Global: ${primerTicket.uuidGlobal})`
                            : ""}
                          .
                        </span>
                      </div>
                    </div>
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
                              {t.folio} (${t.total.toFixed(2)})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuitarTicket(t.folio)}
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
                      {partidasResumen.map((item, idx) => (
                        <div
                          key={`${item.folio}-${item.numero}-${idx}`}
                          className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 block">
                              {item.descripcion}
                            </span>
                            <span className="text-slate-500 block">
                              Clave SAT: {item.claveProdServSat} • Cant:{" "}
                              {item.cantidad} {item.unidadMedida || item.unidadMedidaSat}
                              {item.exento === "S" ? " • Exento" : ""}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-800 block">
                              ${Number(item.total).toFixed(2)}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              Sub: ${Number(item.subtotal).toFixed(2)} • IVA: $
                              {Number(item.iva).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <div className="w-full sm:w-72 bg-white rounded-xl p-3.5 border border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-bold">
                            ${Number(subtotalResumen).toFixed(2)}
                          </span>
                        </div>
                        {descuentoResumen > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Descuento:</span>
                            <span className="font-bold">
                              -${Number(descuentoResumen).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600">
                          <span>IVA:</span>
                          <span className="font-bold">
                            ${Number(ivaResumen).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-black text-sm text-[#010080] pt-1.5 border-t border-slate-100">
                          <span>TOTAL:</span>
                          <span>${Number(totalResumen).toFixed(2)} MXN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#b6d4fe] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAgregarOtroTicket(true);
                        setFolio("");
                        setMonto("");
                        setTransaccion("");
                        setTicketError("");
                      }}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-5 bg-white hover:bg-slate-100 border border-[#0b5ed7]/40 text-[#010080] font-bold text-xs leading-snug rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <IonIcon icon={addCircleOutline} className="text-base text-[#0b5ed7] shrink-0" />
                      <span>Agregar Otro Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaso(2)}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-8 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <span>Continuar a Datos Fiscales</span>
                      <IonIcon
                        icon={arrowForwardOutline}
                        className="text-base shrink-0"
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 2 && ticketsSeleccionados.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPaso(1)}
                  className="inline-flex items-center gap-1.5 min-h-9 py-1.5 px-2.5 -ml-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-[#010080] hover:bg-slate-100 transition-colors"
                >
                  <IonIcon
                    icon={arrowBackOutline}
                    className="text-base shrink-0"
                  />
                  <span>Volver a datos del Ticket</span>
                </button>

                <span className="text-xs font-black text-[#010080]">
                  Ticket(s): {ticketsSeleccionados.map((t) => t.folio).join(", ")} ($
                  {Number(totalResumen).toFixed(2)})
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
                onSubmit={handleBuscarRfc}
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
                              setRfcBusqueda(item.rfc);
                              ejecutarBusquedaRfc(item.rfc);
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
                        setRfcBusqueda(e.target.value.toUpperCase())
                      }
                      placeholder="XAXX010101000"
                      className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 h-12 px-4 rounded-xl border border-slate-300 text-sm font-bold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                    />

                    <button
                      type="submit"
                      disabled={loadingRfc}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-8 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide whitespace-nowrap disabled:opacity-50"
                    >
                      {loadingRfc ? (
                        <IonSpinner name="dots" className="text-white h-5" />
                      ) : (
                        <>
                          <IonIcon
                            icon={searchOutline}
                            className="text-base shrink-0"
                          />
                          <span>Buscar RFC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {rfcError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                    <IonIcon
                      icon={alertCircleOutline}
                      className="text-lg text-rose-600 shrink-0 mt-0.5"
                    />
                    <span className="font-semibold">{rfcError}</span>
                  </div>
                )}

                {user?.numeroCliente && user.numeroCliente > 0 ? (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => abrirModalRegistroRfc(rfcBusqueda)}
                      className="min-h-9 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#010080] transition-colors inline-flex items-center gap-1.5"
                    >
                      <IonIcon
                        icon={addCircleOutline}
                        className="text-sm text-[#0b5ed7] shrink-0"
                      />
                      <span>Registrar Nuevo RFC</span>
                    </button>
                  </div>
                ) : null}
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

                    <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-200 shrink-0">
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        className="text-sm text-emerald-600 shrink-0"
                      />
                      <span className="hidden sm:inline">RFC Activo</span>
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
                    <button
                      type="button"
                      onClick={() => setCliente(null)}
                      className="w-full sm:w-auto shrink-0 min-h-11 py-2.5 px-5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 transition-colors flex items-center justify-center"
                    >
                      Buscar otro RFC
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaso(3)}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-8 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      <span>Confirmar RFC y Continuar</span>
                      <IonIcon
                        icon={arrowForwardOutline}
                        className="text-base shrink-0"
                      />
                    </button>
                  </div>
                </div>
              )}

              {rfcNoRegistrado && !cliente && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-8 space-y-4 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <IonIcon
                      icon={alertCircleOutline}
                      className="text-3xl text-amber-600 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-base font-black text-amber-900">
                        RFC no registrado en el catálogo
                      </h3>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        El RFC <strong>{rfcBusqueda}</strong> requiere registro previo
                        para emitir el comprobante CFDI 4.0.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => abrirModalRegistroRfc(rfcBusqueda)}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-black text-xs sm:text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide"
                    >
                      <IonIcon
                        icon={addCircleOutline}
                        className="text-lg text-[#38bdf8] shrink-0"
                      />
                      <span>Abrir Formulario de Registro</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRfcNoRegistrado(false)}
                      className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm leading-snug rounded-xl transition-colors border border-slate-200 flex items-center justify-center"
                    >
                      Intentar con otro RFC
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === 3 && ticketsSeleccionados.length > 0 && cliente && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPaso(2)}
                  className="inline-flex items-center gap-1.5 min-h-9 py-1.5 px-2.5 -ml-2.5 rounded-lg text-xs font-bold text-slate-500 hover:text-[#010080] hover:bg-slate-100 transition-colors"
                >
                  <IonIcon
                    icon={arrowBackOutline}
                    className="text-base shrink-0"
                  />
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
                    Ticket(s) a Facturar ({sucursalResumen})
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {ticketsSeleccionados.map((t) => t.folio).join(", ")} • $
                    {Number(totalResumen).toFixed(2)} {moneda}
                  </p>
                  <p className="text-slate-500">
                    Subtotal: ${Number(subtotalResumen).toFixed(2)} • IVA: $
                    {Number(ivaResumen).toFixed(2)}
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
                onSubmit={handleGenerarFactura}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Régimen Fiscal del Receptor *
                    </label>
                    <select
                      value={regimenFiscal}
                      onChange={(e) => setRegimenFiscal(e.target.value)}
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {regimenesCatalogo.map((item) => (
                        <option key={item.numero} value={item.numero}>
                          {item.numero} - {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tipo de Gasto / Uso de CFDI *
                    </label>
                    <select
                      value={usoCfdi}
                      onChange={(e) => setUsoCfdi(e.target.value)}
                      className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {usosCfdiCatalogo.map((item) => (
                        <option key={item.numero} value={item.numero}>
                          {item.numero} - {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Moneda
                      </label>
                      <select
                        value={moneda}
                        onChange={(e) => {
                          const nueva = e.target.value;
                          setMoneda(nueva);
                          if (nueva === "MXN") setTipoCambio("1");
                        }}
                        className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                      >
                        {monedasCatalogo.map((item) => (
                          <option key={item.numero} value={item.numero}>
                            {item.numero} - {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    {moneda !== "MXN" ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Tipo de Cambio *
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={tipoCambio}
                          onChange={(e) => setTipoCambio(e.target.value)}
                          className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Correo de Envío
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                            <IonIcon icon={mailOutline} className="text-lg" />
                          </span>
                          <input
                            type="email"
                            value={emailEnvio}
                            onChange={(e) => setEmailEnvio(e.target.value)}
                            placeholder="factura@cliente.com"
                            className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {moneda !== "MXN" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Correo de Envío
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                          <IonIcon icon={mailOutline} className="text-lg" />
                        </span>
                        <input
                          type="email"
                          value={emailEnvio}
                          onChange={(e) => setEmailEnvio(e.target.value)}
                          placeholder="factura@cliente.com"
                          className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  )}

                  {formaPagoTicketSat ? (
                    <div className="bg-[#eef5ff] border border-[#b6d4fe] rounded-xl p-3.5 text-xs space-y-0.5">
                      <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
                        Forma de Pago (Registrada en Ticket)
                      </span>
                      <p className="font-bold text-slate-800">
                        {formaPagoTicketSat}
                        {formaPagoTicketDesc ? ` - ${formaPagoTicketDesc}` : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Forma de Pago (Respaldo SAT) *
                      </label>
                      <select
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                        className="w-full min-h-12 h-12 px-3 border border-slate-300 rounded-xl bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                      >
                        {formasPagoCatalogo.map((item) => (
                          <option key={item.numero} value={item.numero}>
                            {item.numero} - {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {generarError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                    <IonIcon
                      icon={alertCircleOutline}
                      className="text-lg text-rose-600 shrink-0 mt-0.5"
                    />
                    <span className="font-semibold">{generarError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={loadingVistaPrevia || loadingGenerar}
                    onClick={handleVistaPrevia}
                    className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-5 bg-[#eef5ff] hover:bg-[#dceafe] border border-[#b6d4fe] text-[#010080] font-extrabold text-xs sm:text-sm leading-snug rounded-xl transition-colors flex items-center justify-center gap-2 uppercase tracking-wide whitespace-nowrap disabled:opacity-50"
                  >
                    {loadingVistaPrevia ? (
                      <IonSpinner name="dots" className="text-[#010080] h-5" />
                    ) : (
                      <>
                        <IonIcon icon={eyeOutline} className="text-base shrink-0" />
                        <span>Vista Previa</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={loadingGenerar || loadingVistaPrevia}
                    className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-lg shadow-[#010080]/25 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {loadingGenerar ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon
                          icon={shieldCheckmarkOutline}
                          className="text-lg text-[#38bdf8] shrink-0"
                        />
                        <span>Generar Factura CFDI 4.0</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaso(2)}
                    className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-sm leading-snug rounded-xl transition-colors flex items-center justify-center whitespace-nowrap"
                  >
                    Atrás
                  </button>
                </div>
              </form>
            </div>
          )}

          {paso === 4 && facturaEmitida && (
            <div className="bg-white border-2 border-[#b6d4fe] rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm border-2 ${
                    facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                      ? "bg-[#eef5ff] text-[#0b5ed7] border-[#b6d4fe]"
                      : "bg-amber-50 text-amber-600 border-amber-300"
                  }`}
                >
                  <IonIcon
                    icon={
                      facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                        ? eyeOutline
                        : documentTextOutline
                    }
                    className="text-4xl"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span
                      className={`px-3 py-1 text-[11px] font-black rounded-full uppercase tracking-wider border inline-block ${
                        facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                          ? "bg-[#eef5ff] text-[#010080] border-[#b6d4fe]"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}
                    >
                      {facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                        ? "Vista Previa CFDI 4.0 — Solo lectura"
                        : "Pre-factura CFDI 4.0 generada — Pendiente de firma y timbrado (en espera de datos del timbrador)"}
                    </span>
                    {facturaEmitida.esPrueba && (
                      <span className="px-3 py-1 bg-amber-200 text-amber-950 text-[11px] font-black rounded-full uppercase tracking-wider border border-amber-400">
                        PROCESO DE PRUEBA
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                    {facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                      ? "Vista Previa de Comprobante"
                      : "Estructura CFDI 4.0 Lista"}
                  </h1>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    {facturaEmitida.estadoTimbrado === "VISTA_PREVIA"
                      ? "Verifica todos los datos antes de confirmar y actualizar tu perfil fiscal."
                      : "El XML se ha construido correctamente conforme a CFDI 4.0 y queda pendiente de firma digital y timbrado PAC."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
                    Comprobante
                  </span>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Folio Tentativo:</span>
                    <span className="font-black text-slate-800">
                      {facturaEmitida.serie}-{facturaEmitida.folioTentativo}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Fecha de Emisión:</span>
                    <span className="font-semibold text-slate-800">
                      {facturaEmitida.fechaEmision}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Forma de Pago:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {facturaEmitida.formaPago} - {facturaEmitida.formaPagoDescripcion}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Método / Moneda:</span>
                    <span className="font-semibold text-slate-800">
                      {facturaEmitida.metodoPago} • {facturaEmitida.moneda} (TC{" "}
                      {Number(facturaEmitida.tipoCambio).toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Estado Timbrado:</span>
                    <span className="font-bold text-amber-800">
                      {facturaEmitida.estadoTimbrado}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
                    Emisor y Receptor
                  </span>
                  <div>
                    <span className="text-slate-500 block">Emisor:</span>
                    <span className="font-bold text-slate-800 block">
                      {facturaEmitida.emisor.nombre} ({facturaEmitida.emisor.rfc})
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Régimen: {facturaEmitida.emisor.regimenFiscal} • Lugar Exp.:{" "}
                      {facturaEmitida.lugarExpedicion}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block">Receptor:</span>
                    <span className="font-bold text-slate-800 block">
                      {facturaEmitida.receptor.nombre} (
                      {facturaEmitida.receptor.rfc})
                    </span>
                    <span className="text-slate-500 text-[11px] block">
                      CP: {facturaEmitida.receptor.domicilioFiscalReceptor} •
                      Régimen: {facturaEmitida.receptor.regimenFiscalReceptor} -{" "}
                      {facturaEmitida.receptor.regimenFiscalReceptorDesc}
                    </span>
                    <span className="text-slate-500 text-[11px] block">
                      Uso CFDI: {facturaEmitida.receptor.usoCfdi} -{" "}
                      {facturaEmitida.receptor.usoCfdiDesc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <span className="text-[10px] font-black uppercase text-[#010080] tracking-wider block">
                  Conceptos ({facturaEmitida.conceptos.length})
                </span>
                <div className="space-y-2">
                  {facturaEmitida.conceptos.map((c) => (
                    <div
                      key={c.secuencia}
                      className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 block">
                          {c.descripcion}
                        </span>
                        <span className="text-slate-500">
                          SAT: {c.claveProdServ} • Cant: {c.cantidad} {c.unidad} (
                          {c.claveUnidad}) • P.U.: ${Number(c.valorUnitario).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-black text-slate-800 shrink-0">
                        ${Number(c.importe).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-3">
                  <div className="text-slate-600">
                    <span className="text-[10px] uppercase font-bold block text-slate-500">
                      Importe con Letra:
                    </span>
                    <span className="font-bold text-slate-800">
                      {facturaEmitida.importeConLetra}
                    </span>
                  </div>
                  <div className="sm:text-right space-y-0.5 shrink-0">
                    <div className="text-slate-600">
                      Subtotal:{" "}
                      <strong>${Number(facturaEmitida.subtotal).toFixed(2)}</strong>
                    </div>
                    {facturaEmitida.descuento > 0 && (
                      <div className="text-slate-600">
                        Descuento:{" "}
                        <strong>
                          -${Number(facturaEmitida.descuento).toFixed(2)}
                        </strong>
                      </div>
                    )}
                    <div className="text-slate-600">
                      IVA: <strong>${Number(facturaEmitida.iva).toFixed(2)}</strong>
                    </div>
                    <div className="text-sm font-black text-[#010080]">
                      Total: ${Number(facturaEmitida.total).toFixed(2)}{" "}
                      {facturaEmitida.moneda}
                    </div>
                  </div>
                </div>
              </div>

              {facturaEmitida.notaCreditoPrevia && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <IonIcon
                      icon={warningOutline}
                      className="text-xl text-amber-600 shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="font-black text-amber-950 uppercase tracking-wide block">
                        Nota de Crédito Previa (Ticket proveniente de Factura Global)
                      </span>
                      <p className="text-amber-900">
                        Folio Tentativo:{" "}
                        <strong>
                          {facturaEmitida.notaCreditoPrevia.serie}-
                          {facturaEmitida.notaCreditoPrevia.folioTentativo}
                        </strong>{" "}
                        • Relación SAT: {facturaEmitida.notaCreditoPrevia.tipoRelacion} •
                        Total: $
                        {Number(facturaEmitida.notaCreditoPrevia.total).toFixed(2)}
                      </p>
                      <p className="text-amber-800 break-all">
                        UUIDs Relacionados:{" "}
                        {facturaEmitida.notaCreditoPrevia.uuidsRelacionados}
                      </p>
                    </div>
                  </div>
                  {facturaEmitida.notaCreditoPrevia.xmlSinTimbrar && (
                    <button
                      type="button"
                      onClick={() =>
                        facturacionService.descargarXml(
                          facturaEmitida.notaCreditoPrevia!.xmlSinTimbrar,
                          `PreNotaCredito_${facturaEmitida.notaCreditoPrevia!.serie}_${facturaEmitida.notaCreditoPrevia!.folioTentativo}.xml`,
                        )
                      }
                      className="min-h-10 py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <IonIcon icon={documentTextOutline} className="text-sm shrink-0" />
                      <span>Descargar XML Nota de Crédito Previa</span>
                    </button>
                  )}
                </div>
              )}

              <details className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
                <summary className="font-black text-[#010080] cursor-pointer select-none">
                  Ver Cadena Original CFDI 4.0
                </summary>
                <pre className="mt-3 p-3 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                  {facturaEmitida.cadenaOriginal}
                </pre>
              </details>

              {facturaEmitida.estadoTimbrado === "VISTA_PREVIA" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={loadingGenerar}
                    onClick={ejecutarGenerarFactura}
                    className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-lg shadow-[#010080]/25 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {loadingGenerar ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon
                          icon={shieldCheckmarkOutline}
                          className="text-lg text-[#38bdf8] shrink-0"
                        />
                        <span>Confirmar y Generar Pre-Factura</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaso(3)}
                    className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm leading-snug rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <IonIcon icon={arrowBackOutline} className="text-base shrink-0" />
                    <span>Volver a Editar</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={() =>
                    facturacionService.descargarXml(
                      facturaEmitida.xmlSinTimbrar,
                      `PreFactura_${facturaEmitida.serie}_${facturaEmitida.folioTentativo}_${facturaEmitida.receptor.rfc}.xml`,
                    )
                  }
                  className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#0b5ed7]/25 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <IonIcon
                    icon={documentTextOutline}
                    className="text-lg text-white shrink-0"
                  />
                  <span>Descargar XML</span>
                </button>

                <button
                  type="button"
                  onClick={() => facturacionService.descargarPdf(facturaEmitida)}
                  className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <IonIcon
                    icon={downloadOutline}
                    className="text-lg text-[#38bdf8] shrink-0"
                  />
                  <span>Vista Imprimible / PDF</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center w-full">
                <button
                  type="button"
                  onClick={handleReiniciar}
                  className="w-full sm:w-auto shrink-0 min-h-11 py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-[#010080] font-black text-xs leading-snug rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <IonIcon icon={refreshOutline} className="text-sm shrink-0" />
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
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#010080] text-white flex items-center justify-center shrink-0">
                    <IonIcon
                      icon={businessOutline}
                      className="text-lg text-[#38bdf8]"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-black text-slate-800">
                      Registro de RFC Receptor
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Completa los datos fiscales del RFC
                      {user?.numeroCliente && user.numeroCliente > 0
                        ? ` • Cliente #${user.numeroCliente}`
                        : ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRegistro(false)}
                  aria-label="Cerrar"
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
                >
                  <IonIcon icon={closeOutline} className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleGuardarNuevoCliente} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">
                      Id. Cliente
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.numeroCliente && user.numeroCliente > 0 ? String(user.numeroCliente) : "N/A"}
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-slate-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      RFC *
                    </label>
                    <input
                      type="text"
                      maxLength={13}
                      value={nuevoRfc}
                      onChange={(e) =>
                        setNuevoRfc(e.target.value.toUpperCase())
                      }
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700">
                      Razón Social / Nombre Completo *
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={nuevoRazonSocial}
                      onChange={(e) => setNuevoRazonSocial(e.target.value)}
                      placeholder="Tal como aparece en Constancia de Situación Fiscal"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <div className="space-y-1 sm:col-span-4">
                    <label className="text-xs font-bold text-slate-700">
                      Calle / Dirección
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={nuevoDireccion}
                      onChange={(e) => setNuevoDireccion(e.target.value)}
                      placeholder="Calle o avenida"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">
                      No. Ext.
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={nuevoNoExt}
                      onChange={(e) => setNuevoNoExt(e.target.value)}
                      placeholder="Ext."
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">
                      No. Int.
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={nuevoNoInt}
                      onChange={(e) => setNuevoNoInt(e.target.value)}
                      placeholder="Int."
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Colonia
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={nuevoColonia}
                      onChange={(e) => setNuevoColonia(e.target.value)}
                      placeholder="Colonia"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">
                      Código Postal (CP) *
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={nuevoCp}
                      onChange={(e) =>
                        setNuevoCp(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="5 dígitos"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Delegación / Municipio
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={nuevoMunicipio}
                      onChange={(e) => setNuevoMunicipio(e.target.value)}
                      placeholder="Municipio"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      value={nuevoCiudad}
                      onChange={(e) => setNuevoCiudad(e.target.value)}
                      placeholder="Ciudad"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Estado
                    </label>
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {estadosCatalogo.map((item) => (
                        <option key={item.numero} value={item.descripcion}>
                          {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700">
                      Régimen Fiscal *
                    </label>
                    <select
                      value={nuevoRegimen}
                      onChange={(e) => setNuevoRegimen(e.target.value)}
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {regimenesCatalogo.map((item) => (
                        <option key={item.numero} value={item.numero}>
                          {item.numero} - {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Uso de CFDI *
                    </label>
                    <select
                      value={nuevoUsoCfdi}
                      onChange={(e) => setNuevoUsoCfdi(e.target.value)}
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {usosCfdiCatalogo.map((item) => (
                        <option key={item.numero} value={item.numero}>
                          {item.numero} - {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700">
                      Forma de Pago
                    </label>
                    <select
                      value={nuevoFormaPago}
                      onChange={(e) => setNuevoFormaPago(e.target.value)}
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 cursor-pointer"
                    >
                      {formasPagoCatalogo.map((item) => (
                        <option key={item.numero} value={item.numero}>
                          {item.numero} - {item.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      maxLength={80}
                      value={nuevoEmail}
                      onChange={(e) => setNuevoEmail(e.target.value)}
                      placeholder="factura@correo.com"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Teléfono / Celular
                    </label>
                    <input
                      type="tel"
                      maxLength={50}
                      value={nuevoTelefono}
                      onChange={(e) => setNuevoTelefono(e.target.value)}
                      placeholder="10 dígitos"
                      className="w-full min-h-11 h-11 px-3 rounded-xl border border-slate-300 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15"
                    />
                  </div>
                </div>

                {modalError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800">
                    <IonIcon
                      icon={alertCircleOutline}
                      className="text-lg text-rose-600 shrink-0 mt-0.5"
                    />
                    <span className="font-semibold">{modalError}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loadingGuardarRfc}
                    className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-black text-xs sm:text-sm leading-snug rounded-xl transition-all shadow-md shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50"
                  >
                    {loadingGuardarRfc ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon
                          icon={checkmarkCircleOutline}
                          className="text-base shrink-0"
                        />
                        <span>Guardar RFC y Continuar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalRegistro(false)}
                    className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold text-xs sm:text-sm leading-snug rounded-xl transition-colors flex items-center justify-center whitespace-nowrap"
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
