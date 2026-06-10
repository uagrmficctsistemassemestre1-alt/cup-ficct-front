"use client";

import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { ProcesosModal } from "@/components/applicant/ProcesosModal";
import { useCan } from "@/hooks/useAuth";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import {
  APPLICANT_ASSIGN,
  APPLICANT_MANAGE,
  ESTADOS_CONVOCATORIA,
  type Convocatoria,
  type EstadoConvocatoria,
} from "@/lib/applicant";

interface Form {
  nombre: string;
  gestion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoConvocatoria;
}

const EMPTY: Form = {
  nombre: "",
  gestion: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "ABIERTA",
};

function ConvocatoriasContent() {
  const canAssign = useCan(APPLICANT_ASSIGN);
  const [procesos, setProcesos] = useState<Convocatoria | null>(null);

  return (
    <>
      <EntityManager<Convocatoria, Form>
        title="Convocatorias"
        description="Convocatorias de admisión (estado, fechas y cupos por carrera)."
        createLabel="Nueva convocatoria"
        rowKey={(c) => c.id}
        columns={[
          { header: "Nombre", render: (c) => c.nombre },
          { header: "Gestión", render: (c) => c.gestion },
          { header: "Inicio", render: (c) => c.fecha_inicio },
          { header: "Fin", render: (c) => c.fecha_fin },
          {
            header: "Estado",
            render: (c) => (
              <Badge tone={c.estado === "ABIERTA" ? "success" : "neutral"}>
                {c.estado}
              </Badge>
            ),
          },
        ]}
        fetchAll={convocatoriasService.list}
        emptyForm={EMPTY}
        toForm={(c) => ({
          nombre: c.nombre,
          gestion: c.gestion,
          fecha_inicio: c.fecha_inicio,
          fecha_fin: c.fecha_fin,
          estado: c.estado,
        })}
        create={(f) => convocatoriasService.create(f)}
        update={(row, f) => convocatoriasService.update(row.id, f)}
        remove={(row) => convocatoriasService.remove(row.id)}
        describe={(c) => `${c.nombre} (${c.gestion})`}
        rowActions={(c) => (
          <>
            <Link
              href={`/applicant/convocatorias/${c.id}/cupos`}
              className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Cupos
            </Link>
            {canAssign && (
              <Button variant="secondary" onClick={() => setProcesos(c)}>
                Procesos
              </Button>
            )}
          </>
        )}
        renderForm={({ values, set, fieldError }) => (
          <>
            <Field label="Nombre" error={fieldError("nombre")}>
              <TextInput
                value={values.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                invalid={Boolean(fieldError("nombre"))}
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
            <Field label="Fecha inicio" error={fieldError("fecha_inicio")}>
              <TextInput
                type="date"
                value={values.fecha_inicio}
                onChange={(e) => set("fecha_inicio", e.target.value)}
                invalid={Boolean(fieldError("fecha_inicio"))}
                required
              />
            </Field>
            <Field label="Fecha fin" error={fieldError("fecha_fin")}>
              <TextInput
                type="date"
                value={values.fecha_fin}
                onChange={(e) => set("fecha_fin", e.target.value)}
                invalid={Boolean(fieldError("fecha_fin"))}
                required
              />
            </Field>
            <Field label="Estado" error={fieldError("estado")}>
              <SelectInput
                value={values.estado}
                onChange={(e) => set("estado", e.target.value as EstadoConvocatoria)}
                invalid={Boolean(fieldError("estado"))}
              >
                {ESTADOS_CONVOCATORIA.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </>
        )}
      />

      {procesos && (
        <ProcesosModal convocatoria={procesos} onClose={() => setProcesos(null)} />
      )}
    </>
  );
}

export default function ConvocatoriasPage() {
  return (
    <RequirePermission permission={APPLICANT_MANAGE}>
      <ConvocatoriasContent />
    </RequirePermission>
  );
}
