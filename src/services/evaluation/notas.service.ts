import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type { Boletin, CargaResumen, Nota } from "@/lib/evaluation";

const BASE = "/evaluation";

export interface NotaPayload {
  postulante_documento: string;
  convocatoria_id: number;
  materia_sigla: string;
  numero: number;
  valor: number;
}

export interface BulkNotasPayload {
  numero: number;
  notas: { postulante_documento: string; valor: number }[];
}

// Asignación grupo-materia visible para el usuario (docente: las suyas; staff: todas).
export interface MiGrupoMateria {
  grupo_id: number;
  grupo_codigo: string;
  turno: string;
  gestion: string;
  convocatoria_id: number | null;
  convocatoria_nombre: string | null;
  materia_sigla: string;
  materia_nombre: string;
}

export interface RosterRow {
  documento: string;
  nombre: string;
}

export const notasService = {
  // Carga individual (upsert idempotente). La respuesta viene envuelta en {data}.
  async create(payload: NotaPayload): Promise<Nota> {
    const { data } = await api.post<DataResponse<Nota>>(`${BASE}/notas`, payload);
    return data.data;
  },
  // Carga masiva por grupo-materia → resumen plano.
  async bulk(
    grupoId: number,
    materiaSigla: string,
    payload: BulkNotasPayload,
  ): Promise<CargaResumen> {
    const { data } = await api.post<CargaResumen>(
      `${BASE}/grupos/${grupoId}/materias/${materiaSigla}/notas`,
      payload,
    );
    return data;
  },
  // Boletín del postulante en una convocatoria → objeto plano.
  async boletin(documento: string, convocatoriaId: number): Promise<Boletin> {
    const { data } = await api.get<Boletin>(
      `${BASE}/postulantes/${documento}/convocatorias/${convocatoriaId}/boletin`,
    );
    return data;
  },
  // Grupos+materias del usuario (docente: asignados; staff: todos).
  async misGrupos(): Promise<MiGrupoMateria[]> {
    const { data } = await api.get<MiGrupoMateria[]>(`${BASE}/mis-grupos`);
    return data;
  },
  // Roster (inscritos) de un grupo, accesible para el docente del grupo.
  async estudiantesGrupo(grupoId: number): Promise<RosterRow[]> {
    const { data } = await api.get<RosterRow[]>(`${BASE}/grupos/${grupoId}/estudiantes`);
    return data;
  },
};
