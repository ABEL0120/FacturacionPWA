import React from "react";
import { IonIcon } from "@ionic/react";
import { alertCircleOutline, warningOutline } from "ionicons/icons";

type AlertVariant = "error" | "warning" | "info" | "testMode";

interface AlertBannerProps {
  variant: AlertVariant;
  title?: string;
  message: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant,
  title,
  message,
  action,
  className = "",
}) => {
  if (variant === "info") {
    return (
      <div
        className={`bg-[#010080] text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md shadow-[#010080]/15 ${className}`}
      >
        <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
          !
        </div>
        <div className="text-xs sm:text-sm font-medium leading-snug flex-1 min-w-0">
          {message}
        </div>
        {action}
      </div>
    );
  }

  if (variant === "testMode") {
    return (
      <div
        className={`bg-amber-50 border-2 border-amber-300 text-amber-950 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm ${className}`}
      >
        <IonIcon
          icon={warningOutline}
          className="text-2xl text-amber-600 shrink-0"
        />
        <div className="text-xs leading-snug flex-1 min-w-0">
          {title && (
            <strong className="uppercase tracking-wider block font-black">
              {title}
            </strong>
          )}
          <span>{message}</span>
        </div>
        {action}
      </div>
    );
  }

  if (variant === "warning") {
    return (
      <div
        className={`bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs ${className}`}
      >
        <IonIcon
          icon={warningOutline}
          className="text-lg text-amber-600 shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          {title && <strong className="block font-black">{title}</strong>}
          <span>{message}</span>
        </div>
        {action}
      </div>
    );
  }

  return (
    <div
      className={`bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-rose-800 ${className}`}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <IonIcon
          icon={alertCircleOutline}
          className="text-lg text-rose-600 shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          {title && <strong className="block font-black">{title}</strong>}
          <span className="font-semibold leading-snug">{message}</span>
        </div>
      </div>
      {action}
    </div>
  );
};

