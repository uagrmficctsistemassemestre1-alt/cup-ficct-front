"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Field, SelectInput, TextArea } from "@/components/ui/Field";
import { EstadoPagoBadge } from "@/components/payments/EstadoPagoBadge";
import { ComprobantesSection } from "@/components/payments/ComprobantesSection";
import { ReciboButton } from "@/components/payments/ReciboButton";
import { useCan } from "@/hooks/useAuth";
import { getErrorMessage, getValidationErrors } from "@/lib/api";
import { pagosService } from "@/services/payments/pagos.service";
import { GATEWAYS, PAYMENT_MANAGE, type Gateway, type Pago } from "@/lib/payments";

function RechazarModal({
  id,
  onClose,
  onDone,
}: {
  id: number;
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
      await pagosService.rechazar(id, motivo);
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
    <Modal open onClose={onClose} title="Rechazar pago">
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

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

function PagoDetalleContent({ id }: { id: number }) {
  const isStaff = useCan(PAYMENT_MANAGE);
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actError, setActError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [gateway, setGateway] = useState<Gateway>("stripe");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPago(await pagosService.get(id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function confirmar() {
    setActError(null);
    setConfirming(true);
    try {
      setPago(await pagosService.confirmar(id));
    } catch (e) {
      setActError(getErrorMessage(e));
    } finally {
      setConfirming(false);
    }
  }

  async function pagar() {
    setCheckoutError(null);
    setCheckoutBusy(true);
    try {
      const url = await pagosService.checkout(id, gateway);
      window.location.href = url;
    } catch (e) {
      setCheckoutError(getErrorMessage(e));
      setCheckoutBusy(false);
    }
  }

  return (
    <div>
      {isStaff && (
        <Link
          href="/payments/pagos"
          className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
        >
          ← Volver a pagos
        </Link>
      )}

      <PageHeader title={`Pago #${id}`} description="Detalle del pago." />

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <Card className="flex justify-center p-10">
          <Spinner className="h-7 w-7" />
        </Card>
      ) : pago ? (
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <EstadoPagoBadge estado={pago.estado} />
            <span className="text-2xl font-semibold text-slate-900">{pago.monto}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Postulante" value={pago.postulante_documento} />
            <Row label="Convocatoria" value={`#${pago.convocatoria_id}`} />
            <Row label="Concepto" value={pago.concepto} />
            <Row label="Método" value={pago.metodo} />
            <Row label="Fecha de pago" value={pago.fecha_pago} />
            <Row label="Creado" value={pago.created_at} />
            {pago.estado === "PAGADO" && (
              <>
                <Row
                  label="Confirmado por"
                  value={pago.confirmado_por ? `Usuario #${pago.confirmado_por}` : "—"}
                />
                <Row label="Confirmado el" value={pago.confirmado_at ?? "—"} />
              </>
            )}
            {pago.estado === "RECHAZADO" && (
              <Row
                label="Motivo de rechazo"
                value={
                  <span className="text-red-600">{pago.motivo_rechazo ?? "—"}</span>
                }
              />
            )}
          </div>

          {isStaff && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              {actError && (
                <div className="mb-3">
                  <Alert variant="error">{actError}</Alert>
                </div>
              )}
              {pago.estado === "PENDIENTE" ? (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={confirmar} loading={confirming}>
                    Confirmar pago
                  </Button>
                  <Button variant="danger" onClick={() => setRechazando(true)}>
                    Rechazar
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  El pago ya está {pago.estado}; no admite confirmar/rechazar.
                </p>
              )}
            </div>
          )}
        </Card>
      ) : null}

      {pago && pago.estado === "PAGADO" && (
        <Card className="mt-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recibo</h2>
          <ReciboButton pagoId={pago.id} />
        </Card>
      )}

      {pago && pago.estado === "PENDIENTE" && (
        <Card className="mt-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Pagar en línea</h2>
          {checkoutError && (
            <div className="mb-3">
              <Alert variant="error">{checkoutError}</Alert>
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Pasarela">
              <SelectInput
                className="max-w-44"
                value={gateway}
                onChange={(e) => setGateway(e.target.value as Gateway)}
              >
                {GATEWAYS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Button onClick={pagar} loading={checkoutBusy}>
              Pagar con tarjeta
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Te redirige al checkout seguro de la pasarela. Tarjeta de prueba Stripe: 4242
            4242 4242 4242.
          </p>
        </Card>
      )}

      {pago && <ComprobantesSection pagoId={pago.id} isStaff={isStaff} />}

      {rechazando && pago && (
        <RechazarModal
          id={pago.id}
          onClose={() => setRechazando(false)}
          onDone={() => {
            setRechazando(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

export default function PagoDetallePage() {
  const params = useParams<{ id: string }>();
  return <PagoDetalleContent id={Number(params.id)} />;
}
