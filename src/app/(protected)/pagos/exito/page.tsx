"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EstadoPagoBadge } from "@/components/payments/EstadoPagoBadge";
import { ReciboButton } from "@/components/payments/ReciboButton";
import { getErrorMessage } from "@/lib/api";
import { pagosService } from "@/services/payments/pagos.service";
import type { Pago } from "@/lib/payments";

const MAX_INTENTOS = 10;
const INTERVALO_MS = 2000;

function ExitoContent() {
  const params = useSearchParams();
  const pagoId = params.get("pago_id") ?? params.get("pago");

  const [pago, setPago] = useState<Pago | null>(null);
  const [error, setError] = useState<string | null>(null);
  // "polling" mientras esperamos el webhook; "done" al ver PAGADO; "timeout" si se agotó.
  const [phase, setPhase] = useState<"polling" | "done" | "timeout" | "invalid">(
    pagoId ? "polling" : "invalid",
  );
  const intentos = useRef(0);

  const poll = useCallback(async () => {
    if (!pagoId) return;
    try {
      const p = await pagosService.get(Number(pagoId));
      setPago(p);
      if (p.estado === "PAGADO") {
        setPhase("done");
        return;
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
    intentos.current += 1;
    if (intentos.current >= MAX_INTENTOS) {
      setPhase("timeout");
    }
  }, [pagoId]);

  useEffect(() => {
    if (phase !== "polling") return;
    void poll();
    const t = setInterval(() => {
      if (intentos.current >= MAX_INTENTOS) {
        clearInterval(t);
        return;
      }
      void poll();
    }, INTERVALO_MS);
    return () => clearInterval(t);
  }, [phase, poll]);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Pago en proceso" description="Volviste desde la pasarela de pago." />

      {error && <Alert variant="error">{error}</Alert>}

      {phase === "invalid" ? (
        <Card>
          <p className="text-sm text-slate-600">No se indicó el pago a verificar.</p>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-4 text-center">
          {phase === "polling" && (
            <>
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-slate-600">
                Confirmando tu pago con la pasarela… esto puede tardar unos segundos.
              </p>
            </>
          )}

          {phase === "done" && pago && (
            <>
              <div className="flex items-center gap-3">
                <EstadoPagoBadge estado={pago.estado} />
                <span className="text-2xl font-semibold text-slate-900">{pago.monto}</span>
              </div>
              <p className="text-sm text-green-700">¡Pago confirmado!</p>
              <ReciboButton pagoId={pago.id} />
            </>
          )}

          {phase === "timeout" && (
            <>
              <p className="text-sm text-amber-700">
                Todavía no vemos el pago confirmado. La pasarela puede tardar un momento.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  intentos.current = 0;
                  setPhase("polling");
                }}
              >
                Reintentar verificación
              </Button>
            </>
          )}

          {pagoId && (
            <Link
              href={`/payments/pagos/${pagoId}`}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Ver detalle del pago →
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto mt-10 h-7 w-7" />}>
      <ExitoContent />
    </Suspense>
  );
}
