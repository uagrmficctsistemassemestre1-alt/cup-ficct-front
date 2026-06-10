"use client";

import type { ReactNode } from "react";
import { useCan } from "@/hooks/useAuth";

// Muestra su contenido solo si el usuario tiene el permiso (RBAC para acciones/menús).
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = useCan(permission);
  return <>{allowed ? children : fallback}</>;
}
