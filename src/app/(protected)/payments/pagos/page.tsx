"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput } from "@/components/ui/Field";
import { EstadoPagoBadge } from "@/components/payments/EstadoPagoBadge";
import { PagoFormModal } from "@/components/payments/PagoFormModal";
import { getErrorMessage } from "@/lib/api";
import { pagosService, type PagosFilter } from "@/services/payments/pagos.service";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { postulantesService } from "@/services/applicant/postulantes.service";
import { PAYMENT_MANAGE, type Pago } from "@/lib/payments";
import type { Convocatoria, Postulante } from "@/lib/applicant";

function PagosContent() {
  const [rows, setRows] = useState<Pago[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [postulantes, setPostulantes] = useState<Postulante[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fPostulante, setFPostulante] = useState("");
  const [fConvocatoria, setFConvocatoria] = useState("");

  const [deleting, setDeleting] = useState<Pago | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // form modal: undefined = cerrado, null = nuevo, Pago = editar.
  const [form, setForm] = useState<Pago | null | undefined>(undefined);

  const convName = useMemo(
    () => (id: number) => convocatorias.find((c) => c.id === id)?.nombre ?? `#${id}`,
    [convocatorias],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const filter: PagosFilter = {};
    if (fPostulante) filter.postulante = fPostulante;
    if (fConvocatoria) filter.convocatoria = Number(fConvocatoria);
    try {
      setRows(await pagosService.list(filter));
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fPostulante, fConvocatoria]);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
    postulantesService.list().then(setPostulantes).catch(() => setPostulantes([]));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await pagosService.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (e) {
      setDeleteError(getErrorMessage(e));
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pagos"
        description="Gestión de pagos: filtrá por postulante y convocatoria."
        actions={<Button onClick={() => setForm(null)}>Nuevo pago</Button>}
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Postulante">
            <SelectInput
              value={fPostulante}
              onChange={(e) => setFPostulante(e.target.value)}
            >
              <option value="">Todos</option>
              {postulantes.map((p) => (
                <option key={p.documento} value={p.documento}>
                  {p.documento} — {p.nombres} {p.apellidos}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Convocatoria">
            <SelectInput
              value={fConvocatoria}
              onChange={(e) => setFConvocatoria(e.target.value)}
            >
              <option value="">Todas</option>
              {convocatorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.gestion})
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFPostulante("");
                setFConvocatoria("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>

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
          <p className="p-6 text-center text-sm text-slate-500">No hay pagos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Postulante</th>
                  <th className="px-4 py-3">Convocatoria</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {p.postulante_documento}
                    </td>
                    <td className="px-4 py-3">{convName(p.convocatoria_id)}</td>
                    <td className="px-4 py-3">{p.monto}</td>
                    <td className="px-4 py-3">{p.metodo}</td>
                    <td className="px-4 py-3">
                      <EstadoPagoBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/payments/pagos/${p.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          Detalle
                        </Link>
                        <Button variant="secondary" onClick={() => setForm(p)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setDeleting(p)}>
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
      </Card>

      {form !== undefined && (
        <PagoFormModal
          pago={form}
          postulantes={postulantes}
          convocatorias={convocatorias}
          onClose={() => setForm(undefined)}
          onSaved={() => {
            setForm(undefined);
            void load();
          }}
        />
      )}

      {deleting && (
        <Modal open onClose={() => setDeleting(null)} title="Eliminar pago">
          <div className="flex flex-col gap-4">
            {deleteError && <Alert variant="error">{deleteError}</Alert>}
            <p className="text-sm text-slate-600">
              ¿Eliminar el pago #{deleting.id} de {deleting.postulante_documento} por{" "}
              {deleting.monto}?
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

export default function PagosPage() {
  return (
    <RequirePermission permission={PAYMENT_MANAGE}>
      <PagosContent />
    </RequirePermission>
  );
}
