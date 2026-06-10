// Dominio del módulo Evaluation (espejo de la API Laravel).

// Permisos: notas → grade.manage; asistencia → attendance.manage.
export const GRADE_MANAGE = "grade.manage";
export const ATTENDANCE_MANAGE = "attendance.manage";

// Enums (para selects / lectura).
export const ESTADOS_ASISTENCIA = ["PRESENTE", "AUSENTE", "JUSTIFICADO"] as const;
export type EstadoAsistencia = (typeof ESTADOS_ASISTENCIA)[number];

export type EstadoAcademico = "APROBADO" | "REPROBADO";
export type EstadoHabilitacion = "HABILITADO" | "INHABILITADO";

// Entidades.
export interface Nota {
  postulante_documento: string;
  convocatoria_id: number;
  materia_sigla: string;
  numero: number; // nº de examen
  valor: number; // 0–100
}

export interface Asistencia {
  postulante_documento: string;
  convocatoria_id: number;
  materia_sigla: string;
  fecha: string; // "YYYY-MM-DD"
  estado: EstadoAsistencia;
}

// Resumen de cargas masivas (objeto plano).
export interface CargaResumen {
  guardadas: number;
  omitidas: number;
  no_inscritos: number;
}

// Boletín (objeto plano).
export interface BoletinMateria {
  sigla: string;
  nombre: string;
  peso: number;
  examenes: { numero: number; valor: number }[];
  promedio: number | null;
}

export interface Boletin {
  postulante_documento: string;
  convocatoria_id: number;
  grupo_id: number;
  materias: BoletinMateria[];
  promedio_final: number;
  estado: EstadoAcademico;
}

// Reporte de asistencia (objeto plano).
export interface ReporteAsistenciaMateria {
  sigla: string;
  nombre: string;
  total: number;
  asistidos: number;
  porcentaje: number;
}

export interface ReporteAsistencia {
  postulante_documento: string;
  convocatoria_id: number;
  grupo_id: number;
  base_calculo: "calendario" | "registros";
  sesiones_esperadas: number | null;
  materias: ReporteAsistenciaMateria[];
  porcentaje_global: number;
  estado: EstadoHabilitacion;
}
