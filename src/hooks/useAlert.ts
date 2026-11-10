import { useCallback, useContext } from "react";
import { NotificationContext } from "../context/notificationContextDef";
import { AlertOptions, ConfirmOptions } from "../types/notification.types";

type VariantlessAlertOptions = Omit<AlertOptions, "variant">;

export const useAlert = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useAlert debe utilizarse dentro de NotificationProvider.");
  }

  const { showAlert, showConfirm } = ctx;

  const showSuccessAlert = useCallback(
    (options: VariantlessAlertOptions) =>
      showAlert({ ...options, variant: "success" }),
    [showAlert],
  );

  const showInfoAlert = useCallback(
    (options: VariantlessAlertOptions) =>
      showAlert({ ...options, variant: "info" }),
    [showAlert],
  );

  const showWarningAlert = useCallback(
    (options: VariantlessAlertOptions) =>
      showAlert({ ...options, variant: "warning" }),
    [showAlert],
  );

  const showErrorAlert = useCallback(
    (options: VariantlessAlertOptions) =>
      showAlert({ ...options, variant: "error" }),
    [showAlert],
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => showConfirm(options),
    [showConfirm],
  );

  return {
    showAlert,
    showSuccessAlert,
    showInfoAlert,
    showWarningAlert,
    showErrorAlert,
    showConfirm: confirm,
  };
};

