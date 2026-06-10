"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { AppNav } from "@/components/AppNav";
import { ReportChatWidget } from "@/components/reports/ReportChatWidget";
import { FullScreenLoader } from "@/components/ui/Spinner";

// Layout protegido: exige sesión, fuerza el cambio de contraseña y carga /me al montar.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuth();
  const refreshMe = useAuthStore((s) => s.refreshMe);

  // Guarda de acceso.
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.must_change_password) {
      router.replace("/change-password");
    }
  }, [initialized, isAuthenticated, user, router]);

  // Carga /me al montar para refrescar los datos de sesión.
  useEffect(() => {
    if (initialized && isAuthenticated) {
      void refreshMe().catch(() => undefined);
    }
  }, [initialized, isAuthenticated, refreshMe]);

  if (!initialized || !isAuthenticated || user?.must_change_password) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-screen">
      <AppNav />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
      <ReportChatWidget />
    </div>
  );
}
