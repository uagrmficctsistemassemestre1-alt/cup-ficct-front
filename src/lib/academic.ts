// Dominio del módulo AcademicManagement (espejo de la API Laravel).

export const ACADEMIC_PERMISSION = "academic.manage";

// Enums (para selects).
export const TURNOS = ["MANANA", "TARDE", "NOCHE"] as const;
export type Turno = (typeof TURNOS)[number];

export const AULA_TIPOS = ["COMUN", "LABORATORIO", "AUDITORIO"] as const;
export type AulaTipo = (typeof AULA_TIPOS)[number];

export const DIAS_SEMANA = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

// Entidades.
export interface Facultad {
  codigo: string;
  nombre: string;
  abreviatura: string;
  created_at?: string;
}

export interface Carrera {
  codigo: string;
  nombre: string;
  facultad_codigo: string;
  created_at?: string;
}

export interface Materia {
  sigla: string;
  nombre: string;
  peso: number;
  created_at?: string;
}

export interface Modulo {
  numero: string;
  nombre: string;
  ubicacion: string | null;
  created_at?: string;
}

export interface Aula {
  modulo_numero: string;
  numero: number;
  nombre: string;
  capacidad: number;
  piso: number;
  tipo: AulaTipo;
  created_at?: string;
}

export interface Periodo {
  id: number;
  codigo: string;
  gestion: string;
  fecha_inicio_clases: string;
  fecha_fin_clases: string;
}

export interface Docente {
  ci: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  profesion: string | null;
  created_at?: string;
}

export interface Grupo {
  id: number;
  codigo: string;
  turno: Turno;
  capacidad: number;
  gestion: string;
  created_at?: string;
}

// La API lista las materias del grupo como Materia (sigla/nombre/peso).
// El docente puede venir embebido si el backend lo incluye (opcional).
export interface GrupoMateria {
  sigla: string;
  nombre: string;
  peso: number;
  docente?: Docente | null;
}

export interface Horario {
  grupo_id: number;
  materia_sigla: string;
  numero: number;
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  aula: { modulo_numero: string; numero: number };
}
