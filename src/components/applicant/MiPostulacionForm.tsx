"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { EstadoPostulacionBadge } from "@/components/applicant/EstadoPostulacionBadge";
import { getErrorMessage } from "@/lib/api";
import {
  miPostulanteService,
  type ConvocatoriaAbierta,
  type MiPostulacion,
} from "@/services/applicant/miPostulante.service";

const TURNOS = ["MANANA", "TARDE", "NOCHE"] as const;

export function MiPostulacionForm({ disabled }: { disabled: boolean }) {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaAbierta[]>([]);
  const [postulaciones, setPostulaciones] = useState<MiPostulacion[]>([]);
  const [loading, setLoading] = useState(true);

  const [convId, setConvId] = useState("");
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [turno, setTurno] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function loadPostulaciones() {
    try {
      setPostulaciones(await miPostulanteService.postulaciones());
    } catch {
      setPostulaciones([]);
    }
  }

  useEffect(() => {
    Promise.all([
      miPostulanteService.convocatoriasAbiertas().catch(() => []),
      miPostulanteService.postulaciones().catch(() => []),
    ])
      .then(([convs, posts]) => {
        setConvocatorias(convs);
        setPostulaciones(posts);
      })
      .finally(() => setLoading(false));
  }, []);

  const conv = useMemo(
    () => convocatorias.find((c) => String(c.id) === convId) ?? null,
    [convocatorias, convId],
  );

  // Convocatorias en las que aún no postulé.
  const yaPostuladas = new Set(postulaciones.map((p) => p.convocatoria_id));
  const disponibles = convocatorias.filter((c) => !yaPostuladas.has(c.id));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setOkMsg(null);
    setSaving(true);
    try {
      await miPostulanteService.crearPostulacion({
        convocatoria_id: Number(convId),
        carrera_primera_codigo: c1,
        carrera_segunda_codigo: c2,
        turno_preferencia: turno,
      });
      setOkMsg("Postulación registrada. Queda pendiente de verificación.");
      setConvId("");
      setC1("");
      setC2("");
      setTurno("");
      await loadPostulaciones();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">Mi postulación</h2>

      {loading ? (
        <div className="flex justify-center p-6">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          {postulaciones.length > 0 && (
            <ul className="mb-5 divide-y divide-slate-100">
              {postulaciones.map((p) => (
                <li
                  key={p.convocatoria_id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.convocatoria} ({p.gestion})
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      1ª {p.carrera_primera_nombre} · 2ª {p.carrera_segunda_nombre} ·
                      Turno {p.turno_preferencia}
                    </p>
                    {p.observacion && (
                      <p className="mt-0.5 text-xs text-red-600">{p.observacion}</p>
                    )}
                  </div>
                  <EstadoPostulacionBadge estado={p.estado} />
                </li>
              ))}
            </ul>
          )}

          {disabled ? (
            <Alert variant="info">
              Completá tus datos personales para poder postularte.
            </Alert>
          ) : disponibles.length === 0 ? (
            <p className="text-sm text-slate-500">
              {convocatorias.length === 0
                ? "No hay convocatorias abiertas en este momento."
                : "Ya te postulaste en todas las convocatorias abiertas."}
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
              {error && <Alert variant="error">{error}</Alert>}
              {okMsg && <Alert variant="success">{okMsg}</Alert>}

              <Field label="Convocatoria">
                <SelectInput
                  value={convId}
                  onChange={(e) => {
                    setConvId(e.target.value);
                    setC1("");
                    setC2("");
                  }}
                  required
                >
                  <option value="">Seleccioná…</option>
                  {disponibles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.gestion})
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Carrera (1ª opción)">
                  <SelectInput
                    value={c1}
                    onChange={(e) => setC1(e.target.value)}
                    disabled={!conv}
                    required
                  >
                    <option value="">Seleccioná…</option>
                    {conv?.carreras.map((ca) => (
                      <option key={ca.codigo} value={ca.codigo}>
                        {ca.nombre}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="Carrera (2ª opción)">
                  <SelectInput
                    value={c2}
                    onChange={(e) => setC2(e.target.value)}
                    disabled={!conv}
                    required
                  >
                    <option value="">Seleccioná…</option>
                    {conv?.carreras
                      .filter((ca) => ca.codigo !== c1)
                      .map((ca) => (
                        <option key={ca.codigo} value={ca.codigo}>
                          {ca.nombre}
                        </option>
                      ))}
                  </SelectInput>
                </Field>
              </div>

              <Field label="Turno de preferencia">
                <SelectInput
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  required
                >
                  <option value="">Seleccioná…</option>
                  {TURNOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Button
                type="submit"
                loading={saving}
                disabled={!convId || !c1 || !c2 || !turno}
              >
                Postularme
              </Button>
            </form>
          )}
        </>
      )}
    </Card>
  );
}
