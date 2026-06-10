import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type {
  Asistencia,
  CargaResumen,
  EstadoAsistencia,
  ReporteAsistencia,
} from "@/lib/evaluation";

const BASE = "/evaluation";

export interface AsistenciaPayload {
  postulante_documento: string;
  convocatoria_id: number;
  materia_sigla: string;
  fecha: string;
  estado: EstadoAsistencia;
}

export interface BulkAsistenciasPayload {
  fecha: string;
  asistencias: { postulante_documento: string; estado: EstadoAsistencia }[];
}

export const asistenciasService = {
  // Carga individual (upsert idempotente). La respuesta viene envuelta en {data}.
  async create(payload: AsistenciaPayload): Promise<Asistencia> {
    const { data } = await api.post<DataResponse<Asistencia>>(
      `${BASE}/asistencias`,
      payload,
    );
    return data.data;
  },
  // Carga masiva por grupo-materia → resumen plano.
  async bulk(
    grupoId: number,
    materiaSigla: string,
    payload: BulkAsistenciasPayload,
  ): Promise<CargaResumen> {
    const { data } = await api.post<CargaResumen>(
      `${BASE}/grupos/${grupoId}/materias/${materiaSigla}/asistencias`,
      payload,
    );
    return data;
  },
  // Reporte de asistencia del postulante en una convocatoria → objeto plano.
  async reporte(documento: string, convocatoriaId: number): Promise<ReporteAsistencia> {
    const { data } = await api.get<ReporteAsistencia>(
      `${BASE}/postulantes/${documento}/convocatorias/${convocatoriaId}/asistencia`,
    );
    return data;
  },
};
