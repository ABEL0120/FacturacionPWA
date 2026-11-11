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

type NativeAlertPlatform = "ios" | "android" | "desktop";

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
    dialogIconColor: string;
    toastIconColor: string;
  }
> = {
  success: {
    icon: checkmarkCircleOutline,
    dialogIconColor: "text-emerald-600",
    toastIconColor: "text-emerald-400 sm:text-emerald-600",
  },
  info: {
    icon: informationCircleOutline,
    dialogIconColor: "text-[#0b5ed7]",
    toastIconColor: "text-sky-400 sm:text-[#0b5ed7]",
  },
  warning: {
    icon: warningOutline,
    dialogIconColor: "text-amber-600",
    toastIconColor: "text-amber-400 sm:text-amber-600",
  },
  error: {
    icon: alertCircleOutline,
    dialogIconColor: "text-rose-600",
    toastIconColor: "text-rose-400 sm:text-rose-600",
  },
};

function detectNativeAlertPlatform(): NativeAlertPlatform {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return "desktop";
  }
  const ua = navigator.userAgent;
  const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/i.test(ua) || isTouchMac) {
    return "ios";
  }
  if (/Android/i.test(ua) || window.innerWidth < 640) {
    return "android";
  }
  return "desktop";
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [dialogQueue, setDialogQueue] = useState<PendingDialog[]>([]);
  const [alertPlatform, setAlertPlatform] = useState<NativeAlertPlatform>(() =>
    detectNativeAlertPlatform(),
  );
  const nextIdRef = useRef(1);
  const timersRef = useRef<Map<number, number>>(new Map());
  const resolvedIdsRef = useRef<Set<number>>(new Set());
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const activeDialog = dialogQueue[0] ?? null;

  useEffect(() => {
    const syncPlatform = () => {
      setAlertPlatform(detectNativeAlertPlatform());
    };
    window.addEventListener("resize", syncPlatform);
    return () => {
      window.removeEventListener("resize", syncPlatform);
    };
  }, []);

  const dismissToast = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
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
        return [...filtered.slice(-1), { id, message: cleanMessage, variant }];
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
      clearAllToasts();
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
    [clearAllToasts],
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

  const activeMeta = activeDialog ? VARIANT_META[activeDialog.variant] : null;
  const stackIosButtons = Boolean(
    activeDialog?.isConfirm &&
      (activeDialog.confirmText.length > 12 ||
        (activeDialog.cancelText?.length ?? 0) > 12),
  );

  const portalContent = (
    <>
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed left-4 right-4 sm:left-auto sm:right-5 z-[99999] flex flex-col items-center sm:items-end gap-2 pointer-events-none"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {toasts.map((toast) => {
            const meta = VARIANT_META[toast.variant];
            return (
              <div
                key={toast.id}
                role="status"
                className="w-full max-w-[360px] bg-slate-900/95 sm:bg-white text-white sm:text-slate-800 border border-white/10 sm:border-slate-200/90 rounded-2xl sm:rounded-xl px-3.5 py-2.5 shadow-[0_12px_32px_rgba(15,23,42,0.28)] sm:shadow-[0_10px_28px_rgba(15,23,42,0.14)] backdrop-blur-md flex items-center gap-2.5 pointer-events-auto animate-toast-in"
              >
                <IonIcon
                  icon={meta.icon}
                  className={`text-xl shrink-0 ${meta.toastIconColor}`}
                />

                <p className="text-[13px] font-medium leading-snug flex-1 min-w-0">
                  {toast.message}
                </p>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Cerrar notificación"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white sm:hover:text-slate-700 hover:bg-white/10 sm:hover:bg-slate-100 transition-colors shrink-0"
                >
                  <IonIcon icon={closeOutline} className="text-base" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeDialog && activeMeta && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="ventio-alert-title"
          aria-describedby="ventio-alert-message"
          className="fixed inset-0 z-[100000] bg-black/40 sm:bg-slate-950/35 flex items-center justify-center p-5 animate-fade-in"
        >
          {alertPlatform === "ios" && (
            <div className="w-[min(calc(100vw-48px),288px)] bg-white rounded-[14px] shadow-[0_14px_40px_rgba(0,0,0,0.24)] border border-slate-200/80 overflow-hidden animate-dialog-in">
              <div className="px-4 pt-5 pb-4 text-center space-y-1.5 max-h-[65dvh] overflow-y-auto">
                <h2
                  id="ventio-alert-title"
                  className="text-[16px] font-semibold text-slate-900 leading-snug tracking-[-0.01em]"
                >
                  {activeDialog.title}
                </h2>
                <p
                  id="ventio-alert-message"
                  className="text-[13px] text-slate-600 leading-[1.38] whitespace-pre-line break-words"
                >
                  {activeDialog.message}
                </p>
              </div>

              <div
                className={
                  activeDialog.isConfirm
                    ? stackIosButtons
                      ? "border-t border-slate-200/90 flex flex-col-reverse divide-y divide-y-reverse divide-slate-200/90"
                      : "border-t border-slate-200/90 grid grid-cols-2 divide-x divide-slate-200/90"
                    : "border-t border-slate-200/90"
                }
              >
                {activeDialog.isConfirm && (
                  <button
                    type="button"
                    onClick={() => closeDialogById(activeDialog.id, false)}
                    className="w-full h-11 px-3 text-[16px] font-normal text-[#007aff] hover:bg-slate-100/70 active:bg-slate-200/70 transition-colors flex items-center justify-center"
                  >
                    {activeDialog.cancelText}
                  </button>
                )}
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={() => closeDialogById(activeDialog.id, true)}
                  className="w-full h-11 px-3 text-[16px] font-semibold text-[#007aff] hover:bg-slate-100/70 active:bg-slate-200/70 transition-colors flex items-center justify-center"
                >
                  {activeDialog.confirmText}
                </button>
              </div>
            </div>
          )}

          {alertPlatform === "android" && (
            <div className="w-[min(calc(100vw-48px),320px)] bg-white rounded-[24px] shadow-[0_18px_44px_rgba(15,23,42,0.22)] border border-slate-200/70 overflow-hidden animate-dialog-in">
              <div className="px-6 pt-6 pb-3 space-y-2.5 max-h-[65dvh] overflow-y-auto">
                <div className="flex items-start gap-2.5">
                  <IonIcon
                    icon={activeMeta.icon}
                    className={`text-[22px] shrink-0 mt-0.5 ${activeMeta.dialogIconColor}`}
                  />
                  <h2
                    id="ventio-alert-title"
                    className="text-[18px] font-semibold text-slate-900 leading-snug text-left"
                  >
                    {activeDialog.title}
                  </h2>
                </div>
                <p
                  id="ventio-alert-message"
                  className="text-[14px] text-slate-600 leading-relaxed text-left whitespace-pre-line break-words"
                >
                  {activeDialog.message}
                </p>
              </div>

              <div className="px-5 pb-4 pt-2 flex items-center justify-end gap-2">
                {activeDialog.isConfirm && (
                  <button
                    type="button"
                    onClick={() => closeDialogById(activeDialog.id, false)}
                    className="min-h-10 px-4 rounded-full text-[14px] font-semibold text-slate-600 hover:bg-slate-100 active:bg-slate-200/70 transition-colors"
                  >
                    {activeDialog.cancelText}
                  </button>
                )}
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={() => closeDialogById(activeDialog.id, true)}
                  className="min-h-10 px-5 rounded-full text-[14px] font-semibold bg-[#010080] text-white hover:bg-[#02029a] active:bg-[#000060] transition-colors"
                >
                  {activeDialog.confirmText}
                </button>
              </div>
            </div>
          )}

          {alertPlatform === "desktop" && (
            <div className="w-full max-w-[400px] bg-white rounded-xl shadow-[0_20px_50px_rgba(15,23,42,0.22)] border border-slate-200/90 overflow-hidden animate-dialog-in">
              <div className="p-5 flex items-start gap-3.5 max-h-[65dvh] overflow-y-auto">
                <IonIcon
                  icon={activeMeta.icon}
                  className={`text-[22px] shrink-0 mt-0.5 ${activeMeta.dialogIconColor}`}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h2
                    id="ventio-alert-title"
                    className="text-[15px] font-semibold text-slate-900 leading-snug"
                  >
                    {activeDialog.title}
                  </h2>
                  <p
                    id="ventio-alert-message"
                    className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line break-words"
                  >
                    {activeDialog.message}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200/80 px-5 py-3 flex items-center justify-end gap-2">
                {activeDialog.isConfirm && (
                  <button
                    type="button"
                    onClick={() => closeDialogById(activeDialog.id, false)}
                    className="min-h-[38px] px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 active:bg-slate-200/70 text-slate-700 text-[13px] font-medium transition-colors"
                  >
                    {activeDialog.cancelText}
                  </button>
                )}
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={() => closeDialogById(activeDialog.id, true)}
                  className="min-h-[38px] px-4 rounded-lg bg-[#010080] hover:bg-[#02029a] active:bg-[#000060] text-white text-[13px] font-semibold shadow-2xs transition-colors"
                >
                  {activeDialog.confirmText}
                </button>
              </div>
            </div>
          )}
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
