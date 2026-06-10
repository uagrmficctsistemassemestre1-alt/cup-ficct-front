import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_0_rgb(0_0_0/0.03)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  // Aceptada por compatibilidad pero ya no se muestra (UI más limpia).
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
