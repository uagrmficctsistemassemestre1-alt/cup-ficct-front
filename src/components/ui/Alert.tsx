import type { ReactNode } from "react";

type Variant = "error" | "success" | "info";

const styles: Record<Variant, string> = {
  error: "bg-red-50 text-red-700 ring-red-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  info: "bg-slate-50 text-slate-700 ring-slate-200",
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-lg px-3.5 py-2.5 text-sm ring-1 ring-inset ${styles[variant]}`}>
      {children}
    </div>
  );
}
