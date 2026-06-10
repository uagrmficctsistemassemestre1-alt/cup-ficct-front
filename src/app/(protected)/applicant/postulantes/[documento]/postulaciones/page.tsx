"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextArea } from "@/components/ui/Field";
import { useCan } from "@/hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { postulacionesService } from "@/services/applicant/postulaciones.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { cuposService } from "@/services/applicant/cupos.service";
import {
  APPLICANT_MANAGE,
  APPLICANT_VERIFY,
  TURNOS_PREFERENCIA,
  type CarreraCupo,
  type Convocatoria,
  type EstadoPostulacion,
  type Postulacion,
  type TurnoPreferencia,
} from "@/lib/applicant";
import { EstadoPostulacionBadge } from "@/components/applicant/EstadoPostulacionBadge";

function NuevaPostulacionModal({
  documento,
  convocatorias,
  onClose,
  onDone,
}: {
  documento: string;
  convocatorias: Convocatoria[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [convId, setConvId] = useState("");
  const [primera, setPrimera] = useState("");
  const [segunda, setSegunda] = useState("");
  const [ofertadas, setOfertadas] = useState<CarreraCupo[]>([]);
  const [loadingCupos, setLoadingCupos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});

  // Al elegir convocatoria, traigo las carreras ofertadas (sus cupos).
  useEffect(() => {
    setPrimera("");
    setSegunda("");
    if (!convId) {
      setOfertadas([]);
      return;
    }
    setLoadingCupos(true);
    cuposService
      .list(Number(convId))
      .then(setOfertadas)
      .catch(() => setOfertadas([]))
      .finally(() => setLoadingCupos(false));
  }, [convId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!convId || !primera || !segunda) return;
    setBusy(true);
    setError(null);
    setFieldErr({});
    try {
      await postulacionesService.create(documento, {
        convocatoria_id: Number(convId),
        carrera_primera_codigo: primera,
        carrera_segunda_codigo: segunda,
      });
      onDone();
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const segundaOptions = ofertadas.filter((o) => o.carrera_codigo !== primera);

  return (
    <Modal open onClose={onClose} title="Nueva postulación">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Convocatoria" error={fieldErr.convocatoria_id?.[0]}>
          <SelectInput
            value={convId}
            onChange={(e) => setConvId(e.target.value)}
            invalid={Boolean(fieldErr.convocatoria_id)}
            required
          >
            <option value="">Seleccioná una convocatoria…</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id} disabled={c.estado !== "ABIERTA"}>
                {c.nombre} ({c.gestion}) {c.estado !== "ABIERTA" ? "· CERRADA" : ""}
              </option>
            ))}
          </SelectInput>
        </Field>

        {convId &&
          (loadingCupos ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Spinner className="h-4 w-4" /> Cargando carreras ofertadas…
            </div>
          ) : ofertadas.length === 0 ? (
            <Alert variant="error">
              La convocatoria no tiene carreras ofertadas.
            </Alert>
          ) : (
            <>
              <Field label="Primera opción" error={fieldErr.carrera_primera_codigo?.[0]}>
                <SelectInput
                  value={primera}
                  onChange={(e) => {
                    setPrimera(e.target.value);
                    if (e.target.value === segunda) setSegunda("");
                  }}
                  invalid={Boolean(fieldErr.carrera_primera_codigo)}
                  required
                >
                  <option value="">Seleccioná…</option>
                  {ofertadas.map((o) => (
                    <option key={o.carrera_codigo} value={o.carrera_codigo}>
                      {o.carrera_codigo} — {o.nombre}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Segunda opción" error={fieldErr.carrera_segunda_codigo?.[0]}>
                <SelectInput
                  value={segunda}
                  onChange={(e) => setSegunda(e.target.value)}
                  invalid={Boolean(fieldErr.carrera_segunda_codigo)}
                  disabled={!primera}
                  required
                >
                  <option value="">Seleccioná…</option>
                  {segundaOptions.map((o) => (
                    <option key={o.carrera_codigo} value={o.carrera_codigo}>
                      {o.carrera_codigo} — {o.nombre}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </>
          ))}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={busy}
            disabled={!convId || !primera || !segunda}
          >
            Registrar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TurnoModal({
  documento,
  postulacion,
  onClose,
  onDone,
}: {
  documento: string;
  postulacion: Postulacion;
  onClose: () => void;
  onDone: () => void;
}) {
  const [turno, setTurno] = useState<TurnoPreferencia>(
    postulacion.turno_preferencia ?? "MANANA",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await postulacionesService.setTurno(documento, postulacion.convocatoria_id, turno);
      onDone();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Preferencia de turno">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <Field label="Turno">
          <SelectInput
            value={turno}
            onChange={(e) => setTurno(e.target.value as TurnoPreferencia)}
          >
            {TURNOS_PREFERENCIA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RechazarModal({
  documento,
  postulacion,
  onClose,
  onDone,
}: {
  documento: string;
  postulacion: Postulacion;
  onClose: () => void;
  onDone: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | undefined>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!motivo.trim()) {
      setFieldErr("El motivo es obligatorio.");
      return;
    }
    setBusy(true);
    setError(null);
    setFieldErr(undefined);
    try {
      await postulacionesService.rechazar(documento, postulacion.convocatoria_id, motivo);
      onDone();
    } catch (e) {
      const v = getValidationErrors(e);
      if (v?.motivo) setFieldErr(v.motivo[0]);
      else setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Rechazar postulación">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <Field label="Motivo del rechazo" error={fieldErr}>
          <TextArea
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            invalid={Boolean(fieldErr)}
            required
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" loading={busy}>
            Rechazar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function PostulacionesContent({ documento }: { documento: string }) {
  const canVerify = useCan(APPLICANT_VERIFY);
  const [rows, setRows] = useState<Postulacion[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);
  const [nueva, setNueva] = useState(false);
  const [turnoFor, setTurnoFor] = useState<Postulacion | null>(null);
  const [rechazarFor, setRechazarFor] = useState<Postulacion | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const convName = useCallback(
    (id: number) => convocatorias.find((c) => c.id === id)?.nombre ?? `#${id}`,
    [convocatorias],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pos, convs] = await Promise.all([
        postulacionesService.list(documento),
        convocatoriasService.list(),
      ]);
      setRows(pos);
      setConvocatorias(convs);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [documento]);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel(convocatoriaId: number) {
    setActError(null);
    setBusyId(convocatoriaId);
    try {
      await postulacionesService.cancel(documento, convocatoriaId);
      await load();
    } catch (e) {
      setActError(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  async function verificar(convocatoriaId: number) {
    setActError(null);
    setVerifyingId(convocatoriaId);
    try {
      await postulacionesService.verificar(documento, convocatoriaId);
      await load();
    } catch (e) {
      setActError(getErrorMessage(e));
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div>
      <Link
        href="/applicant/postulantes"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Volver a postulantes
      </Link>

      <PageHeader
        title={`Postulaciones · ${documento}`}
        description="Postulaciones del postulante (1ra y 2da opción de carrera)."
        actions={<Button onClick={() => setNueva(true)}>Nueva postulación</Button>}
      />

      <Card className="p-0">
        {loadError && (
          <div className="p-4">
            <Alert variant="error">{loadError}</Alert>
          </div>
        )}
        {actError && (
          <div className="p-4">
            <Alert variant="error">{actError}</Alert>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            El postulante no tiene postulaciones.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Convocatoria</th>
                  <th className="px-4 py-3">1ra opción</th>
                  <th className="px-4 py-3">2da opción</th>
                  <th className="px-4 py-3">Turno</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.convocatoria_id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{convName(p.convocatoria_id)}</td>
                    <td className="px-4 py-3">{p.carrera_primera_codigo}</td>
                    <td className="px-4 py-3">{p.carrera_segunda_codigo}</td>
                    <td className="px-4 py-3">{p.turno_preferencia ?? "—"}</td>
                    <td className="px-4 py-3">
                      <EstadoPostulacionBadge estado={p.estado} />
                      {p.estado === "RECHAZADO" && p.observacion && (
                        <p className="mt-1 text-xs text-slate-500">{p.observacion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {canVerify && p.estado === "PENDIENTE" && (
                          <>
                            <Button
                              variant="secondary"
                              loading={verifyingId === p.convocatoria_id}
                              onClick={() => verificar(p.convocatoria_id)}
                            >
                              Verificar
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setRechazarFor(p)}
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                        <Button variant="secondary" onClick={() => setTurnoFor(p)}>
                          Turno
                        </Button>
                        <Button
                          variant="danger"
                          loading={busyId === p.convocatoria_id}
                          onClick={() => cancel(p.convocatoria_id)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {nueva && (
        <NuevaPostulacionModal
          documento={documento}
          convocatorias={convocatorias}
          onClose={() => setNueva(false)}
          onDone={() => {
            setNueva(false);
            void load();
          }}
        />
      )}

      {turnoFor && (
        <TurnoModal
          documento={documento}
          postulacion={turnoFor}
          onClose={() => setTurnoFor(null)}
          onDone={() => {
            setTurnoFor(null);
            void load();
          }}
        />
      )}

      {rechazarFor && (
        <RechazarModal
          documento={documento}
          postulacion={rechazarFor}
          onClose={() => setRechazarFor(null)}
          onDone={() => {
            setRechazarFor(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

export default function PostulacionesPage() {
  const params = useParams<{ documento: string }>();

  return (
    <RequirePermission permission={APPLICANT_MANAGE}>
      <PostulacionesContent documento={params.documento} />
    </RequirePermission>
  );
}
