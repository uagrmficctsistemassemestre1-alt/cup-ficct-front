// Dominio del módulo ApplicantAdmission (espejo de la API Laravel).

// Permisos: cada acción se habilita con su permiso (el back igual responde 403).
export const APPLICANT_MANAGE = "applicant.manage";
export const APPLICANT_ASSIGN = "applicant.assign";
export const APPLICANT_VERIFY = "applicant.verify";

// Enums (para selects).
export const ESTADOS_CONVOCATORIA = ["ABIERTA", "CERRADA"] as const;
export type EstadoConvocatoria = (typeof ESTADOS_CONVOCATORIA)[number];

export const ESTADOS_POSTULACION = ["PENDIENTE", "VERIFICADO", "RECHAZADO"] as const;
export type EstadoPostulacion = (typeof ESTADOS_POSTULACION)[number];

// La preferencia de turno admite solo estos dos.
export const TURNOS_PREFERENCIA = ["MANANA", "TARDE"] as const;
export type TurnoPreferencia = (typeof TURNOS_PREFERENCIA)[number];

// Entidades.
export interface Postulante {
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string; // "YYYY-MM-DD"
  colegio: string;
  ciudad: string;
  titulo_bachiller_path: string | null;
  created_at: string;
}

export interface Convocatoria {
  id: number;
  nombre: string;
  gestion: string;
  fecha_inicio: string; // "YYYY-MM-DD"
  fecha_fin: string; // "YYYY-MM-DD"
  estado: EstadoConvocatoria;
}

export interface CarreraCupo {
  carrera_codigo: string;
  nombre: string;
  cupos: number;
}

export interface Postulacion {
  postulante_documento: string;
  convocatoria_id: number;
  carrera_primera_codigo: string;
  carrera_segunda_codigo: string;
  estado: EstadoPostulacion;
  observacion: string | null;
  turno_preferencia: TurnoPreferencia | null;
  created_at: string;
}

// Respuestas de procesos / carga masiva (objeto plano, sin {data}).
export interface CargaMasivaResult {
  creados: number;
  omitidos: number;
  errores: string[] | Record<string, unknown>[];
  postulaciones?: number;
  titulos_subidos?: number;
  titulos_sin_match?: string[];
}

export interface GenerarGruposResult {
  grupos_creados: number;
  inscritos: number;
  manana: number;
  tarde: number;
}

export interface AsignarCarrerasResult {
  elegibles: number;
  asignados: number;
  sin_cupo: number;
  por_carrera: Record<string, number>;
}
