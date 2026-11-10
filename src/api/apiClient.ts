import axios from "axios";
import { ApiResponse } from "../types/auth.types";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

interface ErrorPayload {
  message?: unknown;
  title?: unknown;
  errors?: Record<string, unknown>;
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  const errObj =
    typeof err === "object" && err !== null
      ? (err as { response?: { data?: unknown }; message?: unknown })
      : null;

  const data = errObj?.response?.data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed && !trimmed.startsWith("<")) {
      return trimmed;
    }
  }
  if (data && typeof data === "object") {
    const payload = data as ErrorPayload;
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message.trim();
    }
    if (payload.errors && typeof payload.errors === "object") {
      const messages = Object.values(payload.errors)
        .flat()
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }
    if (typeof payload.title === "string" && payload.title.trim()) {
      return payload.title.trim();
    }
  }
  if (typeof errObj?.message === "string" && errObj.message.trim()) {
    return errObj.message.trim();
  }
  return fallback;
}

export async function unwrapApiCall<T>(
  request: () => Promise<ApiResponse<T>>,
  fallbackMessage: string,
  requireData = true,
): Promise<T> {
  try {
    const response = await request();
    if (
      response?.success &&
      (!requireData || (response.data !== null && response.data !== undefined))
    ) {
      return response.data as T;
    }
    throw new Error(response?.message || fallbackMessage);
  } catch (err: unknown) {
    throw new Error(extractApiErrorMessage(err, fallbackMessage));
  }
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("facturacion_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
