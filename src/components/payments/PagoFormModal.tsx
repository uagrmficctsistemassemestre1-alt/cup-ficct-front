"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { pagosService } from "@/services/payments/pagos.service";
import { METODOS_PAGO, type MetodoPago, type Pago } from "@/lib/payments";
import type { Convocatoria, Postulante } from "@/lib/applicant";

// "YYYY-MM-DD HH:mm" <-> valor de <input type=datetime-local> ("YYYY-MM-DDTHH:mm").
function toInput(v: string): string {
  return v ? v.replace(" ", "T").slice(0, 16) : "";
}
function fromInput(v: string): string {
  return v ? v.replace("T", " ").slice(0, 16) : "";
}

export function PagoFormModal({
  pago,
  postulantes,
  convocatorias,
  onClose,
  onSaved,
}: {
  pago: Pago | null;
  postulantes: Postulante[];
  convocatorias: Convocatoria[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = pago !== null;
  const [documento, setDocumento] = useState(pago?.postulante_documento ?? "");
  const [convId, setConvId] = useState(pago ? String(pago.convocatoria_id) : "");
  const [monto, setMonto] = useState(pago ? String(pago.monto) : "");
  const [concepto, setConcepto] = useState(pago?.concepto ?? "");
  const [metodo, setMetodo] = useState<MetodoPago>(pago?.metodo ?? "EFECTIVO");
  const [fechaPago, setFechaPago] = useState(toInput(pago?.fecha_pago ?? ""));

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});

  const fe = (k: string) => fieldErr[k]?.[0];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErr({});
    try {
      if (editing) {
        await pagosService.update(pago.id, {
          monto: Number(monto),
          concepto,
          metodo,
          fecha_pago: fromInput(fechaPago),
        });
      } else {
        await pagosService.create({
          postulante_documento: documento,
          convocatoria_id: Number(convId),
          monto: Number(monto),
          concepto,
          metodo,
          fecha_pago: fromInput(fechaPago),
        });
      }
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
    <Modal open onClose={onClose} title={editing ? "Editar pago" : "Nuevo pago"}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Postulante" error={fe("postulante_documento")}>
          <SelectInput
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            invalid={Boolean(fe("postulante_documento"))}
            disabled={editing}
            required
          >
            <option value="">Seleccioná…</option>
            {postulantes.map((p) => (
              <option key={p.documento} value={p.documento}>
                {p.documento} — {p.nombres} {p.apellidos}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Convocatoria" error={fe("convocatoria_id")}>
          <SelectInput
            value={convId}
            onChange={(e) => setConvId(e.target.value)}
            invalid={Boolean(fe("convocatoria_id"))}
            disabled={editing}
            required
          >
            <option value="">Seleccioná…</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.gestion})
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Monto" error={fe("monto")}>
            <TextInput
              type="number"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              invalid={Boolean(fe("monto"))}
              required
            />
          </Field>
          <Field label="Método" error={fe("metodo")}>
            <SelectInput
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as MetodoPago)}
              invalid={Boolean(fe("metodo"))}
            >
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <Field label="Concepto" error={fe("concepto")}>
          <TextInput
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            invalid={Boolean(fe("concepto"))}
            required
          />
        </Field>
        <Field label="Fecha de pago" error={fe("fecha_pago")}>
          <TextInput
            type="datetime-local"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            invalid={Boolean(fe("fecha_pago"))}
            required
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy}>
            {editing ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
