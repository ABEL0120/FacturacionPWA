import React, { useEffect, useState } from "react";
import { IonIcon, IonModal } from "@ionic/react";
import {
  arrowBackOutline,
  downloadOutline,
  printOutline,
} from "ionicons/icons";
import { cfdiConsultaService } from "../../services/cfdiConsultaService";
import { useToast } from "../../hooks/useToast";

interface ModalArchivoPdfProps {
  isOpen: boolean;
  idCfdi: string;
  fileName: string;
  blob: Blob | null;
  onClose: () => void;
}

export const ModalArchivoPdf: React.FC<ModalArchivoPdfProps> = ({
  isOpen,
  idCfdi,
  fileName,
  blob,
  onClose,
}) => {
  const { showSuccess } = useToast();
  const [blobUrl, setBlobUrl] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !blob) {
      setBlobUrl("");
      return;
    }

    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [isOpen, blob]);

  const handleDescargar = () => {
    if (!blob) return;
    cfdiConsultaService.guardarBlobEnDispositivo(
      blob,
      fileName || `${idCfdi}.pdf`,
    );
    showSuccess("PDF descargado correctamente.");
  };

  const handleImprimir = () => {
    if (!blobUrl) return;
    const prevFrame = document.getElementById("ventio-pdf-blob-print");
    if (prevFrame) {
      prevFrame.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "ventio-pdf-blob-print";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.border = "0";
    iframe.style.pointerEvents = "none";

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
      window.setTimeout(() => {
        iframe.remove();
      }, 60000);
    };

    iframe.src = blobUrl;
    document.body.appendChild(iframe);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="ventio-pdf-modal"
    >
      <div className="h-full flex flex-col bg-slate-700 overflow-hidden">
        <header
          className="bg-[#010080] text-white px-3 sm:px-5 pb-2.5 flex items-center justify-between gap-2 shrink-0 shadow-md border-b border-white/10"
          style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Volver a consulta de CFDIs"
            className="min-h-10 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shrink-0"
          >
            <IonIcon icon={arrowBackOutline} className="text-base shrink-0" />
            <span>Volver</span>
          </button>

          <span className="hidden md:block text-xs font-extrabold tracking-wide text-blue-100 truncate px-2">
            Comprobante PDF · {idCfdi} ({fileName})
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleImprimir}
              disabled={!blobUrl}
              className="min-h-10 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
            >
              <IonIcon icon={printOutline} className="text-base shrink-0" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDescargar}
              disabled={!blob}
              className="min-h-10 px-3.5 py-2 rounded-xl bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 shrink-0"
            >
              <IonIcon icon={downloadOutline} className="text-base shrink-0" />
              <span className="sm:hidden">Descargar</span>
              <span className="hidden sm:inline">Descargar PDF</span>
            </button>
          </div>
        </header>

        <div className="flex-1 bg-slate-200 relative flex flex-col overflow-hidden">
          {blobUrl ? (
            <iframe
              src={blobUrl}
              title={`Vista previa PDF ${idCfdi}`}
              className="w-full flex-1 border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-600 font-medium">
              Cargando documento PDF...
            </div>
          )}

          <div className="sm:hidden bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 truncate">
              {fileName || `${idCfdi}.pdf`}
            </span>
            <button
              type="button"
              onClick={handleDescargar}
              disabled={!blob}
              className="min-h-9 px-3 rounded-lg bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] text-xs font-bold shrink-0"
            >
              Guardar PDF
            </button>
          </div>
        </div>
      </div>
    </IonModal>
  );
};
