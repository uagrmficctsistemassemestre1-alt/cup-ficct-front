"use client";

import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { periodosService } from "@/services/academic/periodos.service";
import { ACADEMIC_PERMISSION, type Periodo } from "@/lib/academic";

interface Form {
  codigo: string;
  gestion: string;
  fecha_inicio_clases: string;
  fecha_fin_clases: string;
}

const EMPTY: Form = {
  codigo: "",
  gestion: "",
  fecha_inicio_clases: "",
  fecha_fin_clases: "",
};

export default function PeriodosPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Periodo, Form>
        title="Periodos"
        description="Periodos académicos y fechas de clases."
        createLabel="Nuevo periodo"
        rowKey={(p) => p.id}
        columns={[
          { header: "Código", render: (p) => p.codigo },
          { header: "Gestión", render: (p) => p.gestion },
          { header: "Inicio clases", render: (p) => p.fecha_inicio_clases },
          { header: "Fin clases", render: (p) => p.fecha_fin_clases },
        ]}
        fetchAll={periodosService.list}
        emptyForm={EMPTY}
        toForm={(p) => ({
          codigo: p.codigo,
          gestion: p.gestion,
          fecha_inicio_clases: p.fecha_inicio_clases,
          fecha_fin_clases: p.fecha_fin_clases,
        })}
        create={(f) => periodosService.create(f)}
        update={(row, f) => periodosService.update(row.id, f)}
        remove={(row) => periodosService.remove(row.id)}
        describe={(p) => p.codigo}
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
            <Field label="Gestión" error={fieldError("gestion")}>
              <TextInput
                value={values.gestion}
                onChange={(e) => set("gestion", e.target.value)}
                invalid={Boolean(fieldError("gestion"))}
                placeholder="2026"
                required
              />
            </Field>
            <Field label="Inicio de clases" error={fieldError("fecha_inicio_clases")}>
              <TextInput
                type="date"
                value={values.fecha_inicio_clases}
                onChange={(e) => set("fecha_inicio_clases", e.target.value)}
                invalid={Boolean(fieldError("fecha_inicio_clases"))}
                required
              />
            </Field>
            <Field label="Fin de clases" error={fieldError("fecha_fin_clases")}>
              <TextInput
                type="date"
                value={values.fecha_fin_clases}
                onChange={(e) => set("fecha_fin_clases", e.target.value)}
                invalid={Boolean(fieldError("fecha_fin_clases"))}
                required
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
