import React from "react";
import { IonContent, IonPage, IonSpinner } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFacturacionFlow } from "../hooks/useFacturacionFlow";
import { AlertBanner } from "../components/common/AlertBanner";
import { FacturacionHeader } from "../components/facturacion/FacturacionHeader";
import { ModalRegistroRfc } from "../components/facturacion/ModalRegistroRfc";
import { PasoBuscarTicket } from "../components/facturacion/PasoBuscarTicket";
import { PasoComprobanteGenerado } from "../components/facturacion/PasoComprobanteGenerado";
import { PasoDatosEmision } from "../components/facturacion/PasoDatosEmision";
import { PasoSeleccionarRfc } from "../components/facturacion/PasoSeleccionarRfc";
// import { SessionInfoCard } from "../components/facturacion/SessionInfoCard";
import { StepperProgress } from "../components/facturacion/StepperProgress";

export const Home: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();
  const flow = useFacturacionFlow(user);

  const handleLogout = () => {
    history.replace("/login");
    logout();
  };

  return (
    <IonPage>
      <FacturacionHeader
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onGoLogin={() => history.push("/login")}
      />

      <IonContent className="bg-white" style={{ "--background": "#ffffff" }}>
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          {/* {isAuthenticated && user && (
            <SessionInfoCard
              user={user}
              initData={flow.init.initData}
              rfcActivo={flow.cliente?.rfc}
            />
          )} */}

          {flow.mostrarProcesoPrueba && (
            <AlertBanner
              variant="testMode"
              title="PROCESO DE PRUEBA"
              message="El emisor se encuentra en ambiente de pruebas. Los comprobantes utilizarán serie de prueba y no tienen validez fiscal definitiva."
            />
          )}

          {flow.init.loadingInit && (
            <div className="flex items-center gap-2 text-xs font-bold text-[#010080] bg-[#eef5ff] px-4 py-2.5 rounded-xl border border-[#b6d4fe]">
              <IonSpinner name="crescent" className="w-4 h-4 text-[#0b5ed7]" />
              <span>Inicializando catálogos SAT y datos fiscales...</span>
            </div>
          )}

          {flow.init.initError && (
            <AlertBanner
              variant="error"
              className="rounded-2xl px-4"
              message={flow.init.initError}
              action={
                <button
                  type="button"
                  onClick={flow.init.recargarInicializacion}
                  className="min-h-9 px-3 py-1.5 rounded-lg bg-white border border-rose-200 font-bold text-rose-700 hover:bg-rose-100 shrink-0"
                >
                  Reintentar
                </button>
              }
            />
          )}

          <StepperProgress paso={flow.paso} />

          {flow.paso === 1 && (
            <PasoBuscarTicket
              folio={flow.folio}
              onFolioChange={flow.setFolio}
              transaccion={flow.transaccion}
              onTransaccionChange={flow.setTransaccion}
              agregarOtroTicket={flow.agregarOtroTicket}
              onCancelarAgregarOtro={flow.cancelarAgregarOtroTicket}
              onIniciarAgregarOtro={flow.iniciarAgregarOtroTicket}
              ticketsSeleccionados={flow.ticketsSeleccionados}
              ticketResumen={flow.ticketResumen}
              loadingTicket={flow.loadingTicket}
              onBuscarTicket={flow.buscarTicket}
              onQuitarTicket={flow.quitarTicket}
              onContinuarPaso2={() => flow.setPaso(2)}
            />
          )}

          {flow.paso === 2 && flow.ticketsSeleccionados.length > 0 && (
            <PasoSeleccionarRfc
              ticketsSeleccionados={flow.ticketsSeleccionados}
              totalResumen={flow.ticketResumen.total}
              rfcsCliente={flow.init.rfcsCliente}
              rfcBusqueda={flow.rfcBusqueda}
              onRfcBusquedaChange={flow.setRfcBusqueda}
              cliente={flow.cliente}
              loadingRfc={flow.loadingRfc}
              puedeRegistrarRfc={Boolean(
                user?.numeroCliente && user.numeroCliente > 0,
              )}
              onBuscarRfc={flow.buscarRfc}
              onAbrirRegistroRfc={flow.abrirModalRegistroRfc}
              onLimpiarCliente={() => flow.setCliente(null)}
              onVolverPaso1={() => flow.setPaso(1)}
              onContinuarPaso3={() => flow.setPaso(3)}
            />
          )}

          {flow.paso === 3 &&
            flow.ticketsSeleccionados.length > 0 &&
            flow.cliente && (
              <PasoDatosEmision
                ticketsSeleccionados={flow.ticketsSeleccionados}
                ticketResumen={flow.ticketResumen}
                cliente={flow.cliente}
                regimenFiscal={flow.regimenFiscal}
                onRegimenFiscalChange={flow.setRegimenFiscal}
                usoCfdi={flow.usoCfdi}
                onUsoCfdiChange={flow.setUsoCfdi}
                formaPago={flow.formaPago}
                onFormaPagoChange={flow.setFormaPago}
                moneda={flow.moneda}
                onMonedaChange={flow.cambiarMoneda}
                tipoCambio={flow.tipoCambio}
                onTipoCambioChange={flow.setTipoCambio}
                emailEnvio={flow.emailEnvio}
                onEmailEnvioChange={flow.setEmailEnvio}
                regimenesCatalogo={flow.init.regimenesCatalogo}
                usosCfdiCatalogo={flow.init.usosCfdiCatalogo}
                formasPagoCatalogo={flow.init.formasPagoCatalogo}
                monedasCatalogo={flow.init.monedasCatalogo}
                loadingVistaPrevia={flow.loadingVistaPrevia}
                loadingGenerar={flow.loadingGenerar}
                onVistaPrevia={flow.ejecutarVistaPrevia}
                onGenerarFactura={flow.ejecutarGenerarFactura}
                onVolverPaso2={() => flow.setPaso(2)}
              />
            )}

          {flow.paso === 4 && flow.facturaEmitida && (
            <PasoComprobanteGenerado
              factura={flow.facturaEmitida}
              loadingGenerar={flow.loadingGenerar}
              onConfirmarGenerar={flow.ejecutarGenerarFactura}
              onVolverEditar={() => flow.setPaso(3)}
              onReiniciar={flow.reiniciarFlujo}
            />
          )}
        </div>

        <ModalRegistroRfc
          isOpen={flow.modalRegistro}
          onClose={() => flow.setModalRegistro(false)}
          rfcInicial={flow.rfcParaRegistrar}
          user={user}
          estadosCatalogo={flow.init.estadosCatalogo}
          regimenesCatalogo={flow.init.regimenesCatalogo}
          usosCfdiCatalogo={flow.init.usosCfdiCatalogo}
          formasPagoCatalogo={flow.init.formasPagoCatalogo}
          onSuccess={flow.handleRfcRegistrado}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
