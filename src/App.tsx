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
import Home from "./pages/Home";

/* Ionic Core CSS */
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
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (r) {
        const checkUpdate = () => {
          if (typeof navigator === "undefined" || !navigator.onLine) return;
          if (!r.active || r.installing || r.waiting) return;
          try {
            const p = r.update();
            if (p && typeof p.catch === "function") {
              p.catch(() => {});
            }
          } catch {}
        };
        const intervalId = setInterval(checkUpdate, 60000);
        const handleVisibility = () => {
          if (document.visibilityState === "visible") checkUpdate();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("online", checkUpdate);
      }
    },
    onRegisterError() {},
  });

  return (
    <IonAlert
      isOpen={needRefresh}
      backdropDismiss={false}
      header="Actualización Disponible"
      message="Hay una nueva versión de Facturación PWA disponible."
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
        <IonRouterOutlet>
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
