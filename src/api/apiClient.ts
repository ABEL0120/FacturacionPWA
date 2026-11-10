import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export function extractApiErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed && !trimmed.startsWith("<")) {
      return trimmed;
    }
  }
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (data.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors)
        .flat()
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0);
      if (messages.length > 0) {
        return messages.join(" | ");
      }
    }
    if (typeof data.title === "string" && data.title.trim()) {
      return data.title.trim();
    }
  }
  if (typeof err?.message === "string" && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
  }
);
