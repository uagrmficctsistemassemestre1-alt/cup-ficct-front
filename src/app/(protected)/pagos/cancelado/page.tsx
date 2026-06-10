"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

function CanceladoContent() {
  const params = useSearchParams();
  const pagoId = params.get("pago_id") ?? params.get("pago");

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Pago cancelado" description="No se completó el pago en la pasarela." />
      <Card className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-slate-600">
          Cancelaste el pago o no se completó. El pago sigue pendiente; podés intentarlo de
          nuevo.
        </p>
        {pagoId ? (
          <Link href={`/payments/pagos/${pagoId}`}>
            <Button>Volver al pago</Button>
          </Link>
        ) : (
          <Link href="/dashboard">
            <Button variant="secondary">Ir al inicio</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}

export default function PagoCanceladoPage() {
  return (
    <Suspense fallback={<Spinner className="mx-auto mt-10 h-7 w-7" />}>
      <CanceladoContent />
    </Suspense>
  );
}
