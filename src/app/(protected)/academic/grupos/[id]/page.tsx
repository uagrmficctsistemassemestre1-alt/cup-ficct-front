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
import { Field, SelectInput } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/api";
import { grupoMateriasService } from "@/services/academic/grupoMaterias.service";
import { materiasService } from "@/services/academic/materias.service";
import { docentesService } from "@/services/academic/docentes.service";
import {
  ACADEMIC_PERMISSION,
  type Docente,
  type GrupoMateria,
  type Materia,
} from "@/lib/academic";

function AddMateriaModal({
  grupo,
  taken,
  onClose,
  onDone,
}: {
  grupo: string;
  taken: Set<string>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sigla, setSigla] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    materiasService
      .list()
      .then(setMaterias)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const options = materias.filter((m) => !taken.has(m.sigla));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!sigla) return;
    setBusy(true);
    setError(null);
    try {
      await grupoMateriasService.attach(grupo, sigla);
      onDone();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Agregar materia">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner className="h-6 w-6" />
          </div>
        ) : options.length === 0 ? (
          <p className="text-sm text-slate-500">No hay materias disponibles para agregar.</p>
        ) : (
          <Field label="Materia">
            <SelectInput value={sigla} onChange={(e) => setSigla(e.target.value)} required>
              <option value="">Seleccioná una materia…</option>
              {options.map((m) => (
                <option key={m.sigla} value={m.sigla}>
                  {m.sigla} — {m.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy} disabled={!sigla || options.length === 0}>
            Agregar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AssignDocenteModal({
  grupo,
  item,
  onClose,
  onDone,
}: {
  grupo: string;
  item: GrupoMateria;
  onClose: () => void;
  onDone: () => void;
}) {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [ci, setCi] = useState(item.docente?.ci ?? "");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    docentesService
      .list()
      .then(setDocentes)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ci) return;
    setBusy(true);
    setError(null);
    try {
      await grupoMateriasService.assignDocente(grupo, item.sigla, ci);
      onDone();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Docente · ${item.sigla}`}>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {error && <Alert variant="error">{error}</Alert>}
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <Field label="Docente">
            <SelectInput value={ci} onChange={(e) => setCi(e.target.value)} required>
              <option value="">Seleccioná un docente…</option>
              {docentes.map((d) => (
                <option key={d.ci} value={d.ci}>
                  {d.nombres} {d.apellidos} ({d.ci})
                </option>
              ))}
            </SelectInput>
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy} disabled={!ci}>
            Asignar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function GrupoMateriasContent({ grupo }: { grupo: string }) {
  const [rows, setRows] = useState<GrupoMateria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [assigning, setAssigning] = useState<GrupoMateria | null>(null);
  const [actingError, setActingError] = useState<string | null>(null);
  const [busySigla, setBusySigla] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRows(await grupoMateriasService.list(grupo));
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [grupo]);

  useEffect(() => {
    void load();
  }, [load]);

  async function detach(sigla: string) {
    setActingError(null);
    setBusySigla(sigla);
    try {
      await grupoMateriasService.detach(grupo, sigla);
      await load();
    } catch (e) {
      setActingError(getErrorMessage(e));
    } finally {
      setBusySigla(null);
    }
  }

  async function removeDocente(sigla: string) {
    setActingError(null);
    setBusySigla(sigla);
    try {
      await grupoMateriasService.removeDocente(grupo, sigla);
      await load();
    } catch (e) {
      setActingError(getErrorMessage(e));
    } finally {
      setBusySigla(null);
    }
  }

  const taken = new Set(rows.map((r) => r.sigla));

  return (
    <div>
      <Link
        href="/academic/grupos"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Volver a grupos
      </Link>

      <PageHeader
        title={`Grupo #${grupo} · Materias`}
        description="Materias del grupo, su docente y horarios."
        actions={<Button onClick={() => setAdding(true)}>Agregar materia</Button>}
      />

      <Card className="p-0">
        {loadError && (
          <div className="p-4">
            <Alert variant="error">{loadError}</Alert>
          </div>
        )}
        {actingError && (
          <div className="p-4">
            <Alert variant="error">{actingError}</Alert>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            El grupo no cursa ninguna materia todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Sigla</th>
                  <th className="px-4 py-3">Materia</th>
                  <th className="px-4 py-3">Docente</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const busy = busySigla === r.sigla;
                  return (
                    <tr key={r.sigla} className="border-b border-slate-100">
                      <td className="px-4 py-3 align-top font-medium text-slate-900">
                        {r.sigla}
                      </td>
                      <td className="px-4 py-3 align-top">{r.nombre}</td>
                      <td className="px-4 py-3 align-top">
                        {r.docente
                          ? `${r.docente.nombres} ${r.docente.apellidos}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            href={`/academic/grupos/${grupo}/materias/${r.sigla}/horarios`}
                            className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
                          >
                            Horarios
                          </Link>
                          <Button variant="secondary" onClick={() => setAssigning(r)}>
                            {r.docente ? "Cambiar docente" : "Asignar docente"}
                          </Button>
                          {r.docente && (
                            <Button
                              variant="secondary"
                              loading={busy}
                              onClick={() => removeDocente(r.sigla)}
                            >
                              Quitar docente
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            loading={busy}
                            onClick={() => detach(r.sigla)}
                          >
                            Quitar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && (
        <AddMateriaModal
          grupo={grupo}
          taken={taken}
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false);
            void load();
          }}
        />
      )}

      {assigning && (
        <AssignDocenteModal
          grupo={grupo}
          item={assigning}
          onClose={() => setAssigning(null)}
          onDone={() => {
            setAssigning(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

export default function GrupoMateriasPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <GrupoMateriasContent grupo={params.id} />
    </RequirePermission>
  );
}
