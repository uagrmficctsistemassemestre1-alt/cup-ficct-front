"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullScreenLoader } from "@/components/ui/Spinner";

// Entrada pública: landing de admisión. Si hay sesión, enruta a la app.
export default function HomePage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    router.replace(user?.must_change_password ? "/change-password" : "/dashboard");
  }, [initialized, isAuthenticated, user, router]);

  if (!initialized || isAuthenticated) return <FullScreenLoader />;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <span className="text-lg font-bold text-slate-900">CUP-FICCT</span>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          Iniciar sesión
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Admisión · FICCT
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Postulate a la Facultad
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
            Creá tu cuenta con tus datos personales, subí tu documentación y seguí el
            estado de tu postulación. Una vez verificada, generamos tu cobro y podés pagar
            en línea.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Postularme ahora
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl gap-6 text-left sm:grid-cols-3">
            {[
              { t: "1. Registrate", d: "Creá tu cuenta con tus datos básicos." },
              { t: "2. Verificación", d: "El equipo revisa tu documentación." },
              { t: "3. Pago", d: "Aprobado, pagás tu inscripción en línea." },
            ].map((s) => (
              <div key={s.t} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{s.t}</p>
                <p className="mt-1 text-sm text-slate-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        CUP-FICCT · Sistema de admisión
      </footer>
    </div>
  );
}
