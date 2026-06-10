import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiValidationError } from "@/lib/types";

// URL base de la API. Nada hardcodeado: viene de .env (NEXT_PUBLIC_API_URL).
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL && typeof window !== "undefined") {
  // Aviso temprano si falta configuración.
  console.warn("NEXT_PUBLIC_API_URL no está definida. Configurá tu .env.");
}

// Cliente HTTP central tipado.
export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});

// --- Manejo de token y callbacks de sesión ---
// El token se mantiene en memoria; el store de auth es la fuente de verdad.

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;
let unauthorizedHandler: (() => void) | null = null;

// El store registra cómo renovar el token y qué hacer ante un 401 irrecuperable.
export function setRefreshHandler(fn: RefreshHandler | null): void {
  refreshHandler = fn;
}

export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

// Adjunta el Bearer token en cada request si existe.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Ante un 401, intenta refrescar el token una vez y reintenta la request original.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      refreshHandler
    ) {
      original._retry = true;
      const newToken = await refreshHandler();

      if (newToken) {
        setAccessToken(newToken);
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return api(original);
      }

      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    if (status === 401 && !isAuthEndpoint) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  },
);

// --- Helpers de error ---

// Errores de validación 422 (para pintar bajo cada input).
export function getValidationErrors(
  error: unknown,
): Record<string, string[]> | null {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const data = error.response.data as Partial<ApiValidationError> | undefined;
    return data?.errors ?? null;
  }
  return null;
}

// Mensaje legible de un error de la API.
export function getErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error. Intentá nuevamente.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function isForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

export interface BlobPreview {
  url: string; // object URL del blob (revocar al terminar)
  type: string; // content-type (ej. "image/png", "application/pdf")
}

// Descarga un archivo a través del proxy same-origin de Next (evita el CORS de R2)
// y devuelve un object URL + su content-type para previsualizar/descargar.
export async function fetchBlobPreview(proxyPath: string): Promise<BlobPreview> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const res = await fetch(proxyPath, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo cargar el archivo (${res.status}).`);
  }
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), type: blob.type };
}

// Compat: devuelve solo el object URL (usado como src de <img>).
export async function fetchFotoObjectUrl(proxyPath: string): Promise<string> {
  return (await fetchBlobPreview(proxyPath)).url;
}
