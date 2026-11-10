import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IonIcon } from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  closeOutline,
  informationCircleOutline,
  warningOutline,
} from "ionicons/icons";
import { NotificationContext } from "../../context/notificationContextDef";
import {
  AlertOptions,
  ConfirmOptions,
  NotificationVariant,
  ToastItem,
} from "../../types/notification.types";
import { ActionButton } from "./ActionButton";

interface PendingDialog {
  id: number;
  title: string;
  message: string;
  variant: NotificationVariant;
  confirmText: string;
  cancelText?: string;
  isConfirm: boolean;
  resolve: (accepted: boolean) => void;
}

const VARIANT_META: Record<
  NotificationVariant,
  {
    icon: string;
    eyebrow: string;
    eyebrowColor: string;
    iconBadge: string;
  }
> = {
  success: {
    icon: checkmarkCircleOutline,
    eyebrow: "Confirmación",
    eyebrowColor: "text-emerald-700",
    iconBadge: "bg-emerald-50 border-emerald-200 text-emerald-600",
  },
  info: {
    icon: informationCircleOutline,
    eyebrow: "Información",
    eyebrowColor: "text-[#0b5ed7]",
    iconBadge: "bg-[#eef5ff] border-[#b6d4fe] text-[#0b5ed7]",
  },
  warning: {
    icon: warningOutline,
    eyebrow: "Aviso Importante",
    eyebrowColor: "text-amber-700",
    iconBadge: "bg-amber-50 border-amber-200 text-amber-600",
  },
  error: {
    icon: alertCircleOutline,
    eyebrow: "Atención",
    eyebrowColor: "text-rose-700",
    iconBadge: "bg-rose-50 border-rose-200 text-rose-600",
  },
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialogQueue, setDialogQueue] = useState<PendingDialog[]>([]);
  const nextIdRef = useRef(1);
  const timersRef = useRef<Map<number, number>>(new Map());
  const resolvedIdsRef = useRef<Set<number>>(new Set());
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const activeDialog = dialogQueue[0] ?? null;

  const dismissToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: NotificationVariant = "info",
      duration = 2600,
    ) => {
      const cleanMessage = message.trim();
      if (!cleanMessage) return;

      const id = nextIdRef.current++;
      setToasts((prev) => {
        const filtered = prev.filter((t) => t.message !== cleanMessage);
        return [...filtered.slice(-2), { id, message: cleanMessage, variant }];
      });

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  const enqueueDialog = useCallback(
    (options: ConfirmOptions, isConfirm: boolean): Promise<boolean> => {
      return new Promise((resolve) => {
        const id = nextIdRef.current++;
        setDialogQueue((prev) => [
          ...prev,
          {
            id,
            title: options.title,
            message: options.message,
            variant: options.variant ?? (isConfirm ? "warning" : "info"),
            confirmText: options.confirmText ?? "Aceptar",
            cancelText: options.cancelText ?? "Cancelar",
            isConfirm,
            resolve,
          },
        ]);
      });
    },
    [],
  );

  const showAlert = useCallback(
    async (options: AlertOptions): Promise<void> => {
      await enqueueDialog(options, false);
    },
    [enqueueDialog],
  );

  const showConfirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return enqueueDialog(options, true);
    },
    [enqueueDialog],
  );

  const closeDialogById = useCallback((dialogId: number, accepted: boolean) => {
    setDialogQueue((prev) => {
      const target = prev.find((item) => item.id === dialogId);
      if (!target) return prev;
      if (!resolvedIdsRef.current.has(dialogId)) {
        resolvedIdsRef.current.add(dialogId);
        window.queueMicrotask(() => {
          resolvedIdsRef.current.delete(dialogId);
          target.resolve(accepted);
        });
      }
      return prev.filter((item) => item.id !== dialogId);
    });
  }, []);

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  useEffect(() => {
    if (!activeDialog) return;

    const frame = window.requestAnimationFrame(() => {
      confirmButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialogById(activeDialog.id, !activeDialog.isConfirm);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDialog, closeDialogById]);

  const portalContent = (
    <>
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed left-3 right-3 sm:left-auto sm:right-5 z-[99999] flex flex-col items-center sm:items-end gap-2.5 pointer-events-none"
          style={{ top: "max(0.85rem, env(safe-area-inset-top))" }}
        >
          {toasts.map((toast) => {
            const meta = VARIANT_META[toast.variant];
            return (
              <div
                key={toast.id}
                role="status"
                className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl px-3.5 py-3 shadow-2xl shadow-slate-900/15 flex items-center gap-3 pointer-events-auto animate-toast-in"
              >
                <div
                  className={`w-9 h-9 rounded-xl border ${meta.iconBadge} flex items-center justify-center shrink-0`}
                >
                  <IonIcon icon={meta.icon} className="text-xl" />
                </div>

                <p className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug flex-1 min-w-0">
                  {toast.message}
                </p>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Cerrar notificación"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <IonIcon icon={closeOutline} className="text-lg" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeDialog && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ventio-alert-title"
          aria-describedby="ventio-alert-message"
          className="fixed inset-0 z-[100000] bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 max-h-[85dvh] overflow-y-auto animate-dialog-in">
            <div
              className={`w-14 h-14 rounded-2xl ${VARIANT_META[activeDialog.variant].iconBadge} border flex items-center justify-center mx-auto shadow-xs`}
            >
              <IonIcon
                icon={VARIANT_META[activeDialog.variant].icon}
                className="text-3xl"
              />
            </div>

            <div className="text-center space-y-2">
              <span
                className={`text-[10px] font-black uppercase tracking-widest block ${VARIANT_META[activeDialog.variant].eyebrowColor}`}
              >
                {VARIANT_META[activeDialog.variant].eyebrow}
              </span>
              <h2
                id="ventio-alert-title"
                className="text-lg sm:text-xl font-black text-slate-900 leading-snug"
              >
                {activeDialog.title}
              </h2>
              <p
                id="ventio-alert-message"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words"
              >
                {activeDialog.message}
              </p>
            </div>

            <div
              className={`pt-1 ${
                activeDialog.isConfirm
                  ? "flex flex-col-reverse sm:flex-row gap-2.5"
                  : "flex"
              }`}
            >
              {activeDialog.isConfirm && (
                <ActionButton
                  variant="neutral"
                  onClick={() => closeDialogById(activeDialog.id, false)}
                  className="w-full sm:flex-1"
                >
                  {activeDialog.cancelText}
                </ActionButton>
              )}

              <ActionButton
                buttonRef={confirmButtonRef}
                variant="primary"
                onClick={() => closeDialogById(activeDialog.id, true)}
                className={
                  activeDialog.isConfirm ? "w-full sm:flex-1" : "w-full"
                }
              >
                {activeDialog.confirmText}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <NotificationContext.Provider
      value={{ showToast, showAlert, showConfirm }}
    >
      {children}
      {typeof document !== "undefined"
        ? createPortal(portalContent, document.body)
        : portalContent}
    </NotificationContext.Provider>
  );
};
