import type { ReactNode } from "react";

// Tarjeta centrada para las pantallas de autenticación públicas.
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-base font-bold text-white">
            C
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          {children}
        </div>
      </div>
    </main>
  );
}
