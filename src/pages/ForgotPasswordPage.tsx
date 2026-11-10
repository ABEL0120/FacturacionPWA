import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  businessOutline,
  checkmarkCircleOutline,
  keyOutline,
  lockClosedOutline,
  mailOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { authService } from "../services/authService";
import { useAlert } from "../hooks/useAlert";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/formatters";
import {
  esEmailValido,
  esPasswordLongitudValida,
  esRfcLongitudValida,
  normalizarRfc,
} from "../utils/validators";
import { ActionButton } from "../components/common/ActionButton";
import { AuthPageLayout } from "../components/common/AuthPageLayout";
import { FormInput, PasswordInput } from "../components/common/FormField";

export const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const { showWarning, showError } = useToast();
  const { showErrorAlert } = useAlert();

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [rfc, setRfc] = useState("");
  const [contacto, setContacto] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerificarDatos = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esRfcLongitudValida(rfc)) {
      showWarning("Ingresa tu RFC registrado de 12 o 13 caracteres.");
      return;
    }

    const emailTrim = contacto.trim().toLowerCase();
    if (!esEmailValido(emailTrim)) {
      showWarning(
        "Ingresa el correo electrónico registrado con formato válido.",
      );
      return;
    }

    setLoading(true);
    let errorMsg: string | null = null;
    try {
      await authService.validarCuentaRecuperacion(
        normalizarRfc(rfc),
        emailTrim,
      );
      setPaso(2);
    } catch (err: unknown) {
      errorMsg = getErrorMessage(
        err,
        "No se encontró una cuenta con esos datos.",
      );
    } finally {
      setLoading(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "Datos no verificados",
        message: errorMsg,
      });
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!esPasswordLongitudValida(nuevaPassword)) {
      showWarning("La nueva contraseña debe tener entre 3 y 13 caracteres.");
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      showError("Las contraseñas no coinciden.", 2500);
      return;
    }

    setLoading(true);
    let errorMsg: string | null = null;
    try {
      await authService.recuperarContrasena({
        rfc: normalizarRfc(rfc),
        mail: contacto.trim().toLowerCase(),
        nuevaContrasena: nuevaPassword,
        confirmarNuevaContrasena: confirmarPassword,
      });
      setPaso(3);
    } catch (err: unknown) {
      errorMsg = getErrorMessage(
        err,
        "No fue posible actualizar la contraseña.",
      );
    } finally {
      setLoading(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "Error al actualizar contraseña",
        message: errorMsg,
      });
    }
  };

  return (
    <AuthPageLayout
      maxWidth="sm"
      centerVertically
      onBack={() => history.push("/login")}
    >
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        {paso === 1 && (
          <>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0b5ed7]">
                Paso 1 de 2
              </span>
              <h1 className="text-2xl font-black text-slate-800">
                Recuperar Contraseña
              </h1>
              <p className="text-xs text-slate-500">
                Verificaremos tu identidad mediante tu RFC y correo electrónico
                registrado
              </p>
            </div>

            <form onSubmit={handleVerificarDatos} className="space-y-4">
              <FormInput
                label="RFC Registrado *"
                icon={businessOutline}
                type="text"
                maxLength={13}
                value={rfc}
                onChange={(e) => setRfc(normalizarRfc(e.target.value))}
                placeholder="XAXX010101000"
                className="font-semibold tracking-wider uppercase"
              />

              <FormInput
                label="Correo Electrónico Registrado *"
                icon={mailOutline}
                type="email"
                maxLength={80}
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="tu@correo.com"
              />

              <div className="pt-2">
                <ActionButton
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full px-5"
                >
                  Validar y Continuar
                </ActionButton>
              </div>
            </form>
          </>
        )}

        {paso === 2 && (
          <>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0b5ed7]">
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
              <PasswordInput
                label="Nueva Contraseña *"
                icon={lockClosedOutline}
                maxLength={13}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="De 3 a 13 caracteres"
                showPassword={showPassword}
                onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              />

              <PasswordInput
                label="Repite la Contraseña *"
                icon={lockClosedOutline}
                maxLength={13}
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                placeholder="Repite la contraseña"
                showPassword={showPassword}
                showToggleButton={false}
              />

              <div className="pt-2 space-y-2.5">
                <ActionButton
                  type="submit"
                  variant="accent"
                  loading={loading}
                  icon={keyOutline}
                  iconClassName="text-lg shrink-0"
                  className="w-full px-5 shadow-lg"
                >
                  Actualizar Contraseña
                </ActionButton>

                <ActionButton
                  variant="neutral"
                  size="sm"
                  onClick={() => setPaso(1)}
                  className="w-full px-4 text-slate-600 hover:text-slate-800"
                >
                  Volver al paso anterior
                </ActionButton>
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
                Tu contraseña ha sido restablecida exitosamente. Ya puedes
                iniciar sesión con tu nueva clave.
              </p>
            </div>

            <ActionButton
              variant="primary"
              onClick={() => history.replace("/login")}
              className="w-full px-5"
            >
              Ir a Iniciar Sesión
            </ActionButton>
          </div>
        )}

        {paso !== 3 && (
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            ¿Recordaste tu contraseña?{" "}
            <button
              type="button"
              onClick={() => history.push("/login")}
              className="inline-flex items-center py-1 px-1.5 font-bold text-[#0b5ed7] hover:text-[#010080] hover:underline"
            >
              Inicia sesión
            </button>
          </div>
        )}
      </div>
    </AuthPageLayout>
  );
};

export default ForgotPasswordPage;
