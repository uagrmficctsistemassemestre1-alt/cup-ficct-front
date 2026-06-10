"use client";

import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { materiasService } from "@/services/academic/materias.service";
import { ACADEMIC_PERMISSION, type Materia } from "@/lib/academic";

interface Form {
  sigla: string;
  nombre: string;
  peso: string;
}

const EMPTY: Form = { sigla: "", nombre: "", peso: "" };

// 0–1 ↔ porcentaje legible (0.25 ↔ 25%).
const toPct = (v: number) => `${+(v * 100).toFixed(2)}%`;

export default function MateriasPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Materia, Form>
        title="Materias"
        createLabel="Nueva materia"
        rowKey={(m) => m.sigla}
        columns={[
          { header: "Sigla", render: (m) => m.sigla },
          { header: "Nombre", render: (m) => m.nombre },
          { header: "Peso", render: (m) => toPct(m.peso) },
        ]}
        fetchAll={materiasService.list}
        emptyForm={EMPTY}
        toForm={(m) => ({ sigla: m.sigla, nombre: m.nombre, peso: String(+(m.peso * 100).toFixed(2)) })}
        create={(f) =>
          materiasService.create({
            sigla: f.sigla,
            nombre: f.nombre,
            peso: Number(f.peso) / 100,
          })
        }
        update={(row, f) =>
          materiasService.update(row.sigla, { nombre: f.nombre, peso: Number(f.peso) / 100 })
        }
        remove={(row) => materiasService.remove(row.sigla)}
        describe={(m) => `${m.sigla} — ${m.nombre}`}
        summary={(rows) => {
          const total = rows.reduce((acc, m) => acc + m.peso, 0);
          const ok = Math.abs(total - 1) < 0.001;
          return (
            <span className={ok ? "text-emerald-700" : "text-amber-700"}>
              Suma de pesos: <strong>{toPct(total)}</strong>
              {ok ? " ✓" : " (debería ser 100%)"}
            </span>
          );
        }}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Sigla" error={fieldError("sigla")}>
              <TextInput
                value={values.sigla}
                onChange={(e) => set("sigla", e.target.value)}
                invalid={Boolean(fieldError("sigla"))}
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
            <Field label="Peso (%)" error={fieldError("peso")}>
              <TextInput
                type="number"
                step="1"
                min="0"
                max="100"
                value={values.peso}
                onChange={(e) => set("peso", e.target.value)}
                invalid={Boolean(fieldError("peso"))}
                required
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
