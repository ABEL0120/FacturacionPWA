import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonAlert,
} from "@ionic/react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { IonReactRouter } from "@ionic/react-router";
import { OfflineBanner } from "./components/OfflineBanner";
import { PwaInstallGate } from "./components/PwaInstallGate";
import { MenuLateral } from "./components/MenuLateral";
import Home from "./pages/Home";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

setupIonicReact();

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, r) {
      if (r) {
        const checkUpdate = () => {
          if (typeof navigator === "undefined" || !navigator.onLine) return;
          try {
            r.update().catch(() => {});
          } catch {}
        };
        setTimeout(checkUpdate, 1500);
        const intervalId = setInterval(checkUpdate, 10000);
        const handleVisibility = () => {
          if (document.visibilityState === "visible") checkUpdate();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("online", checkUpdate);
      }
    },
    onRegisterError(err) {
      console.warn("[PWA] Error de registro:", err);
    },
  });

  React.useEffect(() => {
    (window as any).__simularActualizacion = () => {
      setNeedRefresh(true);
    };
  }, [setNeedRefresh]);

  return (
    <IonAlert
      isOpen={needRefresh}
      backdropDismiss={false}
      header="Actualización Disponible"
      message="Hay una nueva versión de Facturación PWA disponible. Es necesario actualizar para continuar."
      buttons={[
        {
          text: "Actualizar Ahora",
          handler: async () => {
            await updateServiceWorker(true);
            setTimeout(() => {
              window.location.reload();
            }, 500);
          },
        },
      ]}
    />
  );
}

const App: React.FC = () => (
  <IonApp>
    <UpdatePrompt />
    <OfflineBanner />
    <PwaInstallGate>
      <IonReactRouter>
        <MenuLateral />
        <IonRouterOutlet id="main-content">
          <Route exact path="/home" component={Home} />
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </PwaInstallGate>
  </IonApp>
);

export default App;
