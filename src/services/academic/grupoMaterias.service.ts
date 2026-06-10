import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { GrupoMateria } from "@/lib/academic";
import { ACADEMIC_BASE } from "./crud";

function base(grupo: number | string): string {
  return `${ACADEMIC_BASE}/grupos/${grupo}/materias`;
}

export const grupoMateriasService = {
  async list(grupo: number | string): Promise<GrupoMateria[]> {
    const { data } = await api.get<Paginated<GrupoMateria>>(base(grupo));
    return data.data;
  },
  async sync(grupo: number | string, siglas: string[]): Promise<GrupoMateria[]> {
    const { data } = await api.put<Paginated<GrupoMateria>>(base(grupo), { siglas });
    return data.data;
  },
  async attach(grupo: number | string, sigla: string): Promise<unknown> {
    const { data } = await api.post(base(grupo), { sigla });
    return data;
  },
  async detach(grupo: number | string, sigla: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base(grupo)}/${sigla}`);
    return data;
  },
  async assignDocente(
    grupo: number | string,
    sigla: string,
    ci: string,
  ): Promise<DataResponse<GrupoMateria>> {
    const { data } = await api.put<DataResponse<GrupoMateria>>(
      `${base(grupo)}/${sigla}/docente`,
      { ci },
    );
    return data;
  },
  async removeDocente(grupo: number | string, sigla: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base(grupo)}/${sigla}/docente`);
    return data;
  },
};
