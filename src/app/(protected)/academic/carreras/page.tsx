"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { carrerasService } from "@/services/academic/carreras.service";
import { facultadesService } from "@/services/academic/facultades.service";
import { ACADEMIC_PERMISSION, type Carrera, type Facultad } from "@/lib/academic";

interface Form {
  codigo: string;
  nombre: string;
  facultad_codigo: string;
}

const EMPTY: Form = { codigo: "", nombre: "", facultad_codigo: "" };

function CarrerasContent() {
  const [facultades, setFacultades] = useState<Facultad[]>([]);

  useEffect(() => {
    facultadesService
      .list()
      .then(setFacultades)
      .catch(() => undefined);
  }, []);

  return (
    <EntityManager<Carrera, Form>
      title="Carreras"
      description="El código de la carrera hereda el prefijo de su facultad."
      createLabel="Nueva carrera"
      rowKey={(c) => c.codigo}
      columns={[
        { header: "Código", render: (c) => c.codigo },
        { header: "Nombre", render: (c) => c.nombre },
        { header: "Facultad", render: (c) => c.facultad_codigo },
      ]}
      fetchAll={carrerasService.list}
      emptyForm={EMPTY}
      toForm={(c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        facultad_codigo: c.facultad_codigo,
      })}
      create={(f) => carrerasService.create(f)}
      update={(row, f) => carrerasService.update(row.codigo, { nombre: f.nombre })}
      remove={(row) => carrerasService.remove(row.codigo)}
      describe={(c) => c.nombre}
      renderForm={({ values, set, fieldError, editing }) => (
        <>
          <Field label="Facultad" error={fieldError("facultad_codigo")}>
            <SelectInput
              value={values.facultad_codigo}
              invalid={Boolean(fieldError("facultad_codigo"))}
              disabled={editing}
              onChange={(e) => {
                const fac = e.target.value;
                set("facultad_codigo", fac);
                // El código hereda el prefijo de la facultad (solo al crear).
                if (!editing) set("codigo", fac ? `${fac}-` : "");
              }}
              required
            >
              <option value="">Seleccioná una facultad…</option>
              {facultades.map((f) => (
                <option key={f.codigo} value={f.codigo}>
                  {f.codigo} — {f.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Código" error={fieldError("codigo")}>
            <TextInput
              value={values.codigo}
              onChange={(e) => set("codigo", e.target.value)}
              invalid={Boolean(fieldError("codigo"))}
              disabled={editing}
              placeholder="187-09"
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
        </>
      )}
    />
  );
}

export default function CarrerasPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <CarrerasContent />
    </RequirePermission>
  );
}
