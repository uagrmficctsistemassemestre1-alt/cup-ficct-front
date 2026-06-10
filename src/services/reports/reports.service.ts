import { api } from "@/lib/api";
import type { EstadoPostulacion, TurnoPreferencia } from "@/lib/applicant";
import type {
  ExportFormat,
  Reporte,
  ReporteVoz,
  ReportFormat,
} from "@/lib/reports";

const REPORTS_BASE = "/reports";

// Reporte genérico del backend: { titulo, headers, rows: string[][] }.
interface ReportResponse {
  titulo: string;
  headers: string[];
  rows: string[][];
}

export type ReportParams = Record<string, string | number | undefined | null>;

// Quita filtros vacíos para no mandarlos en la query.
function cleanParams(params: ReportParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}

// Reporte en JSON (tabla). path relativo a /reports (ej. "/estudiantes-por-grupo").
export async function fetchReporte(
  path: string,
  params: ReportParams = {},
): Promise<Reporte> {
  const { data } = await api.get<Reporte>(`${REPORTS_BASE}${path}`, {
    params: { ...cleanParams(params), format: "json" },
  });
  return data;
}

// Nombre de archivo desde Content-Disposition (o fallback).
function filenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : null;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Exporta el reporte (excel/pdf) como blob con Bearer y dispara la descarga.
export async function exportReporte(
  path: string,
  params: ReportParams,
  format: ExportFormat,
  fallbackName: string,
): Promise<void> {
  const res = await api.get(`${REPORTS_BASE}${path}`, {
    params: { ...cleanParams(params), format },
    responseType: "blob",
  });
  const ext = format === "excel" ? "xlsx" : "pdf";
  const filename =
    filenameFromDisposition(res.headers["content-disposition"]) ??
    `${fallbackName}.${ext}`;
  triggerDownload(res.data as Blob, filename);
}

// Reporte por voz: el front manda el texto transcrito; la IA elige reporte y filtros.
export async function reporteVoz(
  texto: string,
  format: ReportFormat = "json",
): Promise<ReporteVoz> {
  const { data } = await api.post<ReporteVoz>(`${REPORTS_BASE}/voz`, {
    texto,
    format,
  });
  return data;
}

// Exporta el resultado del reporte por voz (excel/pdf) como blob.
export async function reporteVozExport(
  texto: string,
  format: ExportFormat,
): Promise<void> {
  const res = await api.post(
    `${REPORTS_BASE}/voz`,
    { texto, format },
    { responseType: "blob" },
  );
  const ext = format === "excel" ? "xlsx" : "pdf";
  const filename =
    filenameFromDisposition(res.headers["content-disposition"]) ??
    `reporte-voz.${ext}`;
  triggerDownload(res.data as Blob, filename);
}

function colIndex(headers: string[], re: RegExp): number {
  return headers.findIndex((h) => re.test(h));
}

export interface RosterRow {
  documento: string;
  nombre: string;
}

// Lista de estudiantes (inscritos asignados) de un grupo, vía el módulo de reportes.
// El reporte devuelve filas alineadas a headers; se mapea por nombre de columna.
export async function estudiantesPorGrupo(
  gestion: string,
  grupoId: number,
): Promise<RosterRow[]> {
  const { data } = await api.get<ReportResponse>("/reports/estudiantes-por-grupo", {
    params: { gestion, grupo_id: grupoId, format: "json" },
  });
  const docIdx = data.headers.findIndex((h) => /documento/i.test(h));
  const nameIdx = data.headers.findIndex((h) => /estudiante|postulante|nombre/i.test(h));
  return data.rows.map((row) => ({
    documento: docIdx >= 0 ? row[docIdx] : row[0],
    nombre: nameIdx >= 0 ? row[nameIdx] : "",
  }));
}

export interface PostulacionFila {
  documento: string;
  postulante: string;
  primera: string;
  segunda: string;
  estado: EstadoPostulacion;
  turno: TurnoPreferencia | null;
}

// Mapea el reporte (headers + rows) a filas tipadas, por nombre de columna.
export function parsePostulacionesReport(
  headers: string[],
  rows: string[][],
): PostulacionFila[] {
  const iDoc = colIndex(headers, /documento/i);
  const iNom = colIndex(headers, /postulante|estudiante|nombre/i);
  const i1 = colIndex(headers, /1ra|primera/i);
  const i2 = colIndex(headers, /2da|segunda/i);
  const iEst = colIndex(headers, /estado/i);
  const iTur = colIndex(headers, /turno/i);
  return rows.map((r) => {
    const turno = iTur >= 0 ? r[iTur] : "";
    return {
      documento: iDoc >= 0 ? r[iDoc] : r[0],
      postulante: iNom >= 0 ? r[iNom] : "",
      primera: i1 >= 0 ? r[i1] : "",
      segunda: i2 >= 0 ? r[i2] : "",
      estado: (iEst >= 0 ? r[iEst] : "PENDIENTE") as EstadoPostulacion,
      turno: turno === "MANANA" || turno === "TARDE" ? turno : null,
    };
  });
}

// Postulaciones de una convocatoria (todas), para la bandeja de verificación.
export async function postulantesPorConvocatoria(
  convocatoriaId: number,
): Promise<PostulacionFila[]> {
  const { data } = await api.get<ReportResponse>(
    `/reports/convocatorias/${convocatoriaId}/postulantes`,
    { params: { format: "json" } },
  );
  return parsePostulacionesReport(data.headers, data.rows);
}
