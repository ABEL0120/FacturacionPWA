import { useState, useCallback, useEffect, useMemo } from "react";
import { UserSession } from "../types/auth.types";
import {
  ClienteFiscalDto,
  ConsultarTicketRequestDto,
  FacturaTicketResponseDto,
  GenerarFacturaTicketRequestDto,
  PasoFacturacion,
  TicketConsultaResponseDto,
  TicketResumenInfo,
} from "../types/facturacion.types";
import { facturacionService } from "../services/facturacionService";
import { getErrorMessage } from "../utils/formatters";
import {
  esRfcLongitudValida,
  normalizarRfc,
  parseEnteroPositivo,
  parseImportePositivo,
} from "../utils/validators";
import { useAlert } from "./useAlert";
import { useToast } from "./useToast";
import { useFactTicketInit } from "./useFactTicketInit";

export const useFacturacionFlow = (user: UserSession | null) => {
  const { showSuccess, showWarning } = useToast();
  const { showErrorAlert, showConfirm } = useAlert();

  const [paso, setPaso] = useState<PasoFacturacion>(1);

  const [folio, setFolio] = useState<string>("");
  const [transaccion, setTransaccion] = useState<string>("");
  const [totalTicket, setTotalTicket] = useState<string>("");
  const [ticketsSeleccionados, setTicketsSeleccionados] = useState<
    TicketConsultaResponseDto[]
  >([]);
  const [loadingTicket, setLoadingTicket] = useState<boolean>(false);

  const [rfcBusqueda, setRfcBusqueda] = useState<string>("");
  const [cliente, setCliente] = useState<ClienteFiscalDto | null>(null);
  const [loadingRfc, setLoadingRfc] = useState<boolean>(false);
  const [modalRegistro, setModalRegistro] = useState<boolean>(false);
  const [rfcParaRegistrar, setRfcParaRegistrar] = useState<string>("");

  const [regimenFiscal, setRegimenFiscal] = useState<string>("612");
  const [usoCfdi, setUsoCfdi] = useState<string>("G03");
  const [formaPago, setFormaPago] = useState<string>("01");
  const [emailEnvio, setEmailEnvio] = useState<string>("");
  const [loadingVistaPrevia, setLoadingVistaPrevia] = useState<boolean>(false);
  const [loadingGenerar, setLoadingGenerar] = useState<boolean>(false);

  const [facturaEmitida, setFacturaEmitida] =
    useState<FacturaTicketResponseDto | null>(null);

  const ticketResumen = useMemo<TicketResumenInfo>(() => {
    const primerTicket = ticketsSeleccionados[0] || null;
    const monedaTicket = (primerTicket?.moneda || "MXN").trim().toUpperCase();
    const monedaDesc =
      (primerTicket?.monedaDescripcion || "").trim() ||
      (monedaTicket === "MXN" ? "Peso Mexicano" : "");
    return {
      sucursalNombre: primerTicket?.sucursalNombre || "",
      subtotal: primerTicket?.subtotal || 0,
      descuento: primerTicket?.descuento || 0,
      iva: primerTicket?.iva || 0,
      total: primerTicket?.total || 0,
      partidas: primerTicket?.partidas || [],
      requiereNotaCredito: Boolean(primerTicket?.requiereNotaCredito),
      formaPagoSat: (primerTicket?.formaPagoSat || "").trim(),
      formaPagoDesc: (primerTicket?.formaPagoDescripcion || "").trim(),
      moneda: monedaTicket,
      monedaDesc,
      tipoCambio:
        monedaTicket === "MXN"
          ? 1.0
          : Number(primerTicket?.tipoCambio || 1.0),
      uuidGlobal: primerTicket?.uuidGlobal || "",
      fecha: primerTicket?.fecha || "",
    };
  }, [ticketsSeleccionados]);

  useEffect(() => {
    if (user?.email) {
      setEmailEnvio((prev) => prev || user.email);
    }
  }, [user?.email]);

  const aplicarDatosCliente = useCallback(
    (c: ClienteFiscalDto, fpTicket?: string) => {
      const reg = c.regimenFiscal?.trim() || "612";
      const uso = c.usoCfdi?.trim() || "G03";
      const fp = c.formaPago?.trim() || "01";
      setCliente({ ...c, regimenFiscal: reg, usoCfdi: uso, formaPago: fp });
      setRfcBusqueda(normalizarRfc(c.rfc));
      setRegimenFiscal(reg);
      setUsoCfdi(uso);
      if (!fpTicket) {
        setFormaPago(fp);
      }
      setEmailEnvio(c.mail?.trim() || user?.email || "");
    },
    [user?.email],
  );

  const init = useFactTicketInit(
    user,
    ({ clienteSeleccionado, rfcSugerido }) => {
      if (clienteSeleccionado) {
        aplicarDatosCliente(clienteSeleccionado);
      } else if (rfcSugerido) {
        setRfcBusqueda(rfcSugerido);
      }
    },
  );

  const clienteIdUsuario =
    user?.numeroCliente && user.numeroCliente > 0 ? user.numeroCliente : null;

  const buscarTicket = async () => {
    if (!folio.trim()) {
      showWarning("Por favor ingresa el folio del ticket.");
      return;
    }

    const tieneTransaccionInput = transaccion.trim().length > 0;
    const tieneTotalInput = totalTicket.trim().length > 0;
    const transaccionNum = tieneTransaccionInput
      ? parseEnteroPositivo(transaccion)
      : null;
    const totalNum = tieneTotalInput ? parseImportePositivo(totalTicket) : null;

    if (tieneTransaccionInput && !transaccionNum) {
      showWarning("Ingresa una Transacción (REF:) válida mayor a 0.");
      return;
    }

    if (tieneTotalInput && !totalNum) {
      showWarning("Ingresa un Total válido mayor a 0.");
      return;
    }

    if (!transaccionNum && !totalNum) {
      showWarning(
        "Ingresa la Transacción (REF:), el Total del ticket o ambos.",
      );
      return;
    }

    const requestDto: ConsultarTicketRequestDto = {
      folio: folio.trim(),
      serie: "",
      total: totalNum,
      transaccion: transaccionNum,
      numeroCliente: clienteIdUsuario,
      mailUsuario: user?.email || null,
    };

    setLoadingTicket(true);
    let errorMsg: string | null = null;
    try {
      const consultado = await facturacionService.consultarTicket(requestDto);
      setTicketsSeleccionados([consultado]);
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "Error al consultar el ticket.");
      setTicketsSeleccionados([]);
    } finally {
      setLoadingTicket(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo validar el ticket",
        message: errorMsg,
      });
    }
  };

  const quitarTicket = async (folioQuitar: string) => {
    setTicketsSeleccionados((prev) =>
      prev.filter((t) => t.folio !== folioQuitar),
    );
  };

  const abrirModalRegistroRfc = (rfcInicial?: string) => {
    setRfcParaRegistrar(normalizarRfc(rfcInicial ?? rfcBusqueda));
    setModalRegistro(true);
  };

  const buscarRfc = async (rfcObjetivo = rfcBusqueda) => {
    const rfcLimpio = normalizarRfc(rfcObjetivo);

    if (!esRfcLongitudValida(rfcLimpio)) {
      showWarning("Ingresa un RFC válido de 12 o 13 caracteres.");
      return;
    }

    setLoadingRfc(true);
    let errorMsg: string | null = null;
    let rfcParaConfirmar: string | null = null;

    try {
      const res = await facturacionService.buscarRfc(
        rfcLimpio,
        user?.numeroCliente,
      );
      if (res.existe && res.cliente) {
        aplicarDatosCliente(res.cliente, ticketResumen.formaPagoSat);
      } else {
        setCliente(null);
        rfcParaConfirmar = res.rfc || rfcLimpio;
      }
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "Error al consultar el RFC.");
    } finally {
      setLoadingRfc(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo consultar el RFC",
        message: errorMsg,
      });
      return;
    }

    if (rfcParaConfirmar) {
      const abrirRegistro = await showConfirm({
        variant: "warning",
        title: "RFC no registrado",
        message: `El RFC ${rfcParaConfirmar} no se encuentra registrado en el catálogo. Presiona Aceptar para completar su registro fiscal.`,
        confirmText: "Aceptar",
        cancelText: "Cancelar",
      });
      if (abrirRegistro) {
        abrirModalRegistroRfc(rfcParaConfirmar);
      }
    }
  };

  const handleRfcRegistrado = async (guardado: ClienteFiscalDto) => {
    aplicarDatosCliente(guardado, ticketResumen.formaPagoSat);
    setModalRegistro(false);

    if (user?.numeroCliente && user.numeroCliente > 0) {
      try {
        const rfcsActualizados = await facturacionService.listarRfcsCliente(
          user.numeroCliente,
        );
        init.setRfcsCliente(rfcsActualizados);
      } catch {
        init.setRfcsCliente((prev) => {
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

    showSuccess(
      "¡RFC registrado con éxito! Continúa con los datos fiscales.",
      2500,
    );
    setPaso(3);
  };

  const validarCamposPaso3 = (): boolean => {
    if (ticketsSeleccionados.length === 0 || !cliente) {
      showWarning("Datos incompletos de ticket o receptor.");
      return false;
    }
    if (!regimenFiscal) {
      showWarning("Selecciona el Régimen Fiscal del receptor.");
      return false;
    }
    if (!usoCfdi) {
      showWarning("Selecciona el Tipo de Gasto / Uso de CFDI.");
      return false;
    }
    if (!ticketResumen.formaPagoSat && !formaPago) {
      showWarning("Selecciona la Forma de Pago.");
      return false;
    }
    return true;
  };

  const construirPayloadFactura = (): GenerarFacturaTicketRequestDto => {
    if (!cliente || ticketsSeleccionados.length === 0) {
      throw new Error("Datos incompletos para emitir la factura.");
    }

    const monedaFinal = ticketResumen.moneda.trim().toUpperCase() || "MXN";
    const tipoCambioNum =
      monedaFinal === "MXN" ? 1.0 : Number(ticketResumen.tipoCambio || 1.0);

    return {
      numeroCliente: cliente.numeroCliente || user?.numeroCliente || 0,
      rfc: cliente.rfc,
      regimenFiscal,
      usoCfdi,
      formaPago: ticketResumen.formaPagoSat
        ? ticketResumen.formaPagoSat
        : formaPago || null,
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

  const ejecutarVistaPrevia = async () => {
    if (!validarCamposPaso3()) return;
    setLoadingVistaPrevia(true);
    let errorMsg: string | null = null;
    try {
      const res = await facturacionService.vistaPrevia(
        construirPayloadFactura(),
      );
      setFacturaEmitida(res);
      setPaso(4);
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "Error al generar vista previa.");
    } finally {
      setLoadingVistaPrevia(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo generar vista previa",
        message: errorMsg,
      });
    }
  };

  const ejecutarGenerarFactura = async () => {
    if (!validarCamposPaso3()) return;
    setLoadingGenerar(true);
    let errorMsg: string | null = null;
    try {
      const factura = await facturacionService.generarFactura(
        construirPayloadFactura(),
      );
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
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "Error al generar la factura.");
    } finally {
      setLoadingGenerar(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "Error al generar la factura",
        message: errorMsg,
      });
    }
  };

  const reiniciarFlujo = () => {
    setPaso(1);
    setFolio("");
    setTransaccion("");
    setTotalTicket("");
    setTicketsSeleccionados([]);
    setFacturaEmitida(null);
  };

  const mostrarProcesoPrueba = Boolean(
    init.initData?.esPrueba || facturaEmitida?.esPrueba,
  );

  return {
    init,
    paso,
    setPaso,
    mostrarProcesoPrueba,
    folio,
    setFolio,
    transaccion,
    setTransaccion,
    totalTicket,
    setTotalTicket,
    ticketsSeleccionados,
    ticketResumen,
    loadingTicket,
    buscarTicket,
    quitarTicket,
    rfcBusqueda,
    setRfcBusqueda,
    cliente,
    setCliente,
    loadingRfc,
    modalRegistro,
    setModalRegistro,
    rfcParaRegistrar,
    abrirModalRegistroRfc,
    buscarRfc,
    handleRfcRegistrado,
    regimenFiscal,
    setRegimenFiscal,
    usoCfdi,
    setUsoCfdi,
    formaPago,
    setFormaPago,
    emailEnvio,
    setEmailEnvio,
    loadingVistaPrevia,
    loadingGenerar,
    ejecutarVistaPrevia,
    ejecutarGenerarFactura,
    facturaEmitida,
    reiniciarFlujo,
  };
};
