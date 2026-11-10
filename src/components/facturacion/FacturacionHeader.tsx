import React from "react";
import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from "@ionic/react";
import { logInOutline, logOutOutline } from "ionicons/icons";
import { VentioLogo } from "../VentioLogo";

interface FacturacionHeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
  onGoLogin: () => void;
}

export const FacturacionHeader: React.FC<FacturacionHeaderProps> = ({
  isAuthenticated,
  onLogout,
  onGoLogin,
}) => {
  return (
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
              onClick={onLogout}
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
              onClick={onGoLogin}
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
  );
};

