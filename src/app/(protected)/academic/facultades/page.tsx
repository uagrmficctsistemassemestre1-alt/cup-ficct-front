"use client";

import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { facultadesService } from "@/services/academic/facultades.service";
import { ACADEMIC_PERMISSION, type Facultad } from "@/lib/academic";

interface Form {
  codigo: string;
  nombre: string;
  abreviatura: string;
}

const EMPTY: Form = { codigo: "", nombre: "", abreviatura: "" };

export default function FacultadesPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <EntityManager<Facultad, Form>
        title="Facultades"
        description="Gestión de facultades."
        createLabel="Nueva facultad"
        rowKey={(f) => f.codigo}
        columns={[
          { header: "Código", render: (f) => f.codigo },
          { header: "Nombre", render: (f) => f.nombre },
          { header: "Abreviatura", render: (f) => f.abreviatura },
        ]}
        fetchAll={facultadesService.list}
        emptyForm={EMPTY}
        toForm={(f) => ({ codigo: f.codigo, nombre: f.nombre, abreviatura: f.abreviatura })}
        create={(f) => facultadesService.create(f)}
        update={(row, f) =>
          facultadesService.update(row.codigo, {
            nombre: f.nombre,
            abreviatura: f.abreviatura,
          })
        }
        remove={(row) => facultadesService.remove(row.codigo)}
        describe={(f) => f.nombre}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Código" error={fieldError("codigo")}>
              <TextInput
                value={values.codigo}
                onChange={(e) => set("codigo", e.target.value)}
                invalid={Boolean(fieldError("codigo"))}
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
            <Field label="Abreviatura" error={fieldError("abreviatura")}>
              <TextInput
                value={values.abreviatura}
                onChange={(e) => set("abreviatura", e.target.value)}
                invalid={Boolean(fieldError("abreviatura"))}
                required
              />
            </Field>
          </>
        )}
      />
    </RequirePermission>
  );
}
