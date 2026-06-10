"use client";

import Link from "next/link";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { gruposService } from "@/services/academic/grupos.service";
import { ACADEMIC_PERMISSION, TURNOS, type Grupo, type Turno } from "@/lib/academic";

interface Form {
  codigo: string;
  turno: Turno;
  capacidad: string;
  gestion: string;
}

const EMPTY: Form = { codigo: "", turno: "MANANA", capacidad: "", gestion: "" };

export default function GruposPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Grupo, Form>
        title="Grupos"
        description="Grupos (código + gestión únicos)."
        createLabel="Nuevo grupo"
        rowKey={(g) => g.id}
        columns={[
          { header: "Código", render: (g) => g.codigo },
          { header: "Turno", render: (g) => g.turno },
          { header: "Capacidad", render: (g) => g.capacidad },
          { header: "Gestión", render: (g) => g.gestion },
        ]}
        fetchAll={gruposService.list}
        emptyForm={EMPTY}
        toForm={(g) => ({
          codigo: g.codigo,
          turno: g.turno,
          capacidad: String(g.capacidad),
          gestion: g.gestion,
        })}
        create={(f) =>
          gruposService.create({
            codigo: f.codigo,
            turno: f.turno,
            capacidad: Number(f.capacidad),
            gestion: f.gestion,
          })
        }
        update={(row, f) =>
          gruposService.update(row.id, {
            codigo: f.codigo,
            turno: f.turno,
            capacidad: Number(f.capacidad),
            gestion: f.gestion,
          })
        }
        remove={(row) => gruposService.remove(row.id)}
        describe={(g) => `${g.codigo} (${g.gestion})`}
        rowActions={(g) => (
          <Link
            href={`/academic/grupos/${g.id}`}
            className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            Materias
          </Link>
        )}
        renderForm={({ values, set, fieldError }) => (
          <>
            <Field label="Código" error={fieldError("codigo")}>
              <TextInput
                value={values.codigo}
                onChange={(e) => set("codigo", e.target.value)}
                invalid={Boolean(fieldError("codigo"))}
                required
              />
            </Field>
            <Field label="Turno" error={fieldError("turno")}>
              <SelectInput
                value={values.turno}
                onChange={(e) => set("turno", e.target.value as Turno)}
                invalid={Boolean(fieldError("turno"))}
              >
                {TURNOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Capacidad (1 a 70)" error={fieldError("capacidad")}>
              <TextInput
                type="number"
                min="1"
                max="70"
                value={values.capacidad}
                onChange={(e) => set("capacidad", e.target.value)}
                invalid={Boolean(fieldError("capacidad"))}
                required
              />
            </Field>
            <Field label="Gestión" error={fieldError("gestion")}>
              <TextInput
                value={values.gestion}
                onChange={(e) => set("gestion", e.target.value)}
                invalid={Boolean(fieldError("gestion"))}
                placeholder="2026"
                required
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
