"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextArea } from "@/components/ui/Field";
import { FilePreview } from "@/components/ui/FilePreview";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import {
  postulantesPorConvocatoria,
  type PostulacionFila,
} from "@/services/reports/reports.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { postulacionesService } from "@/services/applicant/postulaciones.service";
import {
  APPLICANT_VERIFY,
  ESTADOS_POSTULACION,
  type Convocatoria,
} from "@/lib/applicant";
import { EstadoPostulacionBadge } from "@/components/applicant/EstadoPostulacionBadge";

function RechazarModal({
  documento,
  convocatoriaId,
  onClose,
  onDone,
}: {
  documento: string;
  convocatoriaId: number;
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
      await postulacionesService.rechazar(documento, convocatoriaId, motivo);
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
    <Modal open onClose={onClose} title={`Rechazar postulación · ${documento}`}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <Field label="Motivo (observación)" error={fieldErr}>
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

function VerificacionContent() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [convId, setConvId] = useState("");
  const [estado, setEstado] = useState("");
  const [rows, setRows] = useState<PostulacionFila[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);

  const [rechazar, setRechazar] = useState<PostulacionFila | null>(null);
  const [verTitulo, setVerTitulo] = useState<PostulacionFila | null>(null);

  useEffect(() => {
    convocatoriasService
      .list()
      .then((cs) => {
        setConvocatorias(cs);
        if (cs.length > 0) setConvId(String(cs[0].id));
      })
      .catch(() => setConvocatorias([]));
  }, []);

  const load = useCallback(async () => {
    if (!convId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      setRows(await postulantesPorConvocatoria(Number(convId)));
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [convId]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () => (estado ? rows.filter((r) => r.estado === estado) : rows),
    [rows, estado],
  );

  async function verificar(doc: string) {
    if (!convId) return;
    setActError(null);
    setBusyDoc(doc);
    try {
      await postulacionesService.verificar(doc, Number(convId));
      await load();
    } catch (e) {
      setActError(getErrorMessage(e));
    } finally {
      setBusyDoc(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Verificación de postulaciones"
        description="Revisá las postulaciones, sus papeles (título) y aprobá o rechazá con observación."
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Convocatoria">
            <SelectInput value={convId} onChange={(e) => setConvId(e.target.value)}>
              <option value="">Seleccioná…</option>
              {convocatorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.gestion})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Estado">
            <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS_POSTULACION.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      </Card>

      {actError && <Alert variant="error">{actError}</Alert>}

      <Card className="p-0">
        {loadError && (
          <div className="p-4">
            <Alert variant="error">{loadError}</Alert>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : visible.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No hay postulaciones para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Postulante</th>
                  <th className="px-4 py-3">1ra</th>
                  <th className="px-4 py-3">2da</th>
                  <th className="px-4 py-3">Turno</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.documento} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.documento}</td>
                    <td className="px-4 py-3">{r.postulante}</td>
                    <td className="px-4 py-3">{r.primera}</td>
                    <td className="px-4 py-3">{r.segunda}</td>
                    <td className="px-4 py-3">{r.turno ?? "—"}</td>
                    <td className="px-4 py-3">
                      <EstadoPostulacionBadge estado={r.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" onClick={() => setVerTitulo(r)}>
                          Ver título
                        </Button>
                        {r.estado === "PENDIENTE" && (
                          <>
                            <Button
                              loading={busyDoc === r.documento}
                              onClick={() => verificar(r.documento)}
                            >
                              Verificar
                            </Button>
                            <Button variant="danger" onClick={() => setRechazar(r)}>
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {rechazar && (
        <RechazarModal
          documento={rechazar.documento}
          convocatoriaId={Number(convId)}
          onClose={() => setRechazar(null)}
          onDone={() => {
            setRechazar(null);
            void load();
          }}
        />
      )}

      {verTitulo && (
        <FilePreview
          title={`Título · ${verTitulo.postulante} (${verTitulo.documento})`}
          proxyPath={`/api/titulo/${verTitulo.documento}`}
          downloadName={`titulo-${verTitulo.documento}`}
          onClose={() => setVerTitulo(null)}
        />
      )}
    </div>
  );
}

export default function VerificacionPage() {
  return (
    <RequirePermission permission={APPLICANT_VERIFY}>
      <VerificacionContent />
    </RequirePermission>
  );
}
