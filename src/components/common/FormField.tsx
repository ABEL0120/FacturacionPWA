import React from "react";
import { IonIcon } from "@ionic/react";
import { eyeOffOutline, eyeOutline } from "ionicons/icons";

type FieldSurface = "slate" | "white" | "readonly";

const SURFACE_CLASSES: Record<FieldSurface, string> = {
  slate: "border-slate-200 bg-slate-50/50 text-slate-800",
  white: "border-slate-300 bg-white text-slate-800",
  readonly: "border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed",
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hintRight?: React.ReactNode;
  icon?: string;
  compact?: boolean;
  surface?: FieldSurface;
  containerClassName?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  hintRight,
  icon,
  compact = false,
  surface = "slate",
  containerClassName = "",
  className = "",
  ...inputProps
}) => {
  const sizeClass = compact
    ? "min-h-11 h-11 rounded-xl text-xs"
    : "min-h-12 h-12 rounded-xl text-sm";

  const paddingClass = icon ? "pl-11 pr-4" : "px-3";

  const focusClass =
    surface === "readonly"
      ? "focus:outline-none"
      : "focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15";

  return (
    <div
      className={`${compact ? "space-y-1" : "space-y-1.5"} ${containerClassName}`}
    >
      {hintRight ? (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <label className="text-xs font-bold text-slate-700">{label}</label>
          {hintRight}
        </div>
      ) : (
        <label className="text-xs font-bold text-slate-700">{label}</label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
            <IonIcon icon={icon} className="text-lg" />
          </span>
        )}
        <input
          className={`w-full ${sizeClass} ${paddingClass} border ${SURFACE_CLASSES[surface]} ${focusClass} transition-all placeholder:text-slate-400 ${className}`}
          {...inputProps}
        />
      </div>
    </div>
  );
};

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  compact?: boolean;
  surface?: Exclude<FieldSurface, "readonly">;
  containerClassName?: string;
  children: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  compact = false,
  surface = "slate",
  containerClassName = "",
  className = "",
  children,
  ...selectProps
}) => {
  const sizeClass = compact
    ? "min-h-11 h-11 px-3 text-xs"
    : "min-h-12 h-12 px-3 text-xs sm:text-sm";

  return (
    <div
      className={`${compact ? "space-y-1" : "space-y-1.5"} ${containerClassName}`}
    >
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <select
        className={`w-full ${sizeClass} rounded-xl border ${SURFACE_CLASSES[surface]} focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all cursor-pointer ${className}`}
        {...selectProps}
      >
        {children}
      </select>
    </div>
  );
};

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hintRight?: React.ReactNode;
  icon: string;
  showPassword: boolean;
  onToggleShowPassword?: () => void;
  showToggleButton?: boolean;
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  hintRight,
  icon,
  showPassword,
  onToggleShowPassword,
  showToggleButton = true,
  containerClassName = "",
  className = "",
  ...inputProps
}) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {hintRight ? (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <label className="text-xs font-bold text-slate-700">{label}</label>
          {hintRight}
        </div>
      ) : (
        <label className="text-xs font-bold text-slate-700">{label}</label>
      )}
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <IonIcon icon={icon} className="text-lg" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          className={`w-full min-h-12 h-12 pl-11 ${
            showToggleButton && onToggleShowPassword ? "pr-12" : "pr-4"
          } rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0b5ed7] focus:ring-2 focus:ring-[#0b5ed7]/15 transition-all placeholder:text-slate-400 ${className}`}
          {...inputProps}
        />
        {showToggleButton && onToggleShowPassword && (
          <button
            type="button"
            onClick={onToggleShowPassword}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <IonIcon
              icon={showPassword ? eyeOffOutline : eyeOutline}
              className="text-lg"
            />
          </button>
        )}
      </div>
    </div>
  );
};
