export type NotificationVariant = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: number;
  message: string;
  variant: NotificationVariant;
}

export interface AlertOptions {
  title: string;
  message: string;
  variant?: NotificationVariant;
  confirmText?: string;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
}

export interface NotificationContextValue {
  showToast: (
    message: string,
    variant?: NotificationVariant,
    duration?: number,
  ) => void;
  showAlert: (options: AlertOptions) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

