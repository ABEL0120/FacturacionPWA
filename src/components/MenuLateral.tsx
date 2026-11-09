import React from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonFooter,
} from "@ionic/react";
import { homeOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";
import { TrompoLogo } from "./TrompoLogo";

export const MenuLateral: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader className="ion-no-border">
        <IonToolbar className="tizoncito-toolbar px-2">
          <div className="flex items-center gap-2 px-3 py-1">
            <TrompoLogo className="w-6 h-6 shrink-0 drop-shadow" />
            <span className="font-black text-white text-base tracking-wider uppercase">
              El Tizoncito
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-vertical">
        <IonList lines="none" className="space-y-1 px-2">
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/home"
              routerDirection="none"
              className={`rounded-xl transition-colors cursor-pointer ${
                location.pathname === "/home" || location.pathname === "/"
                  ? "text-blue-600 font-bold bg-blue-50/80"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              detail={false}
            >
              <IonIcon
                slot="start"
                icon={homeOutline}
                className={
                  location.pathname === "/home" || location.pathname === "/"
                    ? "text-blue-600"
                    : "text-slate-500"
                }
              />
              <IonLabel>Inicio</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>

      <IonFooter className="p-4 border-t border-slate-100 text-center">
        <span className="text-xs text-slate-400 font-medium">
          Facturación PWA v0.1.0
        </span>
      </IonFooter>
    </IonMenu>
  );
};

export default MenuLateral;

