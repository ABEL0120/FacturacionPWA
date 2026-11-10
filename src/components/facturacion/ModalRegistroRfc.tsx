import React, { useEffect, useState } from "react";
import { IonIcon, IonModal } from "@ionic/react";
import {
  businessOutline,
  checkmarkCircleOutline,
  closeOutline,
} from "ionicons/icons";
import { UserSession } from "../../types/auth.types";
import {
  CatalogoItemDto,
  ClienteFiscalDto,
} from "../../types/facturacion.types";
import { facturacionService } from "../../services/facturacionService";
import { useAlert } from "../../hooks/useAlert";
import { useToast } from "../../hooks/useToast";
import {
  getErrorMessage,
  resolverEstadoDefault,
} from "../../utils/formatters";
import {
  esCodigoPostalValido,
  esRfcLongitudValida,
  normalizarRfc,
  soloDigitos,
} from "../../utils/validators";
import { ActionButton } from "../common/ActionButton";
import { AlertBanner } from "../common/AlertBanner";
import { FormInput, FormSelect } from "../common/FormField";

interface ModalRegistroRfcProps {
  isOpen: boolean;
  onClose: () => void;
  rfcInicial: string;
  user: UserSession | null;
  estadosCatalogo: CatalogoItemDto[];
  regimenesCatalogo: CatalogoItemDto[];
  usosCfdiCatalogo: CatalogoItemDto[];
  formasPagoCatalogo: CatalogoItemDto[];
  onSuccess: (guardado: ClienteFiscalDto) => Promise<void> | void;
}

interface RegistroRfcFormState {
  rfc: string;
  razonSocial: string;
  direccion: string;
  noExt: string;
  noInt: string;
  colonia: string;
  cp: string;
  municipio: string;
  ciudad: string;
  estado: string;
  regimenFiscal: string;
  usoCfdi: string;
  formaPago: string;
  email: string;
  telefono: string;
}

export const ModalRegistroRfc: React.FC<ModalRegistroRfcProps> = ({
  isOpen,
  onClose,
  rfcInicial,
  user,
  estadosCatalogo,
  regimenesCatalogo,
  usosCfdiCatalogo,
  formasPagoCatalogo,
  onSuccess,
}) => {
  const { showWarning } = useToast();
  const { showErrorAlert } = useAlert();

  const [form, setForm] = useState<RegistroRfcFormState>({
    rfc: "",
    razonSocial: "",
    direccion: "",
    noExt: "",
    noInt: "",
    colonia: "",
    cp: "",
    municipio: "",
    ciudad: "",
    estado: resolverEstadoDefault(estadosCatalogo),
    regimenFiscal: "612",
    usoCfdi: "G03",
    formaPago: "01",
    email: "",
    telefono: "",
  });
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm({
        rfc: normalizarRfc(rfcInicial),
        razonSocial: "",
        direccion: "",
        noExt: "",
        noInt: "",
        colonia: "",
        cp: "",
        municipio: "",
        ciudad: "",
        estado: resolverEstadoDefault(estadosCatalogo),
        regimenFiscal: "612",
        usoCfdi: "G03",
        formaPago: "01",
        email: user?.email || "",
        telefono: user?.telefono || "",
      });
      setModalError("");
    }
  }, [isOpen, rfcInicial, estadosCatalogo, user?.email, user?.telefono]);

  const updateField = <K extends keyof RegistroRfcFormState>(
    key: K,
    value: RegistroRfcFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!user?.numeroCliente || user.numeroCliente <= 0) {
      const msg =
        "Se requiere una sesión de cliente con número de cliente válido para registrar un nuevo RFC.";
      setModalError(msg);
      showWarning(msg);
      return;
    }

    const rfcLimpio = normalizarRfc(form.rfc);
    if (!esRfcLongitudValida(rfcLimpio)) {
      const msg = "Ingresa un RFC válido de 12 o 13 caracteres.";
      setModalError(msg);
      showWarning(msg);
      return;
    }

    if (!form.razonSocial.trim()) {
      const msg = "Ingresa la Razón Social o Nombre Completo.";
      setModalError(msg);
      showWarning(msg);
      return;
    }

    if (!esCodigoPostalValido(form.cp)) {
      const msg = "Ingresa un Código Postal válido de 5 dígitos.";
      setModalError(msg);
      showWarning(msg);
      return;
    }

    setLoadingGuardar(true);
    let errorMsg: string | null = null;
    try {
      const guardado = await facturacionService.registrarRfc({
        numeroCliente: user.numeroCliente,
        rfc: rfcLimpio,
        razonSocial: form.razonSocial.trim().toUpperCase(),
        direccion: form.direccion.trim(),
        numeroExt: form.noExt.trim(),
        numeroInt: form.noInt.trim(),
        colonia: form.colonia.trim(),
        delegacion: form.municipio.trim(),
        ciudad: form.ciudad.trim(),
        estado: form.estado.trim() || "Coahuila",
        codigoPostal: form.cp.trim(),
        regimenFiscal: form.regimenFiscal || "612",
        formaPago: form.formaPago || "01",
        usoCfdi: form.usoCfdi || "G03",
        telefono: form.telefono.trim(),
        mail: form.email.trim(),
      });

      await onSuccess(guardado);
    } catch (err: unknown) {
      errorMsg = getErrorMessage(err, "No fue posible guardar el RFC.");
      setModalError(errorMsg);
    } finally {
      setLoadingGuardar(false);
    }

    if (errorMsg) {
      await showErrorAlert({
        title: "No se pudo guardar el RFC",
        message: errorMsg,
      });
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="ion-modal-custom"
    >
      <div className="h-full bg-slate-100 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#010080] text-white flex items-center justify-center shrink-0">
                <IonIcon
                  icon={businessOutline}
                  className="text-lg text-[#38bdf8]"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-slate-800">
                  Registro de RFC Receptor
                </h2>
                <p className="text-[11px] text-slate-500">
                  Completa los datos fiscales del RFC
                  {user?.numeroCliente && user.numeroCliente > 0
                    ? ` • Cliente #${user.numeroCliente}`
                    : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
            >
              <IonIcon icon={closeOutline} className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <FormInput
                compact
                surface="readonly"
                label="Id. Cliente"
                type="text"
                readOnly
                value={
                  user?.numeroCliente && user.numeroCliente > 0
                    ? String(user.numeroCliente)
                    : "N/A"
                }
                containerClassName="sm:col-span-1"
                className="font-bold"
              />

              <FormInput
                compact
                label="RFC *"
                type="text"
                maxLength={13}
                value={form.rfc}
                onChange={(e) =>
                  updateField("rfc", normalizarRfc(e.target.value))
                }
                containerClassName="sm:col-span-2"
                className="border-slate-300 font-bold uppercase"
              />

              <FormInput
                compact
                label="Razón Social / Nombre Completo *"
                type="text"
                maxLength={300}
                value={form.razonSocial}
                onChange={(e) => updateField("razonSocial", e.target.value)}
                placeholder="Tal como aparece en Constancia de Situación Fiscal"
                containerClassName="sm:col-span-3"
                className="border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <FormInput
                compact
                label="Calle / Dirección"
                type="text"
                maxLength={100}
                value={form.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                placeholder="Calle o avenida"
                containerClassName="sm:col-span-4"
                className="border-slate-300"
              />

              <FormInput
                compact
                label="No. Ext."
                type="text"
                maxLength={20}
                value={form.noExt}
                onChange={(e) => updateField("noExt", e.target.value)}
                placeholder="Ext."
                containerClassName="sm:col-span-1"
                className="border-slate-300"
              />

              <FormInput
                compact
                label="No. Int."
                type="text"
                maxLength={20}
                value={form.noInt}
                onChange={(e) => updateField("noInt", e.target.value)}
                placeholder="Int."
                containerClassName="sm:col-span-1"
                className="border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                compact
                label="Colonia"
                type="text"
                maxLength={60}
                value={form.colonia}
                onChange={(e) => updateField("colonia", e.target.value)}
                placeholder="Colonia"
                containerClassName="sm:col-span-2"
                className="border-slate-300"
              />

              <FormInput
                compact
                label="Código Postal (CP) *"
                type="text"
                maxLength={5}
                value={form.cp}
                onChange={(e) => updateField("cp", soloDigitos(e.target.value))}
                placeholder="5 dígitos"
                containerClassName="sm:col-span-1"
                className="border-slate-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                compact
                label="Delegación / Municipio"
                type="text"
                maxLength={100}
                value={form.municipio}
                onChange={(e) => updateField("municipio", e.target.value)}
                placeholder="Municipio"
                className="border-slate-300"
              />

              <FormInput
                compact
                label="Ciudad"
                type="text"
                maxLength={50}
                value={form.ciudad}
                onChange={(e) => updateField("ciudad", e.target.value)}
                placeholder="Ciudad"
                className="border-slate-300"
              />

              <FormSelect
                compact
                label="Estado"
                value={form.estado}
                onChange={(e) => updateField("estado", e.target.value)}
                className="border-slate-300"
              >
                {estadosCatalogo.map((item) => (
                  <option key={item.numero} value={item.descripcion}>
                    {item.descripcion}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormSelect
                compact
                label="Régimen Fiscal *"
                value={form.regimenFiscal}
                onChange={(e) => updateField("regimenFiscal", e.target.value)}
                containerClassName="sm:col-span-3"
                className="border-slate-300"
              >
                {regimenesCatalogo.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                compact
                label="Uso de CFDI *"
                value={form.usoCfdi}
                onChange={(e) => updateField("usoCfdi", e.target.value)}
                containerClassName="sm:col-span-2"
                className="border-slate-300"
              >
                {usosCfdiCatalogo.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>

              <FormSelect
                compact
                label="Forma de Pago"
                value={form.formaPago}
                onChange={(e) => updateField("formaPago", e.target.value)}
                containerClassName="sm:col-span-1"
                className="border-slate-300"
              >
                {formasPagoCatalogo.map((item) => (
                  <option key={item.numero} value={item.numero}>
                    {item.numero} - {item.descripcion}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                compact
                label="Correo Electrónico"
                type="email"
                maxLength={80}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="factura@correo.com"
                className="border-slate-300"
              />

              <FormInput
                compact
                label="Teléfono / Celular"
                type="tel"
                maxLength={50}
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                placeholder="10 dígitos"
                className="border-slate-300"
              />
            </div>

            {modalError && <AlertBanner variant="error" message={modalError} />}

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <ActionButton
                type="submit"
                variant="primary"
                loading={loadingGuardar}
                icon={checkmarkCircleOutline}
                iconClassName="text-base shrink-0"
                className="w-full sm:w-auto sm:flex-1 text-xs sm:text-sm tracking-wide"
              >
                Guardar RFC y Continuar
              </ActionButton>

              <ActionButton
                variant="neutral"
                onClick={onClose}
                className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap"
              >
                Cancelar
              </ActionButton>
            </div>
          </form>
        </div>
      </div>
    </IonModal>
  );
};
