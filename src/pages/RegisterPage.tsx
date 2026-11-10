import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  businessOutline,
  callOutline,
  checkmarkCircleOutline,
  fingerPrintOutline,
  locationOutline,
  lockClosedOutline,
  mailOutline,
  receiptOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { passkeyService } from "../services/passkeyService";
import { useAlert } from "../hooks/useAlert";
import { useCatalogosSat } from "../hooks/useCatalogosSat";
import { usePasskeySupport } from "../hooks/usePasskeySupport";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, isNotAllowedError } from "../utils/formatters";
import {
  esCodigoPostalValido,
  esEmailValido,
  esPasswordLongitudValida,
  esRfcLongitudValida,
  esTelefonoValido,
  normalizarRfc,
  soloDigitos,
} from "../utils/validators";
import { ActionButton } from "../components/common/ActionButton";
import { AuthPageLayout } from "../components/common/AuthPageLayout";
import {
  FormInput,
  FormSelect,
  PasswordInput,
} from "../components/common/FormField";
import { SectionTitle } from "../components/common/SectionTitle";

interface RegisterFormState {
  rfc: string;
  razonSocial: string;
  direccion: string;
  noExterior: string;
  noInterior: string;
  colonia: string;
  municipio: string;
  ciudad: string;
  estado: string;
  cp: string;
  telefono: string;
  email: string;
  regimenFiscal: string;
  formaPago: string;
  usoCfdi: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
  rfc: "",
  razonSocial: "",
  direccion: "",
  noExterior: "",
  noInterior: "",
  colonia: "",
  municipio: "",
  ciudad: "",
  estado: "",
  cp: "",
  telefono: "",
  email: "",
  regimenFiscal: "612",
  formaPago: "01",
  usoCfdi: "G03",
  password: "",
  confirmPassword: "",
};

export const RegisterPage: React.FC = () => {
  const history = useHistory();
  const { register } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();
  const { showErrorAlert, showWarningAlert } = useAlert();
  const supportsPasskey = usePasskeySupport();
  const { regimenes, usosCfdi, formasPago, estados, defaultEstado } =
    useCatalogosSat();

  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [guardarPasskey, setGuardarPasskey] = useState(true);
  const [loading, setLoading] = useState(false);

  const estadoActual = form.estado || defaultEstado;

  const updateField = <K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validarFormulario = (): boolean => {
    if (!esRfcLongitudValida(form.rfc)) {
      showWarning("Ingresa un RFC válido de 12 o 13 caracteres.");
      return false;
    }

    if (!form.razonSocial.trim()) {
      showWarning("Ingresa la Razón Social o Nombre Completo.");
      return false;
    }

    if (!esCodigoPostalValido(form.cp)) {
      showWarning("Ingresa un Código Postal válido de 5 dígitos.");
      return false;
    }

    if (!esTelefonoValido(form.telefono)) {
      showWarning("Ingresa un teléfono o celular de al menos 10 dígitos.");
      return false;
    }

    if (!esEmailValido(form.email)) {
      showWarning("Ingresa un correo electrónico con formato válido.");
      return false;
    }

    if (!esPasswordLongitudValida(form.password)) {
      showWarning("La contraseña debe tener entre 3 y 13 caracteres.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      showError("Las contraseñas no coinciden.", 2500);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const rfcLimpio = normalizarRfc(form.rfc);
    const razonTrim = form.razonSocial.trim().toUpperCase();
    const emailTrim = form.email.trim().toLowerCase();
    const telefonoTrim = form.telefono.trim();

    setLoading(true);
    let registerError: string | null = null;
    let passkeyFallbackWarning = false;
    let redirectToHome = false;

    try {
      const session = await register({
        rfc: rfcLimpio,
        razonSocial: razonTrim,
        mail: emailTrim,
        contraseña: form.password,
        confirmarContraseña: form.confirmPassword,
        telefono: telefonoTrim,
        direccion: form.direccion.trim(),
        numeroExt: form.noExterior.trim(),
        numeroInt: form.noInterior.trim(),
        colonia: form.colonia.trim(),
        ciudad: form.ciudad.trim(),
        delegacion: form.municipio.trim(),
        estado: estadoActual.trim(),
        codigoPostal: form.cp.trim(),
        regimenFiscal: form.regimenFiscal,
        formaPago: form.formaPago,
        usoCfdi: form.usoCfdi,
      });

      if (guardarPasskey && supportsPasskey) {
        try {
          await passkeyService.registrarPasskey(
            form.email.trim(),
            form.razonSocial.trim(),
            {
              numeroCliente: session.numeroCliente,
              rfc: rfcLimpio,
              telefono: telefonoTrim,
              moduloDestino: session.moduloDestino,
            },
          );
          showSuccess("¡Registro completado y Passkey guardada con éxito!", 2600);
        } catch (passErr: unknown) {
          if (!isNotAllowedError(passErr)) {
            passkeyFallbackWarning = true;
          } else {
            showSuccess("¡Registro completado exitosamente!", 2200);
          }
        }
      } else {
        showSuccess("¡Registro completado exitosamente!", 2200);
      }

      redirectToHome = true;
    } catch (err: unknown) {
      registerError = getErrorMessage(
        err,
        "No fue posible completar el registro. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }

    if (registerError) {
      await showErrorAlert({
        title: "No se pudo completar el registro",
        message: registerError,
      });
      return;
    }

    if (passkeyFallbackWarning) {
      await showWarningAlert({
        title: "Cuenta registrada",
        message:
          "Tu cuenta se creó correctamente, pero no fue posible configurar tu Passkey en este momento. Podrás usar tu contraseña para iniciar sesión.",
      });
    }

    if (redirectToHome) {
      history.replace("/home");
    }
  };

  return (
    <AuthPageLayout maxWidth="lg" onBack={() => history.push("/login")}>
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Registro de Datos Fiscales
          </h1>
          <p className="text-xs text-slate-500">
            Captura tu información fiscal y de facturación para la emisión de
            tus comprobantes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <SectionTitle
              icon={businessOutline}
              title="Datos del Contribuyente"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="RFC *"
                type="text"
                maxLength={13}
                value={form.rfc}
                onChange={(e) =>
                  updateField("rfc", normalizarRfc(e.target.value))
                }
                placeholder="XAXX010101000"
                containerClassName="sm:col-span-1"
                className="font-bold tracking-wider uppercase"
              />

              <FormInput
                label="Razón Social / Nombre Completo *"
                type="text"
                maxLength={300}
                value={form.razonSocial}
                onChange={(e) => updateField("razonSocial", e.target.value)}
                placeholder="Nombre o empresa tal como aparece en CSF"
                containerClassName="sm:col-span-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={locationOutline} title="Domicilio Fiscal" />

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <FormInput
                label="Dirección (Calle)"
                type="text"
                maxLength={100}
                value={form.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                placeholder="Nombre de la calle"
                containerClassName="sm:col-span-4"
              />

              <FormInput
                label="No. Ext."
                type="text"
                maxLength={20}
                value={form.noExterior}
                onChange={(e) => updateField("noExterior", e.target.value)}
                placeholder="Ext."
                containerClassName="sm:col-span-1"
              />

              <FormInput
                label="No. Int."
                type="text"
                maxLength={20}
                value={form.noInterior}
                onChange={(e) => updateField("noInterior", e.target.value)}
                placeholder="Int."
                containerClassName="sm:col-span-1"
              />

              <FormInput
                label="Colonia"
                type="text"
                maxLength={60}
                value={form.colonia}
                onChange={(e) => updateField("colonia", e.target.value)}
                placeholder="Colonia o Fraccionamiento"
                containerClassName="sm:col-span-4"
              />

              <FormInput
                label="Código Postal (CP) *"
                type="text"
                maxLength={5}
                value={form.cp}
                onChange={(e) => updateField("cp", soloDigitos(e.target.value))}
                placeholder="5 dígitos"
                containerClassName="sm:col-span-2"
                className="font-bold"
              />

              <FormInput
                label="Deleg. / Municipio"
                type="text"
                maxLength={100}
                value={form.municipio}
                onChange={(e) => updateField("municipio", e.target.value)}
                placeholder="Municipio o Alcaldía"
                containerClassName="sm:col-span-2"
              />

              <FormInput
                label="Ciudad"
                type="text"
                maxLength={50}
                value={form.ciudad}
                onChange={(e) => updateField("ciudad", e.target.value)}
                placeholder="Ciudad"
                containerClassName="sm:col-span-2"
              />

              <FormSelect
                label="Estado"
                value={estadoActual}
                onChange={(e) => updateField("estado", e.target.value)}
                containerClassName="sm:col-span-2"
              >
                {estados.map((item) => (
                  <option key={item.numero} value={item.descripcion}>
                    {item.descripcion}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle
              icon={receiptOutline}
              title="Datos Fiscales CFDI 4.0"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                label="Régimen Fiscal *"
                value={form.regimenFiscal}
                onChange={(e) => updateField("regimenFiscal", e.target.value)}
                containerClassName="sm:col-span-3"
              >
                {regimenes.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Uso de CFDI *"
                value={form.usoCfdi}
                onChange={(e) => updateField("usoCfdi", e.target.value)}
                containerClassName="sm:col-span-2"
              >
                {usosCfdi.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                label="Forma de Pago"
                value={form.formaPago}
                onChange={(e) => updateField("formaPago", e.target.value)}
                containerClassName="sm:col-span-1"
              >
                {formasPago.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle
              icon={lockClosedOutline}
              title="Contacto y Acceso a la Cuenta"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Teléfono / Celular *"
                icon={callOutline}
                type="tel"
                maxLength={15}
                value={form.telefono}
                onChange={(e) =>
                  updateField("telefono", soloDigitos(e.target.value))
                }
                placeholder="10 dígitos"
              />

              <FormInput
                label="Correo Electrónico *"
                icon={mailOutline}
                type="email"
                maxLength={80}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="ejemplo@correo.com"
              />

              <PasswordInput
                label="Contraseña *"
                icon={lockClosedOutline}
                maxLength={13}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                placeholder="De 3 a 13 caracteres"
                showPassword={showPassword}
                onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              />

              <PasswordInput
                label="Repita Contraseña *"
                icon={lockClosedOutline}
                maxLength={13}
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="Repite la contraseña"
                showPassword={showPassword}
                showToggleButton={false}
              />
            </div>
          </div>

          {supportsPasskey && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#010080]/5 via-blue-50/60 to-[#0b5ed7]/10 border-2 border-[#0b5ed7]/30 shadow-sm flex items-start gap-3.5 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[#010080] flex items-center justify-center shrink-0 shadow-md">
                <IonIcon
                  icon={fingerPrintOutline}
                  className="text-2xl text-[#38bdf8]"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <label
                    htmlFor="passkey-toggle"
                    className="text-sm font-extrabold text-[#010080] cursor-pointer leading-snug"
                  >
                    Guardar contraseña con Passkey / Huella
                  </label>
                  <input
                    id="passkey-toggle"
                    type="checkbox"
                    checked={guardarPasskey}
                    onChange={(e) => setGuardarPasskey(e.target.checked)}
                    className="w-5 h-5 shrink-0 accent-[#0b5ed7] rounded cursor-pointer mt-0.5 sm:mt-0"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inicia sesión en tus próximos accesos sin contraseñas, usando
                  la huella digital, Face ID o Windows Hello de tu celular o
                  laptop.
                </p>
                <span className="inline-block text-[11px] font-bold text-[#0b5ed7]">
                  Recomendado • Opcional
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <ActionButton
              type="submit"
              variant="primary"
              loading={loading}
              icon={checkmarkCircleOutline}
              iconClassName="text-lg shrink-0"
              className="w-full sm:w-auto sm:flex-1"
            >
              Guardar y Registrarse
            </ActionButton>

            <ActionButton
              variant="neutralPrimary"
              onClick={() => history.push("/login")}
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Regresar
            </ActionButton>
          </div>
        </form>
      </div>
    </AuthPageLayout>
  );
};

export default RegisterPage;
