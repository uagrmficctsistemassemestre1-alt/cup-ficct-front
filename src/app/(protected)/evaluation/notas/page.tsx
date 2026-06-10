"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { useGrupoRoster } from "@/hooks/useGrupoRoster";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { notasService } from "@/services/evaluation/notas.service";
import {
  NotaIndividualModal,
  type NotaPrefill,
} from "@/components/evaluation/NotaIndividualModal";
import { GRADE_MANAGE } from "@/lib/evaluation";
import { collectColumn, maxExamNumber, type Grid } from "@/lib/notasGrid";

interface SaveResult {
  guardadas: number;
  omitidas: number;
  no_inscritos: number;
}

function PlanillaNotasContent() {
  const {
    grupos,
    grupo,
    selectGrupo,
    materias,
    materia,
    setMateria,
    roster,
    loadingGrupos,
    loadingDetail,
    error,
  } = useGrupoRoster();

  // Convocatoria derivada del grupo seleccionado (para precargar/guardar notas).
  const convId = grupo?.convocatoria_id ? String(grupo.convocatoria_id) : "";

  // Columnas de exámenes (1..numExams) y celdas.
  const [numExams, setNumExams] = useState(1);
  const [grid, setGrid] = useState<Grid>({});

  const [loadingNotes, setLoadingNotes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumen, setResumen] = useState<SaveResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});
  const [individual, setIndividual] = useState<NotaPrefill | null>(null);

  const exams = useMemo(
    () => Array.from({ length: numExams }, (_, i) => i + 1),
    [numExams],
  );

  const setCell = useCallback((doc: string, numero: number, valor: string) => {
    setGrid((prev) => ({ ...prev, [doc]: { ...prev[doc], [numero]: valor } }));
  }, []);

  // Precarga de notas existentes vía boletín de cada estudiante (requiere convocatoria).
  const preload = useCallback(async () => {
    if (!materia || !convId || roster.length === 0) {
      setGrid({});
      return;
    }
    setLoadingNotes(true);
    setSubmitError(null);
    try {
      const next: Grid = {};
      const results = await Promise.allSettled(
        roster.map((r) => notasService.boletin(r.documento, Number(convId))),
      );
      results.forEach((res, idx) => {
        if (res.status !== "fulfilled") return;
        const doc = roster[idx].documento;
        const mat = res.value.materias.find((m) => m.sigla === materia);
        if (!mat) return;
        next[doc] = {};
        mat.examenes.forEach((e) => {
          next[doc][e.numero] = String(e.valor);
        });
      });
      setGrid(next);
      setNumExams(maxExamNumber(next));
    } catch (e) {
      setSubmitError(getErrorMessage(e));
    } finally {
      setLoadingNotes(false);
    }
  }, [materia, convId, roster]);

  // Al cambiar grupo/materia/convocatoria, recargar la matriz.
  useEffect(() => {
    if (convId) void preload();
    else setGrid({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materia, convId, roster]);

  const canSave = useMemo(
    () => Boolean(grupo && materia && roster.length > 0),
    [grupo, materia, roster.length],
  );

  async function save() {
    if (!grupo || !materia) return;
    setSaving(true);
    setSubmitError(null);
    setFieldErr({});
    setResumen(null);
    const acc: SaveResult = { guardadas: 0, omitidas: 0, no_inscritos: 0 };
    try {
      // Una carga masiva por columna (nº de examen) con celdas no vacías.
      const documentos = roster.map((r) => r.documento);
      for (const numero of exams) {
        const notas = collectColumn(documentos, grid, numero);
        if (notas.length === 0) continue;
        const res = await notasService.bulk(grupo.id, materia, { numero, notas });
        acc.guardadas += res.guardadas;
        acc.omitidas += res.omitidas;
        acc.no_inscritos += res.no_inscritos;
      }
      setResumen(acc);
      if (convId) void preload();
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setSubmitError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Planilla de notas"
        description="Matriz de calificaciones: una fila por estudiante y una columna por examen. La carga es upsert."
        actions={
          <Button variant="secondary" onClick={() => setIndividual({})}>
            Nota individual
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Grupo">
            <SelectInput
              value={grupo?.id ?? ""}
              onChange={(e) =>
                selectGrupo(grupos.find((g) => g.id === Number(e.target.value)) ?? null)
              }
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
          <Field label="Materia">
            <SelectInput
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              disabled={!grupo || loadingDetail}
            >
              <option value="">Seleccioná una materia…</option>
              {materias.map((m) => (
                <option key={m.sigla} value={m.sigla}>
                  {m.sigla} — {m.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {submitError && <Alert variant="error">{submitError}</Alert>}
      {fieldErr.notas && <Alert variant="error">{fieldErr.notas[0]}</Alert>}
      {fieldErr.numero && <Alert variant="error">{fieldErr.numero[0]}</Alert>}
      {resumen && (
        <Alert variant="success">
          Guardadas: {resumen.guardadas} · Omitidas: {resumen.omitidas} · No inscritos:{" "}
          {resumen.no_inscritos}
        </Alert>
      )}

      <Card className="mt-4 p-0">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3">
          <p className="text-sm text-slate-600">
            {roster.length > 0
              ? `${roster.length} estudiante(s) · ${numExams} examen(es)`
              : "Elegí grupo y materia."}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setNumExams((n) => Math.max(1, n - 1))}
              disabled={numExams <= 1}
            >
              − Examen
            </Button>
            <Button variant="secondary" onClick={() => setNumExams((n) => n + 1)}>
              + Examen
            </Button>
          </div>
        </div>

        {loadingDetail || loadingNotes ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : !grupo || !materia ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Seleccioná un grupo y una materia para cargar la planilla.
          </p>
        ) : roster.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            El grupo no tiene estudiantes inscritos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Estudiante</th>
                  {exams.map((n) => (
                    <th key={n} className="px-3 py-3 text-center">
                      Examen {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.documento} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.documento}</td>
                    <td className="px-4 py-3">{r.nombre}</td>
                    {exams.map((n) => (
                      <td key={n} className="px-2 py-2">
                        <TextInput
                          type="number"
                          min="0"
                          max="100"
                          className="w-20 text-center"
                          value={grid[r.documento]?.[n] ?? ""}
                          onChange={(e) => setCell(r.documento, n, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-end">
        <Button onClick={save} loading={saving} disabled={!canSave}>
          Guardar notas
        </Button>
      </div>

      {individual && (
        <NotaIndividualModal
          prefill={individual}
          onClose={() => setIndividual(null)}
          onSaved={() => {
            if (convId) void preload();
          }}
        />
      )}
    </div>
  );
}

export default function PlanillaNotasPage() {
  return (
    <RequirePermission permission={GRADE_MANAGE}>
      <PlanillaNotasContent />
    </RequirePermission>
  );
}
