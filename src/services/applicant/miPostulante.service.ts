import { api } from "@/lib/api";
import type { DataResponse } from "@/lib/types";
import type { Postulante } from "@/lib/applicant";
import type { Pago } from "@/lib/payments";
import type { Boletin, ReporteAsistencia } from "@/lib/evaluation";
import { APPLICANT_BASE } from "./postulantes.service";

const base = `${APPLICANT_BASE}/mi-postulante`;

export interface CompletarPerfilPayload {
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  fecha_nacimiento?: string;
  colegio?: string;
  ciudad?: string;
}

export interface ConvocatoriaAbierta {
  id: number;
  nombre: string;
  gestion: string;
  carreras: { codigo: string; nombre: string }[];
}

export interface MiPostulacion {
  convocatoria_id: number;
  convocatoria: string | null;
  gestion: string | null;
  carrera_primera: string;
  carrera_primera_nombre: string;
  carrera_segunda: string;
  carrera_segunda_nombre: string;
  turno_preferencia: string | null;
  estado: "PENDIENTE" | "VERIFICADO" | "RECHAZADO";
  observacion: string | null;
}

export interface CrearPostulacionPayload {
  convocatoria_id: number;
  carrera_primera_codigo: string;
  carrera_segunda_codigo: string;
  turno_preferencia: string;
}

export const miPostulanteService = {
  // Datos del propio postulante (404 si el usuario no es postulante).
  async get(): Promise<Postulante> {
    const { data } = await api.get<DataResponse<Postulante>>(base);
    return data.data;
  },
  async update(payload: CompletarPerfilPayload): Promise<Postulante> {
    const { data } = await api.put<DataResponse<Postulante>>(base, payload);
    return data.data;
  },
  async uploadTitulo(file: File): Promise<Postulante> {
    const form = new FormData();
    form.append("titulo", file);
    const { data } = await api.post<DataResponse<Postulante>>(`${base}/titulo`, form);
    return data.data;
  },
  // Pagos del propio postulante (cobros de inscripción y otros).
  async pagos(): Promise<Pago[]> {
    const { data } = await api.get<DataResponse<Pago[]>>(`${base}/pagos`);
    return data.data;
  },
  // Mi boletín (notas + promedio + estado) de mi inscripción.
  async boletin(): Promise<Boletin> {
    const { data } = await api.get<Boletin>(`${base}/boletin`);
    return data;
  },
  // Mi reporte de asistencia (% por materia, global y habilitación).
  async asistencia(): Promise<ReporteAsistencia> {
    const { data } = await api.get<ReporteAsistencia>(`${base}/asistencia`);
    return data;
  },
  // Convocatorias abiertas (con sus carreras) para postularme.
  async convocatoriasAbiertas(): Promise<ConvocatoriaAbierta[]> {
    const { data } = await api.get<ConvocatoriaAbierta[]>(`${base}/convocatorias`);
    return data;
  },
  // Mis postulaciones (estado, carreras, turno).
  async postulaciones(): Promise<MiPostulacion[]> {
    const { data } = await api.get<MiPostulacion[]>(`${base}/postulaciones`);
    return data;
  },
  // Crear mi postulación (queda PENDIENTE de verificación).
  async crearPostulacion(payload: CrearPostulacionPayload): Promise<void> {
    await api.post(`${base}/postulaciones`, payload);
  },
};
