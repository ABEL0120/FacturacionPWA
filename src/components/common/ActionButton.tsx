import React from "react";
import { IonIcon, IonSpinner } from "@ionic/react";

type ButtonVariant =
  | "primary"
  | "accent"
  | "soft"
  | "neutral"
  | "neutralPrimary"
  | "outline"
  | "outlineAccent"
  | "outlinePasskey"
  | "amber";

interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "md" | "sm" | "xs";
  loading?: boolean;
  icon?: string;
  iconPosition?: "start" | "end";
  iconClassName?: string;
  buttonRef?: React.Ref<HTMLButtonElement>;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#010080] hover:bg-[#000066] active:scale-[0.99] text-white shadow-lg shadow-[#010080]/20 font-extrabold uppercase tracking-wider",
  accent:
    "bg-[#0b5ed7] hover:bg-[#0a58ca] active:scale-[0.99] text-white shadow-md shadow-[#0b5ed7]/25 font-extrabold uppercase tracking-wider",
  soft:
    "bg-[#eef5ff] hover:bg-[#dceafe] border border-[#b6d4fe] text-[#010080] font-extrabold uppercase tracking-wide",
  neutral:
    "bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 font-bold",
  neutralPrimary:
    "bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-[#010080] font-black",
  outline:
    "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold",
  outlineAccent:
    "bg-white hover:bg-slate-100 border border-[#0b5ed7]/40 text-[#010080] font-bold",
  outlinePasskey:
    "bg-slate-50 hover:bg-[#eef5ff] active:scale-[0.99] border-2 border-slate-200 hover:border-[#0b5ed7] text-[#010080] font-black shadow-sm",
  amber:
    "bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold",
};

const SIZE_CLASSES: Record<"md" | "sm" | "xs", string> = {
  md: "min-h-12 py-3 px-6 text-sm leading-snug rounded-xl",
  sm: "min-h-11 py-2.5 px-5 text-xs leading-snug rounded-xl",
  xs: "min-h-10 py-2 px-4 text-xs leading-snug rounded-xl",
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "start",
  iconClassName = "text-lg shrink-0",
  buttonRef,
  className = "",
  disabled,
  type = "button",
  children,
  ...props
}) => {
  const isLightSurface =
    variant === "soft" ||
    variant === "neutral" ||
    variant === "neutralPrimary" ||
    variant === "outline" ||
    variant === "outlineAccent" ||
    variant === "outlinePasskey";

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <IonSpinner
          name="dots"
          className={`h-5 ${isLightSurface ? "text-[#010080]" : "text-white"}`}
        />
      ) : (
        <>
          {icon && iconPosition === "start" && (
            <IonIcon icon={icon} className={iconClassName} />
          )}
          <span>{children}</span>
          {icon && iconPosition === "end" && (
            <IonIcon icon={icon} className={iconClassName} />
          )}
        </>
      )}
    </button>
  );
};
