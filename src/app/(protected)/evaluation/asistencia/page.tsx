"use client";

import { useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { useGrupoRoster } from "@/hooks/useGrupoRoster";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { asistenciasService } from "@/services/evaluation/asistencias.service";
import {
  AsistenciaIndividualModal,
  type AsistenciaPrefill,
} from "@/components/evaluation/AsistenciaIndividualModal";
import {
  ATTENDANCE_MANAGE,
  ESTADOS_ASISTENCIA,
  type CargaResumen,
  type EstadoAsistencia,
} from "@/lib/evaluation";

function PlanillaAsistenciaContent() {
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

  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState(today);
  // estado por documento (default PRESENTE).
  const [estados, setEstados] = useState<Record<string, EstadoAsistencia>>({});
  const [submitting, setSubmitting] = useState(false);
  const [resumen, setResumen] = useState<CargaResumen | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});
  const [individual, setIndividual] = useState<AsistenciaPrefill | null>(null);

  const canSubmit = useMemo(
    () => Boolean(grupo && materia && fecha && roster.length > 0),
    [grupo, materia, fecha, roster.length],
  );

  function estadoDe(doc: string): EstadoAsistencia {
    return estados[doc] ?? "PRESENTE";
  }

  async function submit() {
    if (!grupo || !materia) return;
    const asistencias = roster.map((r) => ({
      postulante_documento: r.documento,
      estado: estadoDe(r.documento),
    }));
    setSubmitting(true);
    setSubmitError(null);
    setFieldErr({});
    setResumen(null);
    try {
      const res = await asistenciasService.bulk(grupo.id, materia, { fecha, asistencias });
      setResumen(res);
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setSubmitError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Planilla de asistencia"
        description="Registrá asistencia por grupo, materia y fecha. JUSTIFICADO cuenta como asistido. La carga es upsert."
        actions={
          <Button variant="secondary" onClick={() => setIndividual({})}>
            Asistencia individual
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
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
          <Field label="Fecha" error={fieldErr.fecha?.[0]}>
            <TextInput
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              invalid={Boolean(fieldErr.fecha)}
            />
          </Field>
        </div>
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {submitError && <Alert variant="error">{submitError}</Alert>}
      {fieldErr.asistencias && <Alert variant="error">{fieldErr.asistencias[0]}</Alert>}
      {resumen && (
        <Alert variant="success">
          Guardadas: {resumen.guardadas} · Omitidas: {resumen.omitidas} · No inscritos:{" "}
          {resumen.no_inscritos}
        </Alert>
      )}

      <Card className="mt-4 p-0">
        {loadingDetail ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : !grupo ? (
          <p className="p-6 text-center text-sm text-slate-500">Elegí un grupo para empezar.</p>
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
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.documento} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.documento}</td>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">
                      <SelectInput
                        className="max-w-44"
                        value={estadoDe(r.documento)}
                        onChange={(e) =>
                          setEstados((prev) => ({
                            ...prev,
                            [r.documento]: e.target.value as EstadoAsistencia,
                          }))
                        }
                      >
                        {ESTADOS_ASISTENCIA.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </SelectInput>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          setIndividual({
                            documento: r.documento,
                            materia,
                            fecha,
                            estado: estadoDe(r.documento),
                          })
                        }
                      >
                        Registrar puntual
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-end">
        <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
          Guardar asistencia
        </Button>
      </div>

      {individual && (
        <AsistenciaIndividualModal
          prefill={individual}
          onClose={() => setIndividual(null)}
          onSaved={() => undefined}
        />
      )}
    </div>
  );
}

export default function PlanillaAsistenciaPage() {
  return (
    <RequirePermission permission={ATTENDANCE_MANAGE}>
      <PlanillaAsistenciaContent />
    </RequirePermission>
  );
}
