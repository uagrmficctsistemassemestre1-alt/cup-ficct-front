"use client";

import { useCallback, useState } from "react";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import {
  exportReporte,
  fetchReporte,
  type ReportParams,
} from "@/services/reports/reports.service";
import type { ExportFormat, Reporte } from "@/lib/reports";

// Estado de un reporte: generar (JSON) y exportar (excel/pdf) sobre un mismo path.
export function useReporte(path: string) {
  const [data, setData] = useState<Reporte | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (params: ReportParams) => {
      setLoading(true);
      setError(null);
      try {
        setData(await fetchReporte(path, params));
      } catch (e) {
        const v = getValidationErrors(e);
        setError(v ? Object.values(v).flat().join(" ") : getErrorMessage(e));
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [path],
  );

  const exportar = useCallback(
    (params: ReportParams, format: ExportFormat, fallbackName: string) =>
      exportReporte(path, params, format, fallbackName),
    [path],
  );

  return { data, loading, error, run, exportar };
}
