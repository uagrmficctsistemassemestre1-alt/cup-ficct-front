"use client";

import { useEffect, useState } from "react";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { getErrorMessage } from "@/lib/api";
import { miPostulanteService } from "@/services/applicant/miPostulante.service";
import type { Boletin, ReporteAsistencia } from "@/lib/evaluation";

export default function MiRendimientoPage() {
  const [boletin, setBoletin] = useState<Boletin | null>(null);
  const [asistencia, setAsistencia] = useState<ReporteAsistencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.allSettled([miPostulanteService.boletin(), miPostulanteService.asistencia()])
      .then(([b, a]) => {
        if (b.status === "fulfilled") setBoletin(b.value);
        if (a.status === "fulfilled") setAsistencia(a.value);
        if (b.status === "rejected" && a.status === "rejected") {
          setError(getErrorMessage(b.reason));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mi rendimiento" />

      {error && <Alert variant="error">{error}</Alert>}

      {!boletin && !asistencia && !error && (
        <Card>
          <p className="text-center text-sm text-slate-500">
            Todavía no tenés notas ni asistencia registradas.
          </p>
        </Card>
      )}

      {boletin && (
        <Card className="mb-4 p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Boletín de notas
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Promedio final: {boletin.promedio_final}
              </p>
            </div>
            <Badge tone={boletin.estado === "APROBADO" ? "success" : "danger"}>
              {boletin.estado}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/80 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">Materia</th>
                  <th className="px-4 py-2.5">Peso</th>
                  <th className="px-4 py-2.5">Exámenes</th>
                  <th className="px-4 py-2.5">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {boletin.materias.map((m) => (
                  <tr key={m.sigla} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-900">{m.sigla}</span>
                      <span className="text-slate-500"> — {m.nombre}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{+(m.peso * 100).toFixed(2)}%</td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {m.examenes.length === 0
                        ? "—"
                        : m.examenes.map((e) => `#${e.numero}: ${e.valor}`).join("  ·  ")}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {m.promedio === null ? "—" : m.promedio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {asistencia && (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 p-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Asistencia
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Global: {asistencia.porcentaje_global}%
              </p>
            </div>
            <Badge tone={asistencia.estado === "HABILITADO" ? "success" : "danger"}>
              {asistencia.estado}
            </Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/80 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2.5">Materia</th>
                  <th className="px-4 py-2.5">Asistidos</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">%</th>
                </tr>
              </thead>
              <tbody>
                {asistencia.materias.map((m) => (
                  <tr key={m.sigla} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-900">{m.sigla}</span>
                      <span className="text-slate-500"> — {m.nombre}</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{m.asistidos}</td>
                    <td className="px-4 py-2.5 text-slate-700">{m.total}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{m.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
