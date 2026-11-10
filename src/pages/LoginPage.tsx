import React, { useState } from "react";
import {
  arrowForwardOutline,
  fingerPrintOutline,
  lockClosedOutline,
  mailOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../hooks/useAlert";
import { usePasskeySupport } from "../hooks/usePasskeySupport";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, isNotAllowedError } from "../utils/formatters";
import { ActionButton } from "../components/common/ActionButton";
import { AuthPageLayout } from "../components/common/AuthPageLayout";
import { FormInput, PasswordInput } from "../components/common/FormField";

export const LoginPage: React.FC = () => {
  const history = useHistory();
  const { login, loginWithPasskey } = useAuth();
  const { showSuccess, showWarning } = useToast();
  const { showErrorAlert, showWarningAlert } = useAlert();
  const supportsPasskey = usePasskeySupport();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim()) {
      showWarning("Por favor ingresa tu correo electrónico o teléfono.");
      return;
    }

    if (!password.trim()) {
      showWarning("Por favor introduce tu contraseña.");
      return;
    }

    setLoading(true);
    let errorMsg: string | null = null;
    try {
      const session = await login(usuario, password);
      const isMenuModulo = session.moduloDestino === "Menu";
      showSuccess(
        isMenuModulo
          ? "Bienvenido. Sesión iniciada en Menú Principal."
          : "¡Bienvenido! Sesión iniciada correctamente.",
        2200,
      );
      history.replace("/home");
    } catch (err: unknown) {
      errorMsg = getErrorMessage(
        err,
        "Error al iniciar sesión. Verifica tus credenciales.",
      );
    } finally {
      setLoading(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo iniciar sesión",
        message: errorMsg,
      });
    }
  };

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    let warningMsg: string | null = null;
    try {
      await loginWithPasskey();
      showSuccess("¡Autenticación con Passkey exitosa!", 2000);
      history.replace("/home");
    } catch (err: unknown) {
      if (!isNotAllowedError(err)) {
        warningMsg = getErrorMessage(err, "No se pudo verificar la Passkey.");
      }
    } finally {
      setPasskeyLoading(false);
    }

    if (warningMsg) {
      await showWarningAlert({
        title: "Error con Passkey",
        message: warningMsg,
      });
    }
  };

  return (
    <AuthPageLayout maxWidth="sm" showCenteredLogo centerVertically>
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500">
            Ingresa con tu cuenta para gestionar tus facturas y RFCs
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Correo Electrónico o Teléfono"
            icon={mailOutline}
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="ejemplo@correo.com"
          />

          <PasswordInput
            label="Contraseña"
            icon={lockClosedOutline}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((prev) => !prev)}
            hintRight={
              <button
                type="button"
                onClick={() => history.push("/recuperar")}
                className="inline-flex items-center py-1 px-1 text-[11px] font-bold text-[#0b5ed7] hover:text-[#010080] hover:underline transition-colors shrink-0"
              >
                ¿Olvidaste tu contraseña?
              </button>
            }
          />

          <ActionButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={passkeyLoading}
            icon={arrowForwardOutline}
            iconPosition="end"
            iconClassName="text-base shrink-0"
            className="w-full px-5"
          >
            Ingresar con Contraseña
          </ActionButton>
        </form>

        {supportsPasskey && (
          <div className="space-y-3 pt-1">
            <ActionButton
              variant="outlinePasskey"
              loading={passkeyLoading}
              disabled={loading}
              onClick={handlePasskeyLogin}
              icon={fingerPrintOutline}
              iconClassName="text-xl text-[#0b5ed7] shrink-0"
              className="w-full px-5 text-xs sm:text-sm"
            >
              Iniciar con Passkey
            </ActionButton>
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
    </AuthPageLayout>
  );
};

export default LoginPage;
