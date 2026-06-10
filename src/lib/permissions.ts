// Nombres legibles de los permisos (lo que ve el usuario en la gestión de roles).

export const PERMISSION_LABELS: Record<string, string> = {
  "user.manage": "Gestionar usuarios",
  "role.manage": "Gestionar roles y permisos",
  "academic.manage": "Gestión académica",
  "applicant.manage": "Gestión de postulantes",
  "applicant.verify": "Verificar postulaciones",
  "applicant.assign": "Asignar grupos y carreras",
  "payment.manage": "Gestión de pagos",
  "grade.manage": "Cargar notas y boletines",
  "attendance.manage": "Registrar asistencia",
  "report.view": "Ver reportes",
  "report.export": "Exportar reportes",
};

// Etiqueta legible de un permiso (cae al nombre crudo si no está mapeado).
export function permissionLabel(name: string): string {
  return PERMISSION_LABELS[name] ?? name;
}

// Grupo legible por prefijo (ej. "applicant" → "Postulantes").
export const PERMISSION_GROUP_LABELS: Record<string, string> = {
  user: "Usuarios",
  role: "Roles",
  academic: "Académico",
  applicant: "Admisión",
  payment: "Pagos",
  grade: "Notas",
  attendance: "Asistencia",
  report: "Reportes",
};

export function permissionGroupLabel(prefix: string): string {
  return PERMISSION_GROUP_LABELS[prefix] ?? prefix;
}
