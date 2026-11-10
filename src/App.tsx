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
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

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
    <AuthProvider>
      <UpdatePrompt />
      <OfflineBanner />
      <PwaInstallGate>
        <IonReactRouter>
          <MenuLateral />
          <IonRouterOutlet id="main-content">
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/registro" component={RegisterPage} />
            <Route exact path="/recuperar" component={ForgotPasswordPage} />
            <ProtectedRoute exact path="/home" component={Home} />
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </PwaInstallGate>
    </AuthProvider>
  </IonApp>
);

export default App;
