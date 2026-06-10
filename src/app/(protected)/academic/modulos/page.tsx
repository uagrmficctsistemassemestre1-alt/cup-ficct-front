"use client";

import Link from "next/link";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { modulosService } from "@/services/academic/modulos.service";
import { ACADEMIC_PERMISSION, type Modulo } from "@/lib/academic";

interface Form {
  numero: string;
  nombre: string;
  ubicacion: string;
}

const EMPTY: Form = { numero: "", nombre: "", ubicacion: "" };

export default function ModulosPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Modulo, Form>
        title="Módulos"
        description="Edificios/módulos y sus aulas."
        createLabel="Nuevo módulo"
        rowKey={(m) => m.numero}
        columns={[
          { header: "Número", render: (m) => m.numero },
          { header: "Nombre", render: (m) => m.nombre },
          { header: "Ubicación", render: (m) => m.ubicacion ?? "—" },
        ]}
        fetchAll={modulosService.list}
        emptyForm={EMPTY}
        toForm={(m) => ({
          numero: m.numero,
          nombre: m.nombre,
          ubicacion: m.ubicacion ?? "",
        })}
        create={(f) =>
          modulosService.create({
            numero: f.numero,
            nombre: f.nombre,
            ubicacion: f.ubicacion || null,
          })
        }
        update={(row, f) =>
          modulosService.update(row.numero, {
            nombre: f.nombre,
            ubicacion: f.ubicacion || null,
          })
        }
        remove={(row) => modulosService.remove(row.numero)}
        describe={(m) => `${m.numero} — ${m.nombre}`}
        rowActions={(m) => (
          <Link
            href={`/academic/modulos/${m.numero}`}
            className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Aulas
          </Link>
        )}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Número" error={fieldError("numero")}>
              <TextInput
                value={values.numero}
                onChange={(e) => set("numero", e.target.value)}
                invalid={Boolean(fieldError("numero"))}
                disabled={editing}
                required
              />
            </Field>
            <Field label="Nombre" error={fieldError("nombre")}>
              <TextInput
                value={values.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                invalid={Boolean(fieldError("nombre"))}
                required
              />
            </Field>
            <Field label="Ubicación" error={fieldError("ubicacion")}>
              <TextInput
                value={values.ubicacion}
                onChange={(e) => set("ubicacion", e.target.value)}
                invalid={Boolean(fieldError("ubicacion"))}
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
