"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { FullScreenLoader } from "@/components/ui/Spinner";

// Inicializa la sesión al montar: rehidrata token, valida con /me y arma el auto-refresh.
// Bloquea el render hasta terminar para evitar parpadeos y mismatches de hidratación.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!initialized) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
