import React from "react";
import { IonIcon } from "@ionic/react";
import { checkmarkCircleOutline } from "ionicons/icons";
import { PasoFacturacion } from "../../types/facturacion.types";

interface StepperProgressProps {
  paso: PasoFacturacion;
}

const STEPS: { numero: 1 | 2 | 3; label: string }[] = [
  { numero: 1, label: "1. Ticket" },
  { numero: 2, label: "2. RFC Receptor" },
  { numero: 3, label: "3. Régimen y Emisión" },
];

export const StepperProgress: React.FC<StepperProgressProps> = ({ paso }) => {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-4">
      {STEPS.map((step, index) => {
        const isCurrent = paso === step.numero;
        const isCompleted = paso > step.numero;

        return (
          <React.Fragment key={step.numero}>
            {index > 0 && <div className="flex-1 h-0.5 bg-slate-200 mx-2" />}
            <div
              className={`flex items-center gap-2 text-xs font-black transition-all ${
                isCurrent
                  ? "text-[#010080]"
                  : isCompleted
                    ? "text-[#0b5ed7]"
                    : "text-slate-400"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCurrent
                    ? "bg-[#010080] text-white"
                    : isCompleted
                      ? "bg-[#0b5ed7] text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <IonIcon icon={checkmarkCircleOutline} className="text-sm" />
                ) : (
                  step.numero
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

