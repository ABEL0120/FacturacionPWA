import React from "react";
import { arrowBackOutline, searchOutline } from "ionicons/icons";
import { ActionButton } from "../common/ActionButton";
import { FormInput } from "../common/FormField";

interface CfdiConsultaFiltrosProps {
  serie: string;
  onSerieChange: (value: string) => void;
  folio: string;
  onFolioChange: (value: string) => void;
  loading: boolean;
  onBuscar: () => void;
  onRestaurar?: () => void;
  onRegresar: () => void;
}

export const CfdiConsultaFiltros: React.FC<CfdiConsultaFiltrosProps> = ({
  serie,
  onSerieChange,
  folio,
  onFolioChange,
  loading,
  onBuscar,
  onRegresar,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Serie"
          surface="white"
          type="text"
          maxLength={60}
          value={serie}
          onChange={(e) => onSerieChange(e.target.value.toUpperCase())}
          placeholder="Serie"
          className="font-bold uppercase"
        />

        <FormInput
          label="Folio"
          surface="white"
          type="text"
          maxLength={60}
          value={folio}
          onChange={(e) => onFolioChange(e.target.value)}
          placeholder="Folio"
          className="font-bold"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
        <ActionButton
          type="submit"
          variant="primary"
          size="sm"
          loading={loading}
          icon={searchOutline}
          iconClassName="text-base shrink-0"
          className="w-full sm:w-auto px-6"
        >
          Buscar
        </ActionButton>

        {/* <ActionButton
          type="button"
          variant="soft"
          size="sm"
          disabled={loading}
          onClick={onRestaurar}
          icon={refreshOutline}
          iconClassName="text-base shrink-0"
          className="w-full sm:w-auto px-5"
        >
          Restaura
        </ActionButton> */}

        <ActionButton
          type="button"
          variant="neutral"
          size="sm"
          onClick={onRegresar}
          icon={arrowBackOutline}
          iconClassName="text-base shrink-0"
          className="w-full sm:w-auto sm:ml-auto px-5"
        >
          Regresar
        </ActionButton>
      </div>
    </form>
  );
};
