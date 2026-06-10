"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { asistenciasService } from "@/services/evaluation/asistencias.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { ESTADOS_ASISTENCIA, type EstadoAsistencia } from "@/lib/evaluation";
import type { Convocatoria } from "@/lib/applicant";

export interface AsistenciaPrefill {
  documento?: string;
  materia?: string;
  fecha?: string;
  convocatoriaId?: number;
  estado?: EstadoAsistencia;
}

export function AsistenciaIndividualModal({
  prefill,
  onClose,
  onSaved,
}: {
  prefill?: AsistenciaPrefill;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [convId, setConvId] = useState(
    prefill?.convocatoriaId ? String(prefill.convocatoriaId) : "",
  );
  const [documento, setDocumento] = useState(prefill?.documento ?? "");
  const [materia, setMateria] = useState(prefill?.materia ?? "");
  const [fecha, setFecha] = useState(prefill?.fecha ?? new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = useState<EstadoAsistencia>(prefill?.estado ?? "PRESENTE");

  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!convId || !documento || !materia || !fecha) return;
    setBusy(true);
    setError(null);
    setFieldErr({});
    setOk(false);
    try {
      await asistenciasService.create({
        postulante_documento: documento,
        convocatoria_id: Number(convId),
        materia_sigla: materia,
        fecha,
        estado,
      });
      setOk(true);
      onSaved();
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Asistencia individual (upsert)">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        {ok && <Alert variant="success">Asistencia guardada.</Alert>}

        <Field label="Convocatoria" error={fieldErr.convocatoria_id?.[0]}>
          <SelectInput
            value={convId}
            onChange={(e) => setConvId(e.target.value)}
            invalid={Boolean(fieldErr.convocatoria_id)}
            required
          >
            <option value="">Seleccioná una convocatoria…</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.gestion})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Documento del postulante" error={fieldErr.postulante_documento?.[0]}>
          <TextInput
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            invalid={Boolean(fieldErr.postulante_documento)}
            required
          />
        </Field>
        <Field label="Materia (sigla)" error={fieldErr.materia_sigla?.[0]}>
          <TextInput
            value={materia}
            onChange={(e) => setMateria(e.target.value)}
            invalid={Boolean(fieldErr.materia_sigla)}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha" error={fieldErr.fecha?.[0]}>
            <TextInput
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              invalid={Boolean(fieldErr.fecha)}
              required
            />
          </Field>
          <Field label="Estado" error={fieldErr.estado?.[0]}>
            <SelectInput
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoAsistencia)}
              invalid={Boolean(fieldErr.estado)}
            >
              {ESTADOS_ASISTENCIA.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="submit" loading={busy}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
