import { useCallback, useContext } from "react";
import { NotificationContext } from "../context/notificationContextDef";
import { NotificationVariant } from "../types/notification.types";

type LegacyToastColor = "success" | "warning" | "danger" | "primary";

const COLOR_MAP: Record<LegacyToastColor, NotificationVariant> = {
  success: "success",
  warning: "warning",
  danger: "error",
  primary: "info",
};

export const useToast = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useToast debe utilizarse dentro de NotificationProvider.");
  }

  const { showToast: present } = ctx;

  const showToast = useCallback(
    (message: string, color: LegacyToastColor, duration = 2600) => {
      present(message, COLOR_MAP[color], duration);
    },
    [present],
  );

  const showSuccess = useCallback(
    (message: string, duration = 2400) => present(message, "success", duration),
    [present],
  );

  const showWarning = useCallback(
    (message: string, duration = 2800) => present(message, "warning", duration),
    [present],
  );

  const showError = useCallback(
    (message: string, duration = 3400) => present(message, "error", duration),
    [present],
  );

  const showInfo = useCallback(
    (message: string, duration = 2600) => present(message, "info", duration),
    [present],
  );

  return {
    showToast,
    showSuccess,
    showWarning,
    showError,
    showInfo,
  };
};

