import { useState, useEffect, useCallback, useRef } from "react";
import { UserSession } from "../types/auth.types";
import {
  CatalogoItemDto,
  ClienteFiscalDto,
  ClienteRfcItemDto,
  FactTicketInitResponseDto,
  MonedaCatalogoDto,
} from "../types/facturacion.types";
import { facturacionService } from "../services/facturacionService";
import {
  catalogosService,
  DEFAULT_ESTADOS,
  DEFAULT_FORMAS_PAGO,
  DEFAULT_MONEDAS,
  DEFAULT_REGIMENES_FISCALES,
  DEFAULT_USOS_CFDI,
} from "../services/catalogosService";
import { getErrorMessage } from "../utils/formatters";

interface InitResolvedPayload {
  clienteSeleccionado: ClienteFiscalDto | null;
  rfcSugerido: string;
}

export const useFactTicketInit = (
  user: UserSession | null,
  onInitResolved: (payload: InitResolvedPayload) => void,
) => {
  const [initData, setInitData] = useState<FactTicketInitResponseDto | null>(
    null,
  );
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

  const onInitResolvedRef = useRef(onInitResolved);
  onInitResolvedRef.current = onInitResolved;

  const aplicarFallbackCatalogos = useCallback(async () => {
    const fallback = await catalogosService.obtenerCatalogosFactTicketFallback();
    setRegimenesCatalogo(fallback.regimenes);
    setUsosCfdiCatalogo(fallback.usosCfdi);
    setFormasPagoCatalogo(fallback.formasPago);
    setEstadosCatalogo(fallback.estados);
    setMonedasCatalogo(fallback.monedas);
  }, []);

  const cargarInicializacion = useCallback(async () => {
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
        }

        setRfcsCliente(data.rfcsCliente || []);

        onInitResolvedRef.current({
          clienteSeleccionado: data.clienteSeleccionado || null,
          rfcSugerido:
            data.rfcsCliente?.[0]?.rfc || user.rfc || "",
        });
      } catch (err: unknown) {
        setInitError(
          getErrorMessage(err, "Error al inicializar catálogos de facturación."),
        );
        await aplicarFallbackCatalogos();
        onInitResolvedRef.current({
          clienteSeleccionado: null,
          rfcSugerido: user.rfc || "",
        });
      } finally {
        setLoadingInit(false);
      }
      return;
    }

    await aplicarFallbackCatalogos();
    onInitResolvedRef.current({
      clienteSeleccionado: null,
      rfcSugerido: user?.rfc || "",
    });
  }, [user?.numeroCliente, user?.rfc, aplicarFallbackCatalogos]);

  useEffect(() => {
    cargarInicializacion();
  }, [cargarInicializacion]);

  return {
    initData,
    loadingInit,
    initError,
    regimenesCatalogo,
    usosCfdiCatalogo,
    formasPagoCatalogo,
    estadosCatalogo,
    monedasCatalogo,
    rfcsCliente,
    setRfcsCliente,
    recargarInicializacion: cargarInicializacion,
  };
};

