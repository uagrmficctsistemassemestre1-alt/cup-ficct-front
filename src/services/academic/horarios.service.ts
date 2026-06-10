import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { Horario } from "@/lib/academic";
import { ACADEMIC_BASE } from "./crud";

// Horarios anidados en grupo-materia (PK compuesta: grupo + materia + numero).
export interface HorarioPayload {
  dia: Horario["dia"];
  hora_inicio: string;
  hora_fin: string;
  aula_modulo_numero: string;
  aula_numero: number;
}

function base(grupo: number | string, sigla: string): string {
  return `${ACADEMIC_BASE}/grupos/${grupo}/materias/${sigla}/horarios`;
}

export const horariosService = {
  async list(grupo: number | string, sigla: string): Promise<Horario[]> {
    const { data } = await api.get<Paginated<Horario>>(base(grupo, sigla));
    return data.data;
  },
  async create(
    grupo: number | string,
    sigla: string,
    payload: HorarioPayload,
  ): Promise<Horario> {
    const { data } = await api.post<DataResponse<Horario>>(base(grupo, sigla), payload);
    return data.data;
  },
  async update(
    grupo: number | string,
    sigla: string,
    numero: number,
    payload: HorarioPayload,
  ): Promise<Horario> {
    const { data } = await api.put<DataResponse<Horario>>(
      `${base(grupo, sigla)}/${numero}`,
      payload,
    );
    return data.data;
  },
  async remove(
    grupo: number | string,
    sigla: string,
    numero: number,
  ): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base(grupo, sigla)}/${numero}`);
    return data;
  },
};
