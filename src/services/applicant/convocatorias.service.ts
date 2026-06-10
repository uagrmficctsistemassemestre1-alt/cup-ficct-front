import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { Convocatoria, EstadoConvocatoria } from "@/lib/applicant";
import { APPLICANT_BASE } from "./postulantes.service";

const base = `${APPLICANT_BASE}/convocatorias`;

export interface ConvocatoriaPayload {
  nombre: string;
  gestion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: EstadoConvocatoria;
}

export const convocatoriasService = {
  async list(): Promise<Convocatoria[]> {
    const { data } = await api.get<Paginated<Convocatoria>>(base, {
      params: { per_page: 100 },
    });
    return data.data;
  },
  async get(id: number): Promise<Convocatoria> {
    const { data } = await api.get<DataResponse<Convocatoria>>(`${base}/${id}`);
    return data.data;
  },
  async create(payload: ConvocatoriaPayload): Promise<Convocatoria> {
    const { data } = await api.post<DataResponse<Convocatoria>>(base, payload);
    return data.data;
  },
  async update(id: number, payload: ConvocatoriaPayload): Promise<Convocatoria> {
    const { data } = await api.put<DataResponse<Convocatoria>>(`${base}/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base}/${id}`);
    return data;
  },
};
