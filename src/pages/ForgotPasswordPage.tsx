import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  arrowBackOutline,
  businessOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
  shieldCheckmarkOutline,
  keyOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { TrompoLogo } from "../components/TrompoLogo";
import { useAuth } from "../context/AuthContext";

export const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const { resetPassword } = useAuth();
  const [present] = useIonToast();

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [rfc, setRfc] = useState("");
  const [contacto, setContacto] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerificarDatos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rfc.trim() || rfc.trim().length < 12) {
      present({
        message: "Ingresa tu RFC registrado para continuar.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!contacto.trim()) {
      present({
        message: "Ingresa tu correo o teléfono registrado.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setPaso(2);
    present({
      message: "Datos validados. Ahora ingresa tu nueva contraseña.",
      duration: 2000,
      color: "success",
      position: "top",
    });
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaPassword.length < 6) {
      present({
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      present({
        message: "Las contraseñas no coinciden.",
        duration: 2500,
        color: "danger",
        position: "top",
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(rfc, nuevaPassword);
      setPaso(3);
    } catch {
      present({
        message: "No fue posible actualizar la contraseña.",
        duration: 3000,
        color: "danger",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-slate-100">
        <div className="min-h-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
          <div className="w-full max-w-md mx-auto my-auto space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => history.push("/login")}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <IonIcon icon={arrowBackOutline} className="text-xl" />
              </button>

              <div className="flex items-center gap-2">
                <TrompoLogo className="w-6 h-6" />
                <span className="text-xs font-black tracking-wider uppercase text-[#142642]">
                  El Tizoncito
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
              {paso === 1 && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#f2720c]">
                      Paso 1 de 2
                    </span>
                    <h1 className="text-2xl font-black text-slate-800">
                      Recuperar Contraseña
                    </h1>
                    <p className="text-xs text-slate-500">
                      Verificaremos tu identidad mediante tu RFC y tu medio de contacto registrado
                    </p>
                  </div>

                  <form onSubmit={handleVerificarDatos} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        RFC Registrado *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">
                          <IonIcon icon={businessOutline} className="text-lg" />
                        </span>
                        <input
                          type="text"
                          maxLength={13}
                          value={rfc}
                          onChange={(e) => setRfc(e.target.value.toUpperCase())}
                          placeholder="XAXX010101000"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-semibold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Correo o Teléfono Registrado *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">
                          <IonIcon icon={mailOutline} className="text-lg" />
                        </span>
                        <input
                          type="text"
                          value={contacto}
                          onChange={(e) => setContacto(e.target.value)}
                          placeholder="tu@correo.com o teléfono"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#142642] hover:bg-[#1a3258] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#142642]/20 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                      >
                        {loading ? (
                          <IonSpinner name="dots" className="text-white h-5" />
                        ) : (
                          <>
                            <IonIcon icon={shieldCheckmarkOutline} className="text-lg" />
                            <span>Validar y Continuar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {paso === 2 && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#f2720c]">
                      Paso 2 de 2
                    </span>
                    <h1 className="text-2xl font-black text-slate-800">
                      Nueva Contraseña
                    </h1>
                    <p className="text-xs text-slate-500">
                      Introduce tu nueva contraseña para el RFC <strong>{rfc}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleCambiarPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nueva Contraseña *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">
                          <IonIcon icon={lockClosedOutline} className="text-lg" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={nuevaPassword}
                          onChange={(e) => setNuevaPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          <IonIcon
                            icon={showPassword ? eyeOffOutline : eyeOutline}
                            className="text-lg"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Repite la Contraseña *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400">
                          <IonIcon icon={lockClosedOutline} className="text-lg" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmarPassword}
                          onChange={(e) => setConfirmarPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                          className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#f2720c] hover:bg-[#d96508] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-[#f2720c]/25 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                      >
                        {loading ? (
                          <IonSpinner name="dots" className="text-white h-5" />
                        ) : (
                          <>
                            <IonIcon icon={keyOutline} className="text-lg" />
                            <span>Actualizar Contraseña</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaso(1)}
                        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                      >
                        Volver al paso anterior
                      </button>
                    </div>
                  </form>
                </>
              )}

              {paso === 3 && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                    <IonIcon icon={checkmarkCircleOutline} className="text-4xl" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800">
                      ¡Contraseña Actualizada!
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva clave.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => history.replace("/login")}
                    className="w-full h-12 bg-[#142642] hover:bg-[#1a3258] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#142642]/20 flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <span>Ir a Iniciar Sesión</span>
                  </button>
                </div>
              )}

              {paso !== 3 && (
                <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                  ¿Recordaste tu contraseña?{" "}
                  <button
                    type="button"
                    onClick={() => history.push("/login")}
                    className="font-bold text-[#142642] hover:underline"
                  >
                    Inicia sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPasswordPage;

