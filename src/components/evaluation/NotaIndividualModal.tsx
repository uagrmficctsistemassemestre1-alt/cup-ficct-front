"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { notasService } from "@/services/evaluation/notas.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import type { Convocatoria } from "@/lib/applicant";

export interface NotaPrefill {
  documento?: string;
  materia?: string;
  numero?: string;
  convocatoriaId?: number;
  valor?: string;
}

export function NotaIndividualModal({
  prefill,
  onClose,
  onSaved,
}: {
  prefill?: NotaPrefill;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [convId, setConvId] = useState(prefill?.convocatoriaId ? String(prefill.convocatoriaId) : "");
  const [documento, setDocumento] = useState(prefill?.documento ?? "");
  const [materia, setMateria] = useState(prefill?.materia ?? "");
  const [numero, setNumero] = useState(prefill?.numero ?? "1");
  const [valor, setValor] = useState(prefill?.valor ?? "");

  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!convId || !documento || !materia || !numero || valor === "") return;
    setBusy(true);
    setError(null);
    setFieldErr({});
    setOk(false);
    try {
      await notasService.create({
        postulante_documento: documento,
        convocatoria_id: Number(convId),
        materia_sigla: materia,
        numero: Number(numero),
        valor: Number(valor),
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
    <Modal open onClose={onClose} title="Nota individual (upsert)">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        {ok && <Alert variant="success">Nota guardada.</Alert>}

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
          <Field label="Nº de examen" error={fieldErr.numero?.[0]}>
            <TextInput
              type="number"
              min="1"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              invalid={Boolean(fieldErr.numero)}
              required
            />
          </Field>
          <Field label="Valor (0–100)" error={fieldErr.valor?.[0]}>
            <TextInput
              type="number"
              min="0"
              max="100"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              invalid={Boolean(fieldErr.valor)}
              required
            />
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
