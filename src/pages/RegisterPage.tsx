import React, { useState, useEffect } from "react";
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
  locationOutline,
  receiptOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
  callOutline,
  mailOutline,
  fingerPrintOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { VentioLogo } from "../components/VentioLogo";
import { useAuth } from "../context/AuthContext";
import { passkeyService } from "../services/passkeyService";
import { CatalogoItemDto } from "../api/facturacionApi";
import {
  catalogosService,
  DEFAULT_ESTADOS,
  DEFAULT_FORMAS_PAGO,
  DEFAULT_REGIMENES_FISCALES,
  DEFAULT_USOS_CFDI,
} from "../services/catalogosService";

export const RegisterPage: React.FC = () => {
  const history = useHistory();
  const { register } = useAuth();
  const [present] = useIonToast();

  const [regimenes, setRegimenes] = useState<CatalogoItemDto[]>(DEFAULT_REGIMENES_FISCALES);
  const [usosCfdi, setUsosCfdi] = useState<CatalogoItemDto[]>(DEFAULT_USOS_CFDI);
  const [formasPago, setFormasPago] = useState<CatalogoItemDto[]>(DEFAULT_FORMAS_PAGO);
  const [estadosCatalogo, setEstadosCatalogo] = useState<CatalogoItemDto[]>(DEFAULT_ESTADOS);

  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [noExterior, setNoExterior] = useState("");
  const [noInterior, setNoInterior] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("Coahuila");
  const [cp, setCp] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [regimenFiscal, setRegimenFiscal] = useState("612");
  const [formaPago, setFormaPago] = useState("01");
  const [usoCfdi, setUsoCfdi] = useState("G03");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guardarPasskey, setGuardarPasskey] = useState(true);
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    passkeyService.isPlatformAvailable().then((available) => {
      setSupportsPasskey(available || passkeyService.isSupported());
    });
    catalogosService.obtenerCatalogosSat().then((data) => {
      setRegimenes(data.regimenes);
      setUsosCfdi(data.usosCfdi);
      setFormasPago(data.formasPago);
      setEstadosCatalogo(data.estados);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const rfcTrim = rfc.trim().toUpperCase();
    const razonTrim = razonSocial.trim();
    const cpTrim = cp.trim();
    const telTrim = telefono.trim();
    const emailTrim = email.trim().toLowerCase();

    if (!rfcTrim || rfcTrim.length < 12 || rfcTrim.length > 13) {
      present({
        message: "Ingresa un RFC válido de 12 o 13 caracteres.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!razonTrim) {
      present({
        message: "Ingresa la Razón Social o Nombre Completo.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!cpTrim || cpTrim.length !== 5) {
      present({
        message: "Ingresa un Código Postal válido de 5 dígitos.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!telTrim || telTrim.length < 10) {
      present({
        message: "Ingresa un teléfono o celular de al menos 10 dígitos.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (!emailTrim || !/^([\w.-]+)@([\w-]+)((\.(\w){2,3})+)$/.test(emailTrim)) {
      present({
        message: "Ingresa un correo electrónico con formato válido.",
        duration: 2500,
        color: "warning",
        position: "top",
      });
      return;
    }

    if (password.length < 3 || password.length > 13) {
      present({
        message: "La contraseña debe tener entre 3 y 13 caracteres.",
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
        rfc: rfc.trim().toUpperCase(),
        razonSocial: razonSocial.trim().toUpperCase(),
        mail: email.trim().toLowerCase(),
        contraseña: password,
        confirmarContraseña: confirmPassword,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        numeroExt: noExterior.trim(),
        numeroInt: noInterior.trim(),
        colonia: colonia.trim(),
        ciudad: ciudad.trim(),
        delegacion: municipio.trim(),
        estado: estado.trim(),
        codigoPostal: cp.trim(),
        regimenFiscal,
        formaPago,
        usoCfdi,
      });

      if (guardarPasskey && supportsPasskey) {
        try {
          await passkeyService.registrarPasskey(
            email.trim(),
            razonSocial.trim(),
          );
          present({
            message: "¡Registro completado y Passkey guardada con éxito!",
            duration: 2500,
            color: "success",
            position: "top",
          });
        } catch (passErr: any) {
          if (passErr.name !== "NotAllowedError") {
            present({
              message:
                "¡Registro completado! Podrás configurar tu Passkey después.",
              duration: 2500,
              color: "warning",
              position: "top",
            });
          } else {
            present({
              message: "¡Registro completado exitosamente!",
              duration: 2000,
              color: "success",
              position: "top",
            });
          }
        }
      } else {
        present({
          message: "¡Registro completado exitosamente!",
          duration: 2000,
          color: "success",
          position: "top",
        });
      }

      history.replace("/home");
    } catch (err: any) {
      present({
        message: err.message || "No fue posible completar el registro. Intenta de nuevo.",
        duration: 3500,
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
          <div className="w-full max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => history.push("/login")}
                className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
              >
                <IonIcon icon={arrowBackOutline} className="text-xl" />
              </button>

              <div className="flex items-center gap-2">
                <VentioLogo className="w-6 h-6 shrink-0" />
                <span className="text-xs font-black tracking-wider uppercase text-[#010080]">
                  VENTIO
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-8">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
                  Registro de Datos Fiscales
                </h1>
                <p className="text-xs text-slate-500">
                  Captura tu información fiscal y de facturación para la emisión
                  de tus comprobantes
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#010080]">
                    <IonIcon
                      icon={businessOutline}
                      className="text-lg text-[#0b5ed7]"
                    />
                    <span>Datos del Contribuyente</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700">
                        RFC *
                      </label>
                      <input
                        type="text"
                        maxLength={13}
                        value={rfc}
                        onChange={(e) => setRfc(e.target.value.toUpperCase())}
                        placeholder="XAXX010101000"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm font-bold tracking-wider text-slate-800 uppercase bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Razón Social / Nombre Completo *
                      </label>
                      <input
                        type="text"
                        maxLength={300}
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                        placeholder="Nombre o empresa tal como aparece en CSF"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#010080]">
                    <IonIcon
                      icon={locationOutline}
                      className="text-lg text-[#0b5ed7]"
                    />
                    <span>Domicilio Fiscal</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div className="space-y-1.5 sm:col-span-4">
                      <label className="text-xs font-bold text-slate-700">
                        Dirección (Calle)
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        placeholder="Nombre de la calle"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700">
                        No. Ext.
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        value={noExterior}
                        onChange={(e) => setNoExterior(e.target.value)}
                        placeholder="Ext."
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700">
                        No. Int.
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        value={noInterior}
                        onChange={(e) => setNoInterior(e.target.value)}
                        placeholder="Int."
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-4">
                      <label className="text-xs font-bold text-slate-700">
                        Colonia
                      </label>
                      <input
                        type="text"
                        maxLength={60}
                        value={colonia}
                        onChange={(e) => setColonia(e.target.value)}
                        placeholder="Colonia o Fraccionamiento"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Código Postal (CP) *
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cp}
                        onChange={(e) =>
                          setCp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="5 dígitos"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Deleg. / Municipio
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={municipio}
                        onChange={(e) => setMunicipio(e.target.value)}
                        placeholder="Municipio o Alcaldía"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        placeholder="Ciudad"
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Estado
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all cursor-pointer"
                      >
                        {estadosCatalogo.map((item) => (
                          <option key={item.numero} value={item.descripcion}>
                            {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#010080]">
                    <IonIcon
                      icon={receiptOutline}
                      className="text-lg text-[#0b5ed7]"
                    />
                    <span>Datos Fiscales CFDI 4.0</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-3">
                      <label className="text-xs font-bold text-slate-700">
                        Régimen Fiscal *
                      </label>
                      <select
                        value={regimenFiscal}
                        onChange={(e) => setRegimenFiscal(e.target.value)}
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all cursor-pointer"
                      >
                        {regimenes.map((item) => (
                          <option key={item.numero} value={item.numero}>
                            {item.numero} - {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">
                        Uso de CFDI *
                      </label>
                      <select
                        value={usoCfdi}
                        onChange={(e) => setUsoCfdi(e.target.value)}
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all cursor-pointer"
                      >
                        {usosCfdi.map((item) => (
                          <option key={item.numero} value={item.numero}>
                            {item.numero} - {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-700">
                        Forma de Pago
                      </label>
                      <select
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                        className="w-full min-h-12 h-12 px-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all cursor-pointer"
                      >
                        {formasPago.map((item) => (
                          <option key={item.numero} value={item.numero}>
                            {item.numero} - {item.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-black text-[#010080]">
                    <IonIcon
                      icon={lockClosedOutline}
                      className="text-lg text-[#0b5ed7]"
                    />
                    <span>Contacto y Acceso a la Cuenta</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Teléfono / Celular *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                          <IonIcon icon={callOutline} className="text-lg" />
                        </span>
                        <input
                          type="tel"
                          maxLength={15}
                          value={telefono}
                          onChange={(e) =>
                            setTelefono(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder="10 dígitos"
                          className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Correo Electrónico *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                          <IonIcon icon={mailOutline} className="text-lg" />
                        </span>
                        <input
                          type="email"
                          maxLength={80}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ejemplo@correo.com"
                          className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Contraseña *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                          <IonIcon
                            icon={lockClosedOutline}
                            className="text-lg"
                          />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          maxLength={13}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="De 3 a 13 caracteres"
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Repita Contraseña *
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                          <IonIcon
                            icon={lockClosedOutline}
                            className="text-lg"
                          />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          maxLength={13}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite la contraseña"
                          className="w-full min-h-12 h-12 pl-11 pr-4 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
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
                        Inicia sesión en tus próximos accesos sin contraseñas,
                        usando la huella digital, Face ID o Windows Hello de tu
                        celular o laptop.
                      </p>
                      <span className="inline-block text-[11px] font-bold text-[#0b5ed7]">
                        Recomendado • Opcional
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto sm:flex-1 shrink-0 min-h-12 py-3 px-6 bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white font-extrabold text-sm leading-snug rounded-xl transition-all shadow-lg shadow-[#010080]/20 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {loading ? (
                      <IonSpinner name="dots" className="text-white h-5" />
                    ) : (
                      <>
                        <IonIcon
                          icon={checkmarkCircleOutline}
                          className="text-lg shrink-0"
                        />
                        <span>Guardar y Registrarse</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => history.push("/login")}
                    className="w-full sm:w-auto shrink-0 min-h-12 py-3 px-6 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-[#010080] font-bold text-sm leading-snug rounded-xl transition-all flex items-center justify-center whitespace-nowrap"
                  >
                    Regresar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
