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
import { notasService } from "@/services/evaluation/notas.service";
import { GRADE_MANAGE, type Boletin } from "@/lib/evaluation";

function BoletinContent() {
  const { grupos, grupo, selectGrupo, roster, loadingGrupos, loadingDetail, error: rosterError } =
    useGrupoRoster();
  const [documento, setDocumento] = useState("");
  const convId = grupo?.convocatoria_id ? String(grupo.convocatoria_id) : "";

  const [boletin, setBoletin] = useState<Boletin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function consultar() {
    if (!convId || !documento) return;
    setLoading(true);
    setError(null);
    setBoletin(null);
    try {
      setBoletin(await notasService.boletin(documento, Number(convId)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Boletín de notas" />

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
              Consultar boletín
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
      ) : boletin ? (
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <p className="text-sm text-slate-500">
                Postulante {boletin.postulante_documento} · Grupo #{boletin.grupo_id}
              </p>
              <p className="text-lg font-semibold text-slate-900">
                Promedio final: {boletin.promedio_final}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                boletin.estado === "APROBADO"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {boletin.estado}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Materia</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Exámenes</th>
                  <th className="px-4 py-3">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {boletin.materias.map((m) => (
                  <tr key={m.sigla} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{m.sigla}</span>
                      <span className="text-slate-500"> — {m.nombre}</span>
                    </td>
                    <td className="px-4 py-3">{+(m.peso * 100).toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      {m.examenes.length === 0
                        ? "—"
                        : m.examenes
                            .map((e) => `#${e.numero}: ${e.valor}`)
                            .join("  ·  ")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {m.promedio === null ? "—" : m.promedio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-center text-sm text-slate-500">
            Elegí un grupo y un estudiante para ver el boletín.
          </p>
        </Card>
      )}
    </div>
  );
}

export default function BoletinPage() {
  return (
    <RequirePermission permission={GRADE_MANAGE}>
      <BoletinContent />
    </RequirePermission>
  );
}
