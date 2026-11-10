import { useState, useEffect } from "react";
import {
  catalogosService,
  DEFAULT_ESTADOS,
  DEFAULT_FORMAS_PAGO,
  DEFAULT_REGIMENES_FISCALES,
  DEFAULT_USOS_CFDI,
} from "../services/catalogosService";
import { CatalogoItemDto } from "../types/facturacion.types";
import { resolverEstadoDefault } from "../utils/formatters";

export const useCatalogosSat = () => {
  const [regimenes, setRegimenes] = useState<CatalogoItemDto[]>(
    DEFAULT_REGIMENES_FISCALES,
  );
  const [usosCfdi, setUsosCfdi] =
    useState<CatalogoItemDto[]>(DEFAULT_USOS_CFDI);
  const [formasPago, setFormasPago] =
    useState<CatalogoItemDto[]>(DEFAULT_FORMAS_PAGO);
  const [estados, setEstados] = useState<CatalogoItemDto[]>(DEFAULT_ESTADOS);
  const [defaultEstado, setDefaultEstado] = useState<string>("Coahuila");

  useEffect(() => {
    let active = true;
    catalogosService.obtenerCatalogosSat().then((data) => {
      if (!active) return;
      setRegimenes(data.regimenes);
      setUsosCfdi(data.usosCfdi);
      setFormasPago(data.formasPago);
      setEstados(data.estados);
      setDefaultEstado(resolverEstadoDefault(data.estados));
    });
    return () => {
      active = false;
    };
  }, []);

  return {
    regimenes,
    usosCfdi,
    formasPago,
    estados,
    defaultEstado,
  };
};

