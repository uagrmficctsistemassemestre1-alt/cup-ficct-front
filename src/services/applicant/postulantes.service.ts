import { api } from "@/lib/api";
import type { DataResponse, MessageResponse, Paginated } from "@/lib/types";
import type { CargaMasivaResult, Postulante } from "@/lib/applicant";

export const APPLICANT_BASE = "/applicant-admission";

const base = `${APPLICANT_BASE}/postulantes`;

export interface PostulantePayload {
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  colegio: string;
  ciudad: string;
}

export interface ListParams {
  search?: string;
  per_page?: number;
}

export const postulantesService = {
  async list(params: ListParams = {}): Promise<Postulante[]> {
    const { data } = await api.get<Paginated<Postulante>>(base, {
      params: { per_page: 100, ...params },
    });
    return data.data;
  },
  async get(documento: string): Promise<Postulante> {
    const { data } = await api.get<DataResponse<Postulante>>(`${base}/${documento}`);
    return data.data;
  },
  async create(payload: PostulantePayload): Promise<Postulante> {
    const { data } = await api.post<DataResponse<Postulante>>(base, payload);
    return data.data;
  },
  async update(
    documento: string,
    payload: Partial<PostulantePayload>,
  ): Promise<Postulante> {
    const { data } = await api.put<DataResponse<Postulante>>(
      `${base}/${documento}`,
      payload,
    );
    return data.data;
  },
  async remove(documento: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`${base}/${documento}`);
    return data;
  },
  // Carga masiva: CSV/Excel + ZIP opcional de títulos. Devuelve resumen plano.
  async lote(file: File, titulos?: File | null): Promise<CargaMasivaResult> {
    const form = new FormData();
    form.append("archivo", file);
    if (titulos) form.append("titulos", titulos);
    const { data } = await api.post<CargaMasivaResult>(`${base}/lote`, form);
    return data;
  },
  // Sube el título de bachiller (pdf/jpg/jpeg/png) y devuelve el postulante.
  async uploadTitulo(documento: string, file: File): Promise<Postulante> {
    const form = new FormData();
    form.append("titulo", file);
    const { data } = await api.post<DataResponse<Postulante>>(
      `${base}/${documento}/titulo`,
      form,
    );
    return data.data;
  },
};
