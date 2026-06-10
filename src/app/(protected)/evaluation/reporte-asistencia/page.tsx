"use client";

import { useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput } from "@/components/ui/Field";
import { useGrupoRoster } from "@/hooks/useGrupoRoster";
import { getErrorMessage } from "@/lib/api";
import { asistenciasService } from "@/services/evaluation/asistencias.service";
import { ATTENDANCE_MANAGE, type ReporteAsistencia } from "@/lib/evaluation";

function ReporteContent() {
  const { grupos, grupo, selectGrupo, roster, loadingGrupos, loadingDetail, error: rosterError } =
    useGrupoRoster();
  const [documento, setDocumento] = useState("");
  const convId = grupo?.convocatoria_id ? String(grupo.convocatoria_id) : "";

  const [reporte, setReporte] = useState<ReporteAsistencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function consultar() {
    if (!convId || !documento) return;
    setLoading(true);
    setError(null);
    setReporte(null);
    try {
      setReporte(await asistenciasService.reporte(documento, Number(convId)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Reporte de asistencia" />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Grupo">
            <SelectInput
              value={grupo?.id ?? ""}
              onChange={(e) => {
                setDocumento("");
                selectGrupo(grupos.find((g) => g.id === Number(e.target.value)) ?? null);
              }}
              disabled={loadingGrupos}
            >
              <option value="">{loadingGrupos ? "Cargando…" : "Seleccioná un grupo…"}</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.codigo} · {g.turno} · {g.gestion}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Estudiante">
            <SelectInput
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              disabled={!grupo || loadingDetail}
            >
              <option value="">Seleccioná…</option>
              {roster.map((r) => (
                <option key={r.documento} value={r.documento}>
                  {r.documento} — {r.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex items-end">
            <Button onClick={consultar} loading={loading} disabled={!convId || !documento}>
              Consultar reporte
            </Button>
          </div>
        </div>
      </Card>

      {rosterError && <Alert variant="error">{rosterError}</Alert>}

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="flex justify-center p-10">
          <Spinner className="h-7 w-7" />
        </Card>
      ) : reporte ? (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <p className="text-sm text-slate-500">
                Postulante {reporte.postulante_documento} · Grupo #{reporte.grupo_id} · Base:{" "}
                {reporte.base_calculo}
                {reporte.sesiones_esperadas !== null
                  ? ` · Sesiones esperadas: ${reporte.sesiones_esperadas}`
                  : ""}
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Asistencia global: {reporte.porcentaje_global}%
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                reporte.estado === "HABILITADO"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {reporte.estado}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Materia</th>
                  <th className="px-4 py-3">Asistidos</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {reporte.materias.map((m) => (
                  <tr key={m.sigla} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{m.sigla}</span>
                      <span className="text-slate-500"> — {m.nombre}</span>
                    </td>
                    <td className="px-4 py-3">{m.asistidos}</td>
                    <td className="px-4 py-3">{m.total}</td>
                    <td className="px-4 py-3 font-medium">{m.porcentaje}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-sm text-slate-500">
            Elegí convocatoria y postulante para ver el reporte.
          </p>
        </Card>
      )}
    </div>
  );
}

export default function ReporteAsistenciaPage() {
  return (
    <RequirePermission permission={ATTENDANCE_MANAGE}>
      <ReporteContent />
    </RequirePermission>
  );
}
