// Dominio del módulo Reports.

export const REPORT_VIEW = "report.view";
export const REPORT_EXPORT = "report.export";

export type ReportFormat = "json" | "excel" | "pdf";
export type ExportFormat = "excel" | "pdf";

// Forma común de todos los reportes (format=json).
export interface Reporte {
  titulo: string;
  headers: string[];
  rows: (string | number | null)[][];
}

// Reporte por voz: agrega la interpretación de la IA.
export interface ReporteVozInterpretacion {
  reporte:
    | "estudiantes_por_grupo"
    | "postulantes"
    | "recaudacion"
    | "resultados"
    | "asignacion_carreras"
    | "admitidos";
  filtros: Record<string, string | number>;
}

export interface ReporteVoz extends Reporte {
  interpretacion: ReporteVozInterpretacion;
}
