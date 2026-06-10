import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { Aula, Modulo } from "@/lib/academic";
import { ACADEMIC_BASE, makeCrud } from "./crud";

export interface ModuloPayload {
  numero: string;
  nombre: string;
  ubicacion: string | null;
}

export const modulosService = makeCrud<Modulo, ModuloPayload>("modulos");

// Aulas: anidadas en un módulo (PK compuesta modulo_numero + numero).
export interface AulaPayload {
  numero: number;
  nombre: string;
  capacidad: number;
  piso: number;
  tipo: Aula["tipo"];
}

function aulasBase(modulo: string): string {
  return `${ACADEMIC_BASE}/modulos/${modulo}/aulas`;
}

export const aulasService = {
  async list(modulo: string): Promise<Aula[]> {
    const { data } = await api.get<Paginated<Aula>>(aulasBase(modulo));
    return data.data;
  },
  async create(modulo: string, payload: AulaPayload): Promise<Aula> {
    const { data } = await api.post<DataResponse<Aula>>(aulasBase(modulo), payload);
    return data.data;
  },
  async update(
    modulo: string,
    numero: number,
    payload: Partial<AulaPayload>,
  ): Promise<Aula> {
    const { data } = await api.put<DataResponse<Aula>>(
      `${aulasBase(modulo)}/${numero}`,
      payload,
    );
    return data.data;
  },
  async remove(modulo: string, numero: number): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${aulasBase(modulo)}/${numero}`);
    return data;
  },
};
