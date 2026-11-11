import React, { useState } from "react";
import { IonIcon, IonModal } from "@ionic/react";
import {
  addCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  desktopOutline,
  downloadOutline,
  ellipsisVerticalOutline,
  laptopOutline,
  logoAndroid,
  logoApple,
  shareOutline,
} from "ionicons/icons";
import { PwaPlatform } from "../../context/pwaInstallContextDef";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import { VentioLogo } from "../VentioLogo";
import { ActionButton } from "./ActionButton";

interface ModalInstalarAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalInstalarApp: React.FC<ModalInstalarAppProps> = ({
  isOpen,
  onClose,
}) => {
  const { platform, canPromptNatively, installSuccess, triggerNativeInstall } =
    usePwaInstall();

  const [selectedTab, setSelectedTab] = useState<PwaPlatform | null>(null);
  const [installing, setInstalling] = useState(false);

  const activeTab = selectedTab ?? platform;

  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    try {
      await triggerNativeInstall();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleClose}
      className="ventio-install-modal"
    >
      <div className="h-full md:h-auto md:max-h-[92dvh] bg-slate-100 md:bg-white overflow-y-auto p-4 md:p-0 flex items-start md:block justify-center">
        <div className="w-full max-w-lg md:max-w-none mx-auto bg-white rounded-3xl md:rounded-none p-5 sm:p-6 shadow-xl md:shadow-none border border-slate-200 md:border-0 space-y-4 my-auto md:my-0">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-[#010080] text-white flex items-center justify-center shrink-0 shadow-sm">
                <VentioLogo className="w-6 h-6" variant="white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Instalar Ventio Facturación
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Opcional · Úsala en navegador o instálala como aplicación
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar guía de instalación"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
            >
              <IonIcon icon={closeOutline} className="text-xl" />
            </button>
          </div>

          <div className="bg-[#f5f9ff] border border-[#b6d4fe] rounded-2xl p-4 space-y-3">
            <p className="text-xs text-slate-700 leading-relaxed">
              Puedes operar normalmente desde cualquier navegador o instalar
              Facturación Ventio en tu teléfono o computadora para acceder más
              rápido en ventana propia.
            </p>

            {installSuccess ? (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold">
                <IonIcon
                  icon={checkmarkCircleOutline}
                  className="text-lg text-emerald-600 shrink-0"
                />
                <span>
                  Aplicación instalada. Ya puedes abrir Ventio desde tu pantalla
                  de inicio o escritorio.
                </span>
              </div>
            ) : (
              canPromptNatively && (
                <ActionButton
                  variant="primary"
                  size="sm"
                  loading={installing}
                  onClick={handleNativeInstall}
                  icon={downloadOutline}
                  iconClassName="text-base text-[#38bdf8] shrink-0"
                  className="w-full"
                >
                  Instalar Aplicación Ahora
                </ActionButton>
              )
            )}
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setSelectedTab("android")}
                className={`min-h-10 px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "android"
                    ? "bg-white text-[#010080] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IonIcon icon={logoAndroid} className="text-sm shrink-0" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab("ios")}
                className={`min-h-10 px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "ios"
                    ? "bg-white text-[#010080] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IonIcon icon={logoApple} className="text-sm shrink-0" />
                <span className="sm:hidden">iPhone</span>
                <span className="hidden sm:inline">iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab("desktop")}
                className={`min-h-10 px-2 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === "desktop"
                    ? "bg-white text-[#010080] shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <IonIcon icon={laptopOutline} className="text-sm shrink-0" />
                <span className="sm:hidden">PC / Mac</span>
                <span className="hidden sm:inline">Escritorio</span>
              </button>
            </div>

            {activeTab === "android" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#010080] pb-2 border-b border-slate-200">
                  <IonIcon icon={logoAndroid} className="text-base shrink-0" />
                  <span>Pasos en Android (Chrome o Edge)</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Toca el menú de <strong>3 puntos (⋮)</strong>{" "}
                    <IonIcon
                      icon={ellipsisVerticalOutline}
                      className="text-slate-500 inline-block align-middle text-sm"
                    />{" "}
                    en la esquina superior derecha del navegador.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Selecciona <strong>"Instalar aplicación"</strong> o{" "}
                    <strong>"Agregar a la pantalla principal"</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Confirma en <strong>Instalar</strong> y abre Ventio desde tu
                    pantalla de inicio como cualquier app.
                  </span>
                </div>
              </div>
            )}

            {activeTab === "ios" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#010080] pb-2 border-b border-slate-200">
                  <IonIcon icon={logoApple} className="text-base shrink-0" />
                  <span>Pasos en iPhone / iPad (Safari)</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-relaxed">
                    Abre esta página en el navegador <strong>Safari</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-relaxed">
                    Toca el ícono <strong>Compartir</strong>{" "}
                    <IonIcon
                      icon={shareOutline}
                      className="text-[#0b5ed7] inline-block align-middle text-sm"
                    />{" "}
                    en la barra de Safari.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Elige <strong>"Agregar a inicio"</strong>{" "}
                    <IonIcon
                      icon={addCircleOutline}
                      className="text-[#0b5ed7] inline-block align-middle text-sm"
                    />{" "}
                    y pulsa <strong>Agregar</strong> en la esquina superior.
                  </span>
                </div>
              </div>
            )}

            {activeTab === "desktop" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#010080] pb-2 border-b border-slate-200">
                  <IonIcon
                    icon={desktopOutline}
                    className="text-base shrink-0"
                  />
                  <span>Pasos en Escritorio (Chrome o Edge)</span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-relaxed">
                    En <strong>Google Chrome</strong> o{" "}
                    <strong>Microsoft Edge</strong>, haz clic en el ícono de{" "}
                    <strong>Instalar</strong>{" "}
                    <IonIcon
                      icon={downloadOutline}
                      className="text-[#0b5ed7] inline-block align-middle text-sm"
                    />{" "}
                    al extremo derecho de la barra de direcciones (o usa el
                    botón superior si aparece disponible).
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-relaxed">
                    También puedes abrir el menú del navegador{" "}
                    <strong>(⋮ / ⋯)</strong> &rarr;{" "}
                    <strong>Guardar y compartir / Aplicaciones</strong> &rarr;{" "}
                    <strong>Instalar Ventio Facturación</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#eef5ff] border border-[#b6d4fe] text-[#010080] font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-relaxed">
                    Confirma en <strong>Instalar</strong> para fijar Ventio en
                    tu escritorio, barra de tareas o Launchpad en ventana
                    dedicada.
                  </span>
                </div>
              </div>
            )}
          </div>

          <ActionButton
            variant="neutralPrimary"
            size="sm"
            onClick={handleClose}
            className="w-full"
          >
            Entendido, continuar
          </ActionButton>
        </div>
      </div>
    </IonModal>
  );
};
