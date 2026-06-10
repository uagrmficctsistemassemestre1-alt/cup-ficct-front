"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  href: string;
  label: string;
  // Permiso requerido para ver el item (null = visible siempre).
  permission: string | null;
  // Rol requerido (además del permiso). Si se define, debe coincidir.
  role?: string;
}

interface NavSection {
  // Título de sección (null = sin encabezado).
  title: string | null;
  items: NavItem[];
}

const ACADEMIC_PERMISSION = "academic.manage";
const APPLICANT_PERMISSION = "applicant.manage";
const APPLICANT_VERIFY_PERMISSION = "applicant.verify";
const GRADE_PERMISSION = "grade.manage";
const ATTENDANCE_PERMISSION = "attendance.manage";
const PAYMENT_PERMISSION = "payment.manage";
const REPORT_PERMISSION = "report.view";

const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      { href: "/dashboard", label: "Inicio", permission: null },
      { href: "/perfil", label: "Mi perfil", permission: null },
      { href: "/mi-postulacion", label: "Mi postulación", permission: null, role: "POSTULANTE" },
      { href: "/mi-rendimiento", label: "Mi rendimiento", permission: null, role: "POSTULANTE" },
      { href: "/usuarios", label: "Usuarios", permission: "user.manage" },
      { href: "/roles", label: "Roles", permission: "role.manage" },
    ],
  },
  {
    title: "Gestión académica",
    items: [
      { href: "/academic/facultades", label: "Facultades", permission: ACADEMIC_PERMISSION },
      { href: "/academic/carreras", label: "Carreras", permission: ACADEMIC_PERMISSION },
      { href: "/academic/materias", label: "Materias", permission: ACADEMIC_PERMISSION },
      { href: "/academic/modulos", label: "Módulos y aulas", permission: ACADEMIC_PERMISSION },
      { href: "/academic/periodos", label: "Periodos", permission: ACADEMIC_PERMISSION },
      { href: "/academic/docentes", label: "Docentes", permission: ACADEMIC_PERMISSION },
      { href: "/academic/grupos", label: "Grupos", permission: ACADEMIC_PERMISSION },
    ],
  },
  {
    title: "Admisión",
    items: [
      { href: "/applicant/postulantes", label: "Postulantes", permission: APPLICANT_PERMISSION },
      { href: "/applicant/convocatorias", label: "Convocatorias", permission: APPLICANT_PERMISSION },
      { href: "/applicant/verificacion", label: "Verificación", permission: APPLICANT_VERIFY_PERMISSION },
    ],
  },
  {
    title: "Evaluación",
    items: [
      { href: "/evaluation/notas", label: "Planilla de notas", permission: GRADE_PERMISSION },
      { href: "/evaluation/boletin", label: "Boletín", permission: GRADE_PERMISSION },
      { href: "/evaluation/asistencia", label: "Planilla de asistencia", permission: ATTENDANCE_PERMISSION },
      { href: "/evaluation/reporte-asistencia", label: "Reporte de asistencia", permission: ATTENDANCE_PERMISSION },
    ],
  },
  {
    title: "Pagos",
    items: [
      { href: "/payments/pagos", label: "Gestión de pagos", permission: PAYMENT_PERMISSION },
    ],
  },
  {
    title: "Reportes",
    items: [
      { href: "/reports/estudiantes-por-grupo", label: "Estudiantes por grupo", permission: REPORT_PERMISSION },
      { href: "/reports/postulantes", label: "Postulantes", permission: REPORT_PERMISSION },
      { href: "/reports/recaudacion", label: "Recaudación", permission: REPORT_PERMISSION },
      { href: "/reports/resultados", label: "Resultados", permission: REPORT_PERMISSION },
      { href: "/reports/asignacion-carreras", label: "Asignación de carreras", permission: REPORT_PERMISSION },
      { href: "/reports/admitidos", label: "Admitidos", permission: REPORT_PERMISSION },
    ],
  },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, can, logout } = useAuth();

  // Menú filtrado según permisos (RBAC) y rol; secciones sin ítems visibles se ocultan.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        (item.permission === null || can(item.permission)) &&
        (!item.role || user?.role === item.role),
    ),
  })).filter((section) => section.items.length > 0);

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200/80 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          C
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">CUP-FICCT</p>
          {user?.role && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {user.role}
            </p>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {sections.map((section, i) => (
          <div key={section.title ?? `section-${i}`} className="space-y-0.5">
            {section.title && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 px-4 py-4">
        <p className="truncate text-sm font-medium text-slate-700" title={user?.email}>
          {user?.username ?? user?.email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1.5 text-xs font-medium text-slate-400 transition hover:text-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
