// Tipos compartidos del dominio de autenticación (espejo de la API Laravel).

export type RoleName =
  | "ADMINISTRADOR"
  | "COORDINADOR"
  | "DOCENTE"
  | "POSTULANTE"
  | (string & {});

export interface User {
  id: number;
  email: string;
  username: string | null;
  foto_perfil_path: string | null;
  must_change_password: boolean;
  role: RoleName | null;
  permissions: string[];
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: number;
  name: string;
}

// Respuestas de autenticación.
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MeResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

// Envoltorios de Laravel Resource.
export interface DataResponse<T> {
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface Paginated<T> {
  data: T[];
  meta?: PaginationMeta;
  links?: Record<string, string | null>;
}

// Forma del error de validación de Laravel (422).
export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

// Payloads.
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CreateUserPayload {
  email: string;
  username?: string | null;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  email?: string;
  username?: string | null;
  role?: string;
}

export interface SaveRolePayload {
  name: string;
  permissions: string[];
}
