import { api, fetchFotoObjectUrl } from "@/lib/api";
import type {
  ChangePasswordPayload,
  DataResponse,
  LoginResponse,
  MeResponse,
  MessageResponse,
  RefreshResponse,
  ResetPasswordPayload,
  User,
} from "@/lib/types";

// Llamadas al módulo de autenticación (/auth).

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export interface RegisterPayload {
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string | null;
  password: string;
  password_confirmation: string;
}

// Auto-registro público de postulante. Devuelve token + usuario (auto-login).
export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "/applicant-admission/registro",
    payload,
  );
  return data;
}

export async function me(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data;
}

export async function logout(): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>("/auth/logout");
  return data;
}

export async function refresh(): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>("/auth/refresh");
  return data;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    "/auth/change-password",
    payload,
  );
  return data;
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>("/auth/forgot-password", {
    email,
  });
  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>(
    "/auth/reset-password",
    payload,
  );
  return data;
}

export async function updateProfile(username: string): Promise<User> {
  const { data } = await api.put<DataResponse<User>>("/auth/me/profile", {
    username,
  });
  return data.data;
}

export async function uploadMyFoto(file: File): Promise<User> {
  const form = new FormData();
  form.append("foto", file);
  const { data } = await api.post<DataResponse<User>>("/auth/me/foto", form);
  return data.data;
}

// La foto requiere Bearer y responde 302 hacia una URL firmada de R2 (sin CORS).
// Se descarga vía el proxy same-origin de Next para evitar el bloqueo del navegador.
export function fetchMyFotoUrl(): Promise<string> {
  return fetchFotoObjectUrl("/api/foto/me");
}
