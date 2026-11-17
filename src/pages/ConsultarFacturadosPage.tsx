import React from "react";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCfdiConsulta } from "../hooks/useCfdiConsulta";
import { CfdiConsultaFiltros } from "../components/consulta/CfdiConsultaFiltros";
import { CfdiConsultaLista } from "../components/consulta/CfdiConsultaLista";
import { ModalArchivoPdf } from "../components/consulta/ModalArchivoPdf";
import { FacturacionHeader } from "../components/facturacion/FacturacionHeader";

export const ConsultarFacturadosPage: React.FC = () => {
  const history = useHistory();
  const { user, isAuthenticated, logout } = useAuth();
  const consulta = useCfdiConsulta(user);

  const handleLogout = () => {
    history.replace("/login");
    logout();
  };

  const handleRefresh = async (event: RefresherCustomEvent) => {
    await consulta.recargar();
    event.detail.complete();
  };

  const tieneFiltros = Boolean(
    consulta.serie.trim() || consulta.folio.trim(),
  );

  return (
    <IonPage>
      <FacturacionHeader
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onGoLogin={() => history.push("/login")}
      />

      <IonContent className="bg-slate-50" style={{ "--background": "#f8fafc" }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
              Consulta y Descarga de CFDI 4.0
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Visualiza tus comprobantes emitidos, descarga el archivo PDF o XML
              y envíalos directamente a tu correo electrónico.
            </p>
          </div>

          <CfdiConsultaFiltros
            serie={consulta.serie}
            onSerieChange={consulta.setSerie}
            folio={consulta.folio}
            onFolioChange={consulta.setFolio}
            loading={consulta.loading}
            onBuscar={() => void consulta.buscar()}
            onRestaurar={() => void consulta.restaurar()}
            onRegresar={() => history.push("/home")}
          />

          <CfdiConsultaLista
            items={consulta.items}
            loading={consulta.loading}
            accionActiva={consulta.accionActiva}
            tieneFiltros={tieneFiltros}
            onVerPdf={(item) => void consulta.verPdf(item)}
            onDescargarPdf={(item) => void consulta.descargarArchivo(item, "pdf")}
            onDescargarXml={(item) => void consulta.descargarArchivo(item, "xml")}
            onEnviarCorreo={(item) => void consulta.enviarCorreo(item)}
            onRestaurarFiltros={() => void consulta.restaurar()}
            onIrAFacturar={() => history.push("/home")}
          />
        </div>

        <ModalArchivoPdf
          isOpen={consulta.pdfModal.isOpen}
          idCfdi={consulta.pdfModal.idCfdi}
          fileName={consulta.pdfModal.fileName}
          blob={consulta.pdfModal.blob}
          onClose={consulta.cerrarPdfModal}
        />
      </IonContent>
    </IonPage>
  );
};

export default ConsultarFacturadosPage;
