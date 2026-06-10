import { api } from "@/lib/api";
import type { MessageResponse, User } from "@/lib/types";
import type { Docente } from "@/lib/academic";
import { ACADEMIC_BASE, makeCrud } from "./crud";

export interface DocentePayload {
  ci: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  profesion: string | null;
}

export const docentesService = makeCrud<Docente, DocentePayload>("docentes");

export interface CreatedAccount {
  user: User;
  temporary_password: string;
}

// Crea la cuenta de usuario (rol DOCENTE) y devuelve la contraseña temporal.
export async function createDocenteAccount(ci: string): Promise<CreatedAccount> {
  const { data } = await api.post<CreatedAccount>(
    `${ACADEMIC_BASE}/docentes/${ci}/usuario`,
  );
  return data;
}

export async function deleteDocenteAccount(ci: string): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(
    `${ACADEMIC_BASE}/docentes/${ci}/usuario`,
  );
  return data;
}
