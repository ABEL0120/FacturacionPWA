import React from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { VentioLogo } from "../VentioLogo";

interface AuthPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  onBack?: () => void;
  showCenteredLogo?: boolean;
  centerVertically?: boolean;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-md",
  md: "max-w-md",
  lg: "max-w-3xl",
};

export const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  maxWidth = "md",
  onBack,
  showCenteredLogo = false,
  centerVertically = false,
}) => {
  return (
    <IonPage>
      <IonContent fullscreen className="bg-slate-100">
        <div
          className={`min-h-full py-6 px-4 sm:px-6 lg:px-8 ${
            centerVertically ? "flex flex-col justify-between" : ""
          }`}
        >
          <div
            className={`w-full ${MAX_WIDTH_MAP[maxWidth]} mx-auto ${
              centerVertically ? "my-auto" : ""
            } space-y-6`}
          >
            {showCenteredLogo ? (
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#010080] shadow-xl shadow-[#010080]/20 border-4 border-white mb-2">
                  <VentioLogo
                    className="w-12 h-12 drop-shadow-md"
                    variant="white"
                  />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#010080] tracking-tight uppercase">
                  VENTIO
                </h1>
              </div>
            ) : (
              onBack && (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onBack}
                    aria-label="Regresar"
                    className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
                  >
                    <IonIcon icon={arrowBackOutline} className="text-xl" />
                  </button>

                  <div className="flex items-center gap-2">
                    <VentioLogo className="w-6 h-6 shrink-0" />
                    <span className="text-xs font-black tracking-wider uppercase text-[#010080]">
                      VENTIO
                    </span>
                  </div>
                </div>
              )
            )}

            {children}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

