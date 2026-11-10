import React, { useState, useEffect } from "react";
import {
  IonIcon,
  IonBadge,
} from "@ionic/react";
import {
  downloadOutline,
  shareOutline,
  addCircleOutline,
  logoAndroid,
  phonePortraitOutline,
  ellipsisVerticalOutline,
} from "ionicons/icons";
import { VentioLogo } from "./VentioLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface PwaInstallGateProps {
  children: React.ReactNode;
}

export const PwaInstallGate: React.FC<PwaInstallGateProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(true);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobileCheck = /iPhone|iPad|iPod|Android/i.test(ua);
    const iosCheck = /iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobileCheck);
    setIsIos(iosCheck);

    const checkStandalone = () => {
      const standaloneMatch = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      const fullscreenMatch = window.matchMedia(
        "(display-mode: fullscreen)"
      ).matches;
      const minimalUiMatch = window.matchMedia(
        "(display-mode: minimal-ui)"
      ).matches;
      const navigatorStandalone =
        (navigator as NavigatorStandalone).standalone === true;
      const androidAppReferrer = document.referrer.includes("android-app://");
      const pwaParam =
        new URLSearchParams(window.location.search).get("mode") === "pwa";

      return (
        standaloneMatch ||
        fullscreenMatch ||
        minimalUiMatch ||
        navigatorStandalone ||
        androidAppReferrer ||
        pwaParam
      );
    };

    setIsStandalone(checkStandalone());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleAceptarInstalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstallSuccess(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isMobile || isStandalone || dismissed) {
    return <>{children}</>;
  }

  if (installSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-6 overflow-y-auto select-none text-center">
        <div className="max-w-xs w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 space-y-6">
          <div className="w-24 h-24 rounded-full bg-[#010080] flex items-center justify-center mx-auto shadow-inner border border-slate-700">
            <VentioLogo className="w-14 h-14" variant="white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-wide">
              ¡Instalación Iniciada!
            </h2>
            <p className="text-slate-400 text-[13px] font-medium leading-relaxed">
              La aplicación se está instalando. Abre la aplicación{" "}
              <strong>Ventio Facturación</strong> directamente desde tu pantalla de
              inicio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-6 overflow-y-auto select-none">
      <div className="max-w-sm w-full my-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-[#010080] flex items-center justify-center mx-auto shadow-xl border-4 border-slate-800">
            <VentioLogo className="w-12 h-12" variant="white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Ventio Facturación
          </h1>
          <IonBadge
            color="primary"
            className="px-4 py-1.5 font-black text-[10px] rounded-full uppercase tracking-widest shadow-sm"
          >
            Instalar App
          </IonBadge>
        </div>

        <div className="rounded-3xl border border-slate-700 shadow-2xl bg-slate-800 overflow-hidden relative">
          <div className="bg-slate-800 p-6 space-y-5 relative z-10">
            <div className="text-sm text-slate-300 text-center leading-relaxed font-medium">
              Instala la aplicación en tu pantalla de inicio para acceder
              rápidamente y disfrutar de la experiencia completa sin conexión.
            </div>

            {isIos ? (
              <div className="space-y-3 bg-slate-700/50 p-4 rounded-2xl border border-slate-600 text-[13px] text-slate-300 font-medium shadow-inner">
                <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center mb-2 pb-2 border-b border-slate-600">
                  <IonIcon
                    icon={phonePortraitOutline}
                    className="mr-1.5 text-sm"
                  />
                  Pasos para iPhone
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Toca el botón <strong>Compartir</strong>{" "}
                    <IonIcon
                      icon={shareOutline}
                      className="text-blue-400 inline-block align-middle text-sm"
                    />{" "}
                    en Safari.
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Selecciona <strong>"Agregar al inicio"</strong>{" "}
                    <IonIcon
                      icon={addCircleOutline}
                      className="text-blue-400 inline-block align-middle text-sm"
                    />
                    .
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Abre la app desde tu pantalla principal.</span>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-4 bg-slate-700/50 p-5 rounded-2xl border border-slate-600 shadow-inner">
                <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center justify-center mb-1">
                  <IonIcon icon={logoAndroid} className="mr-1.5 text-sm" />
                  Instalación Android
                </div>
                <button
                  className="w-full min-h-14 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[13px] leading-snug shadow-lg shadow-blue-500/20 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 shrink-0"
                  onClick={handleAceptarInstalar}
                >
                  <IonIcon icon={downloadOutline} className="text-lg shrink-0" />
                  <span>Instalar App</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-700/50 p-4 rounded-2xl border border-slate-600 text-[13px] text-slate-300 font-medium shadow-inner">
                <div className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center mb-2 pb-2 border-b border-slate-600">
                  <IonIcon icon={logoAndroid} className="mr-1.5 text-sm" />
                  Pasos para Android
                </div>

                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Toca el menú de <strong>3 puntos (⋮)</strong>{" "}
                    <IonIcon
                      icon={ellipsisVerticalOutline}
                      className="text-slate-400 inline-block align-middle text-sm"
                    />
                    .
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Selecciona <strong>"Instalar aplicación"</strong> o "Agregar a la pantalla principal".
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Abre la app instalada.</span>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="min-h-10 py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white underline underline-offset-4 inline-flex items-center justify-center"
              >
                Continuar en el navegador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallGate;

