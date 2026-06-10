"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { aulasService } from "@/services/academic/modulos.service";
import { ACADEMIC_PERMISSION, AULA_TIPOS, type Aula } from "@/lib/academic";

interface Form {
  numero: string;
  nombre: string;
  capacidad: string;
  piso: string;
  tipo: Aula["tipo"];
}

const EMPTY: Form = { numero: "", nombre: "", capacidad: "", piso: "", tipo: "COMUN" };

function AulasContent({ modulo }: { modulo: string }) {
  return (
    <div>
      <Link
        href="/academic/modulos"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Volver a módulos
      </Link>
      <EntityManager<Aula, Form>
        title={`Aulas · Módulo ${modulo}`}
        description="Aulas del módulo."
        createLabel="Nueva aula"
        rowKey={(a) => a.numero}
        columns={[
          { header: "Número", render: (a) => a.numero },
          { header: "Nombre", render: (a) => a.nombre },
          { header: "Capacidad", render: (a) => a.capacidad },
          { header: "Piso", render: (a) => a.piso },
          { header: "Tipo", render: (a) => a.tipo },
        ]}
        fetchAll={() => aulasService.list(modulo)}
        emptyForm={EMPTY}
        toForm={(a) => ({
          numero: String(a.numero),
          nombre: a.nombre,
          capacidad: String(a.capacidad),
          piso: String(a.piso),
          tipo: a.tipo,
        })}
        create={(f) =>
          aulasService.create(modulo, {
            numero: Number(f.numero),
            nombre: f.nombre,
            capacidad: Number(f.capacidad),
            piso: Number(f.piso),
            tipo: f.tipo,
          })
        }
        update={(row, f) =>
          aulasService.update(modulo, row.numero, {
            nombre: f.nombre,
            capacidad: Number(f.capacidad),
            piso: Number(f.piso),
            tipo: f.tipo,
          })
        }
        remove={(row) => aulasService.remove(modulo, row.numero)}
        describe={(a) => `Aula ${a.numero} — ${a.nombre}`}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Número" error={fieldError("numero")}>
              <TextInput
                type="number"
                min="1"
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
            <Field label="Capacidad" error={fieldError("capacidad")}>
              <TextInput
                type="number"
                min="1"
                value={values.capacidad}
                onChange={(e) => set("capacidad", e.target.value)}
                invalid={Boolean(fieldError("capacidad"))}
                required
              />
            </Field>
            <Field label="Piso" error={fieldError("piso")}>
              <TextInput
                type="number"
                min="0"
                value={values.piso}
                onChange={(e) => set("piso", e.target.value)}
                invalid={Boolean(fieldError("piso"))}
                required
              />
            </Field>
            <Field label="Tipo" error={fieldError("tipo")}>
              <SelectInput
                value={values.tipo}
                onChange={(e) => set("tipo", e.target.value as Aula["tipo"])}
                invalid={Boolean(fieldError("tipo"))}
              >
                {AULA_TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </>
        )}
      />
    </div>
  );
}

export default function AulasPage() {
  const params = useParams<{ numero: string }>();
  const modulo = params.numero;

  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <AulasContent modulo={modulo} />
    </RequirePermission>
  );
}
