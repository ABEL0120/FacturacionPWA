import React from "react";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonFooter,
} from "@ionic/react";
import { homeOutline, logInOutline, logOutOutline, personCircleOutline } from "ionicons/icons";
import { useLocation, useHistory } from "react-router-dom";
import { VentioLogo } from "./VentioLogo";
import { useAuth } from "../context/AuthContext";

export const MenuLateral: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    history.replace("/login");
    logout();
  };

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader className="ion-no-border">
        <IonToolbar className="ventio-toolbar px-2">
          <div className="flex items-center gap-2 px-3 py-1">
            <VentioLogo className="w-6 h-6 shrink-0 drop-shadow" variant="white" />
            <span className="font-black text-white text-base tracking-wider uppercase">
              VENTIO
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-vertical">
        {isAuthenticated && user && (
          <div className="mx-3 mb-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#010080] text-white flex items-center justify-center font-black text-sm uppercase shrink-0">
              {user.nombre ? user.nombre.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-800 truncate">
                {user.nombre || "Usuario"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <IonList lines="none" className="space-y-1 px-2">
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/home"
              routerDirection="none"
              className={`rounded-xl transition-colors cursor-pointer ${
                location.pathname === "/home" || location.pathname === "/"
                  ? "text-[#0b5ed7] font-bold bg-[#eef5ff]"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              detail={false}
            >
              <IonIcon
                slot="start"
                icon={homeOutline}
                className={
                  location.pathname === "/home" || location.pathname === "/"
                    ? "text-[#0b5ed7]"
                    : "text-slate-500"
                }
              />
              <IonLabel>Inicio / Facturación</IonLabel>
            </IonItem>
          </IonMenuToggle>

          {!isAuthenticated ? (
            <IonMenuToggle autoHide={false}>
              <IonItem
                routerLink="/login"
                routerDirection="none"
                className={`rounded-xl transition-colors cursor-pointer ${
                  location.pathname === "/login"
                    ? "text-[#0b5ed7] font-bold bg-[#eef5ff]"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                detail={false}
              >
                <IonIcon slot="start" icon={logInOutline} className="text-slate-500" />
                <IonLabel>Iniciar Sesión</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ) : (
            <IonMenuToggle autoHide={false}>
              <IonItem
                button
                onClick={handleLogout}
                className="rounded-xl transition-colors cursor-pointer text-rose-600 hover:bg-rose-50"
                detail={false}
              >
                <IonIcon slot="start" icon={logOutOutline} className="text-rose-600" />
                <IonLabel className="text-rose-600 font-bold">Cerrar Sesión</IonLabel>
              </IonItem>
            </IonMenuToggle>
          )}
        </IonList>
      </IonContent>

      <IonFooter className="p-4 border-t border-slate-100 text-center">
        <span className="text-xs text-slate-400 font-medium">
          Facturación Ventio v0.1.0
        </span>
      </IonFooter>
    </IonMenu>
  );
};

export default MenuLateral;
