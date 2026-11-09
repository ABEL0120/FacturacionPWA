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
  personOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { TrompoLogo } from "../components/TrompoLogo";
import { useAuth } from "../context/AuthContext";

export const RegisterPage: React.FC = () => {
  const history = useHistory();
  const { register } = useAuth();
  const [present] = useIonToast();

  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rfc.trim() || rfc.trim().length < 12) {
      present({
        message: "Ingresa un RFC válido (mínimo 12 caracteres).",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!razonSocial.trim()) {
      present({
        message: "Ingresa tu nombre o razón social.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      present({
        message: "Ingresa un correo electrónico válido.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (password.length < 6) {
      present({
        message: "La contraseña debe tener al menos 6 caracteres.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (password !== confirmPassword) {
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
      await register({
        email: email.trim(),
        nombre: razonSocial.trim(),
        rfc: rfc.trim().toUpperCase(),
        telefono: telefono.trim(),
        password,
      });

      present({
        message: "¡Cuenta creada exitosamente! Bienvenido a Facturación.",
        duration: 2000,
        color: "success",
        position: "top",
      });

      history.replace("/home");
    } catch {
      present({
        message: "No fue posible crear la cuenta. Intenta de nuevo.",
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
        <div className="min-h-full py-6 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg mx-auto space-y-6">
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
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-slate-800">
                  Crear Cuenta
                </h1>
                <p className="text-xs text-slate-500">
                  Registra tus datos fiscales para emitir y consultar facturas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    RFC *
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
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm font-semibold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nombre Completo o Razón Social *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400">
                      <IonIcon icon={personOutline} className="text-lg" />
                    </span>
                    <input
                      type="text"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Nombre o empresa fiscal"
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Correo Electrónico *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">
                        <IonIcon icon={mailOutline} className="text-lg" />
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Teléfono Celular
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">
                        <IonIcon icon={callOutline} className="text-lg" />
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                        placeholder="10 dígitos"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Contraseña *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">
                        <IonIcon icon={lockClosedOutline} className="text-lg" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 carácteres"
                        className="w-full h-11 pl-11 pr-10 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-slate-400">
                        <IonIcon icon={lockClosedOutline} className="text-lg" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#142642] focus:ring-2 focus:ring-[#142642]/10 transition-all placeholder:text-slate-400"
                      />
                    </div>
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
                        <IonIcon icon={checkmarkCircleOutline} className="text-lg" />
                        <span>Completar Registro</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => history.push("/login")}
                  className="font-bold text-[#142642] hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;

