"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useFormErrors } from "@/hooks/useFormErrors";
import { getErrorMessage } from "@/lib/api";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export interface FormRenderArgs<F> {
  values: F;
  set: <K extends keyof F>(key: K, value: F[K]) => void;
  fieldError: (name: string) => string | undefined;
  editing: boolean;
}

export interface EntityManagerProps<T, F> {
  title: string;
  description?: string;
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  fetchAll: () => Promise<T[]>;
  emptyForm: F;
  toForm: (row: T) => F;
  renderForm: (args: FormRenderArgs<F>) => ReactNode;
  create: (form: F) => Promise<unknown>;
  update: (row: T, form: F) => Promise<unknown>;
  remove: (row: T) => Promise<unknown>;
  describe: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  toolbar?: ReactNode;
  summary?: (rows: T[]) => ReactNode;
  createLabel?: string;
  emptyText?: string;
}

// Tabla + alta/edición (modal) + borrado (confirmación), con errores 422 por campo.
export function EntityManager<T, F>(props: EntityManagerProps<T, F>) {
  const {
    title,
    description,
    columns,
    rowKey,
    fetchAll,
    emptyForm,
    toForm,
    renderForm,
    create,
    update,
    remove,
    describe,
    rowActions,
    toolbar,
    summary,
    createLabel = "Nuevo",
    emptyText = "No hay registros.",
  } = props;

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<F>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [deleting, setDeleting] = useState<T | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { message, handle, reset, fieldError } = useFormErrors();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRows(await fetchAll());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    void load();
  }, [load]);

  const set = useCallback(
    <K extends keyof F>(key: K, value: F[K]) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    [],
  );

  function openCreate() {
    reset();
    setEditing(null);
    setValues(emptyForm);
    setOpen(true);
  }

  function openEdit(row: T) {
    reset();
    setEditing(row);
    setValues(toForm(row));
    setOpen(true);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    try {
      if (editing) await update(editing, values);
      else await create(values);
      setOpen(false);
      await load();
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!deleting) return;
    setDeleteError(null);
    setDeleteBusy(true);
    try {
      await remove(deleting);
      setDeleting(null);
      await load();
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Button onClick={openCreate}>{createLabel}</Button>}
      />

      {toolbar && <Card className="mb-4">{toolbar}</Card>}

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
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200/80 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  {columns.map((col) => (
                    <th key={col.header} className="px-4 py-2.5">
                      {col.header}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    {columns.map((col) => (
                      <td key={col.header} className="px-4 py-3 align-top text-slate-700">
                        {col.render(row)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {rowActions?.(row)}
                        <Button variant="secondary" onClick={() => openEdit(row)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setDeleting(row)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && summary && (
          <div className="border-t border-slate-200 px-4 py-3 text-sm">
            {summary(rows)}
          </div>
        )}
      </Card>

      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title={editing ? `Editar ${title}` : `Nuevo ${title}`}
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            {message && <Alert variant="error">{message}</Alert>}
            {renderForm({ values, set, fieldError, editing: editing !== null })}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={submitting}>
                {editing ? "Guardar" : "Crear"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal open onClose={() => setDeleting(null)} title="Eliminar">
          <div className="flex flex-col gap-4">
            {deleteError && <Alert variant="error">{deleteError}</Alert>}
            <p className="text-sm text-slate-600">
              ¿Seguro que querés eliminar{" "}
              <span className="font-medium text-slate-900">{describe(deleting)}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={onDelete} loading={deleteBusy}>
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
