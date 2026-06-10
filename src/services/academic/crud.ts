import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";

export const ACADEMIC_BASE = "/academic-management";

// Fábrica de servicios CRUD para los recursos planos del módulo.
// Las colecciones llegan como {data:[...]} (a veces paginadas); el recurso como {data:{...}}.
export function makeCrud<T, C extends object, U extends object = Partial<C>>(
  resource: string,
) {
  const base = `${ACADEMIC_BASE}/${resource}`;
  return {
    async list(): Promise<T[]> {
      const { data } = await api.get<Paginated<T>>(base);
      return data.data;
    },
    async create(payload: C): Promise<T> {
      const { data } = await api.post<DataResponse<T>>(base, payload);
      return data.data;
    },
    async update(id: string | number, payload: U): Promise<T> {
      const { data } = await api.put<DataResponse<T>>(`${base}/${id}`, payload);
      return data.data;
    },
    async remove(id: string | number): Promise<MessageResponse> {
      const { data } = await api.delete<MessageResponse>(`${base}/${id}`);
      return data;
    },
  };
}
