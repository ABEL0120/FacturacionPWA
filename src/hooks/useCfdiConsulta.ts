import { useCallback, useEffect, useState } from "react";
import { cfdiConsultaService } from "../services/cfdiConsultaService";
import { UserSession } from "../types/auth.types";
import { CfdiConsultaItemDto } from "../types/cfdiConsulta.types";
import { getErrorMessage } from "../utils/formatters";
import { useAlert } from "./useAlert";
import { useToast } from "./useToast";

export interface PdfArchivoModalState {
  isOpen: boolean;
  idCfdi: string;
  fileName: string;
  blob: Blob | null;
}

export const useCfdiConsulta = (user: UserSession | null) => {
  const { showSuccess } = useToast();
  const { showErrorAlert, showConfirm } = useAlert();

  const [serie, setSerie] = useState("");
  const [folio, setFolio] = useState("");
  const [items, setItems] = useState<CfdiConsultaItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [accionActiva, setAccionActiva] = useState<string | null>(null);
  const [pdfModal, setPdfModal] = useState<PdfArchivoModalState>({
    isOpen: false,
    idCfdi: "",
    fileName: "",
    blob: null,
  });

  const numeroCliente = user?.numeroCliente ?? 0;

  const ejecutarConsulta = useCallback(
    async (
      serieFiltro: string,
      folioFiltro: string,
      mostrarErrorModal = true,
    ) => {
      if (numeroCliente <= 0) {
        setItems([]);
        return;
      }

      setLoading(true);
      let errorMsg: string | null = null;
      try {
        const res = await cfdiConsultaService.consultar(
          numeroCliente,
          serieFiltro,
          folioFiltro,
        );
        setItems(res);
      } catch (err: unknown) {
        errorMsg = getErrorMessage(
          err,
          "No fue posible consultar los comprobantes emitidos.",
        );
      } finally {
        setLoading(false);
      }

      if (errorMsg && mostrarErrorModal) {
        await showErrorAlert({
          title: "Error al consultar CFDI",
          message: errorMsg,
        });
      }
    },
    [numeroCliente, showErrorAlert],
  );

  useEffect(() => {
    void ejecutarConsulta("", "", true);
  }, [ejecutarConsulta]);

  const buscar = () => ejecutarConsulta(serie, folio, true);

  const restaurar = () => {
    setSerie("");
    setFolio("");
    return ejecutarConsulta("", "", true);
  };

  const recargar = () => ejecutarConsulta(serie, folio, false);

  const verPdf = async (item: CfdiConsultaItemDto) => {
    const key = `${item.idCfdi}:ver`;
    setAccionActiva(key);
    let errorMsg: string | null = null;
    try {
      const archivo = await cfdiConsultaService.obtenerArchivo(
        item.idCfdi,
        "pdf",
        numeroCliente,
      );
      setPdfModal({
        isOpen: true,
        idCfdi: item.idCfdi,
        fileName: archivo.fileName,
        blob: archivo.blob,
      });
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "No existe el Archivo");
    } finally {
      setAccionActiva(null);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "Archivo no disponible",
        message: errorMsg,
      });
    }
  };

  const descargarArchivo = async (
    item: CfdiConsultaItemDto,
    tipo: "pdf" | "xml",
  ) => {
    const key = `${item.idCfdi}:${tipo}`;
    setAccionActiva(key);
    let errorMsg: string | null = null;
    try {
      const archivo = await cfdiConsultaService.obtenerArchivo(
        item.idCfdi,
        tipo,
        numeroCliente,
      );
      cfdiConsultaService.guardarBlobEnDispositivo(
        archivo.blob,
        archivo.fileName,
      );
      showSuccess(
        tipo === "pdf"
          ? "PDF descargado correctamente."
          : "XML descargado correctamente.",
      );
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "No existe el Archivo");
    } finally {
      setAccionActiva(null);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "Archivo no disponible",
        message: errorMsg,
      });
    }
  };

  const enviarCorreo = async (item: CfdiConsultaItemDto) => {
    const destino = user?.email?.trim() || "";
    const confirmado = await showConfirm({
      variant: "info",
      title: "Enviar comprobante por correo",
      message: destino
        ? `Se enviarán los archivos XML y PDF de ${item.idCfdi} a ${destino}.`
        : `Se enviarán los archivos XML y PDF de ${item.idCfdi} al correo registrado de tu cuenta.`,
      confirmText: "Enviar",
      cancelText: "Cancelar",
    });

    if (!confirmado) return;

    const key = `${item.idCfdi}:mail`;
    setAccionActiva(key);
    let errorMsg: string | null = null;
    let enviado = false;
    try {
      enviado = await cfdiConsultaService.enviarCorreo(item.idCfdi, {
        numeroCliente,
        correoDestino: destino || null,
      });
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "No se ha podido enviar el correo");
    } finally {
      setAccionActiva(null);
    }

    if (enviado) {
      showSuccess("Los archivos se han enviado a su correo", 2800);
      return;
    }

    await showErrorAlert({
      title: "No se pudo enviar el correo",
      message: errorMsg || "No se ha podido enviar el correo",
    });
  };

  const cerrarPdfModal = () => {
    setPdfModal((prev) => ({ ...prev, isOpen: false, blob: null }));
  };

  return {
    serie,
    setSerie,
    folio,
    setFolio,
    items,
    loading,
    accionActiva,
    pdfModal,
    buscar,
    restaurar,
    recargar,
    verPdf,
    descargarArchivo,
    enviarCorreo,
    cerrarPdfModal,
  };
};
