"use client";

import type { ReactNode } from "react";
import { useCan } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";

// Guarda a nivel de página: bloquea la sección si falta el permiso (equivalente al 403).
export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const allowed = useCan(permission);

  if (!allowed) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h2 className="text-lg font-semibold text-slate-900">Acceso denegado</h2>
        <p className="mt-2 text-sm text-slate-500">
          No tenés permiso para acceder a esta sección.
        </p>
      </Card>
    );
  }

  return <>{children}</>;
}
