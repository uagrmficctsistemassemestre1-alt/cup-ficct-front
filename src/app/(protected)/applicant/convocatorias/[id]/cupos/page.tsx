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
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { cuposService } from "@/services/applicant/cupos.service";
import { carrerasService } from "@/services/academic/carreras.service";
import { APPLICANT_MANAGE, type CarreraCupo } from "@/lib/applicant";
import type { Carrera } from "@/lib/academic";

function CupoModal({
  convocatoria,
  carreras,
  editing,
  onClose,
  onDone,
}: {
  convocatoria: string;
  carreras: Carrera[];
  editing: CarreraCupo | null;
  onClose: () => void;
  onDone: (rows: CarreraCupo[]) => void;
}) {
  const [carrera, setCarrera] = useState(editing?.carrera_codigo ?? "");
  const [cupos, setCupos] = useState(editing ? String(editing.cupos) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string[]>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!carrera) return;
    setBusy(true);
    setError(null);
    setFieldErr({});
    try {
      const rows = await cuposService.set(convocatoria, carrera, Number(cupos));
      onDone(rows);
    } catch (e) {
      const v = getValidationErrors(e);
      if (v) setFieldErr(v);
      else setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Editar cupo" : "Fijar cupo de carrera"}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        <Field label="Carrera" error={fieldErr.carrera_codigo?.[0]}>
          <SelectInput
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            invalid={Boolean(fieldErr.carrera_codigo)}
            disabled={Boolean(editing)}
            required
          >
            <option value="">Seleccioná una carrera…</option>
            {carreras.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Cupos" error={fieldErr.cupos?.[0]}>
          <TextInput
            type="number"
            min="0"
            value={cupos}
            onChange={(e) => setCupos(e.target.value)}
            invalid={Boolean(fieldErr.cupos)}
            required
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy} disabled={!carrera}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CuposContent({ convocatoria }: { convocatoria: string }) {
  const [rows, setRows] = useState<CarreraCupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);

  const [modal, setModal] = useState<{ editing: CarreraCupo | null } | null>(null);
  const [busyCodigo, setBusyCodigo] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cupos, cars] = await Promise.all([
        cuposService.list(convocatoria),
        carrerasService.list(),
      ]);
      setRows(cupos);
      setCarreras(cars);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [convocatoria]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(codigo: string) {
    setActError(null);
    setBusyCodigo(codigo);
    try {
      await cuposService.remove(convocatoria, codigo);
      setRows((prev) => prev.filter((r) => r.carrera_codigo !== codigo));
    } catch (e) {
      setActError(getErrorMessage(e));
    } finally {
      setBusyCodigo(null);
    }
  }

  return (
    <div>
      <Link
        href="/applicant/convocatorias"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Volver a convocatorias
      </Link>

      <PageHeader
        title={`Cupos · Convocatoria #${convocatoria}`}
        description="Carreras ofertadas en la convocatoria y sus cupos."
        actions={
          <Button onClick={() => setModal({ editing: null })}>Fijar cupo</Button>
        }
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
            No hay carreras ofertadas todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Carrera</th>
                  <th className="px-4 py-3">Cupos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.carrera_codigo} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {r.carrera_codigo}
                    </td>
                    <td className="px-4 py-3">{r.nombre}</td>
                    <td className="px-4 py-3">{r.cupos}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => setModal({ editing: r })}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          loading={busyCodigo === r.carrera_codigo}
                          onClick={() => remove(r.carrera_codigo)}
                        >
                          Quitar
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

      {modal && (
        <CupoModal
          convocatoria={convocatoria}
          carreras={carreras}
          editing={modal.editing}
          onClose={() => setModal(null)}
          onDone={(updated) => {
            setRows(updated);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

export default function CuposPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequirePermission permission={APPLICANT_MANAGE}>
      <CuposContent convocatoria={params.id} />
    </RequirePermission>
  );
}
