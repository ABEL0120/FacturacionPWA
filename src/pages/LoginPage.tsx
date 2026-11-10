import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  fingerPrintOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { VentioLogo } from "../components/VentioLogo";
import { useAuth } from "../context/AuthContext";
import { passkeyService } from "../services/passkeyService";

export const LoginPage: React.FC = () => {
  const history = useHistory();
  const { login, loginWithPasskey } = useAuth();
  const [present] = useIonToast();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    passkeyService.isPlatformAvailable().then((available) => {
      setSupportsPasskey(available || passkeyService.isSupported());
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim()) {
      present({
        message: "Por favor ingresa tu correo electrónico o teléfono.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!password.trim()) {
      present({
        message: "Por favor introduce tu contraseña.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const session = await login(usuario, password);
      const isMenuModulo = session.moduloDestino === "Menu";
      present({
        message: isMenuModulo
          ? "Bienvenido. Sesión iniciada en Menú Principal."
          : "¡Bienvenido! Sesión iniciada correctamente.",
        duration: 1800,
        color: "success",
        position: "top",
      });
      history.replace("/home");
    } catch (err: any) {
      present({
        message:
          err.message || "Error al iniciar sesión. Verifica tus credenciales.",
        duration: 3500,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    try {
      await loginWithPasskey();
      present({
        message: "¡Autenticación con Passkey exitosa!",
        duration: 1800,
        color: "success",
        position: "top",
      });
      history.replace("/home");
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        present({
          message: err.message || "No se pudo verificar la Passkey.",
          duration: 2500,
          color: "warning",
          position: "top",
        });
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-slate-100">
        <div className="min-h-full flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md mx-auto my-auto space-y-6">
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

            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-800">
                  Iniciar Sesión
                </h2>
                <p className="text-xs text-slate-500">
                  Ingresa con tu cuenta para gestionar tus facturas y RFCs
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Correo Electrónico o Teléfono
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <IonIcon icon={mailOutline} className="text-lg" />
                    </span>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => history.push("/recuperar")}
                      className="inline-flex items-center py-1 px-1 text-[11px] font-bold text-[#0b5ed7] hover:text-[#010080] hover:underline transition-colors shrink-0"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <IonIcon icon={lockClosedOutline} className="text-lg" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-12 h-12 pl-11 pr-12 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <IonIcon
                        icon={showPassword ? eyeOffOutline : eyeOutline}
                        className="text-lg"
                      />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || passkeyLoading}
                  className="w-full min-h-12 py-3 px-5 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-lg shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wider shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <IonSpinner name="dots" className="text-white h-5" />
                  ) : (
                    <>
                      <span>Ingresar con Contraseña</span>
                      <IonIcon
                        icon={arrowForwardOutline}
                        className="text-base shrink-0"
                      />
                    </>
                  )}
                </button>
              </form>

              {supportsPasskey && (
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    disabled={passkeyLoading || loading}
                    onClick={handlePasskeyLogin}
                    className="w-full min-h-12 py-3 px-5 bg-slate-50 hover:bg-[#eef5ff] active:scale-[0.99] border-2 border-slate-200 hover:border-[#0b5ed7] text-[#010080] font-black text-xs sm:text-sm leading-snug rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {passkeyLoading ? (
                      <IonSpinner name="dots" className="text-[#010080] h-5" />
                    ) : (
                      <>
                        <IonIcon
                          icon={fingerPrintOutline}
                          className="text-xl text-[#0b5ed7] shrink-0"
                        />
                        <span>Iniciar con Passkey</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-3 text-center">
                <div className="text-xs text-slate-500">
                  ¿Aún no tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => history.push("/registro")}
                    className="inline-flex items-center py-1 px-1.5 font-bold text-[#0b5ed7] hover:text-[#010080] hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
