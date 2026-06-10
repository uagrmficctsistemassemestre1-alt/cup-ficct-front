"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/api";
import { horariosService } from "@/services/academic/horarios.service";
import { modulosService, aulasService } from "@/services/academic/modulos.service";
import {
  ACADEMIC_PERMISSION,
  DIAS_SEMANA,
  type Aula,
  type DiaSemana,
  type Horario,
  type Modulo,
} from "@/lib/academic";

interface Form {
  dia: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  aula_modulo_numero: string;
  aula_numero: string;
}

const EMPTY: Form = {
  dia: "LUNES",
  hora_inicio: "",
  hora_fin: "",
  aula_modulo_numero: "",
  aula_numero: "",
};

// Selector de aula dependiente del módulo elegido.
function AulaSelect({
  modulo,
  value,
  onChange,
  invalid,
}: {
  modulo: string;
  value: string;
  onChange: (numero: string) => void;
  invalid: boolean;
}) {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modulo) {
      setAulas([]);
      return;
    }
    setLoading(true);
    setError(null);
    aulasService
      .list(modulo)
      .then(setAulas)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [modulo]);

  if (!modulo) {
    return (
      <SelectInput value="" disabled>
        <option value="">Elegí un módulo primero…</option>
      </SelectInput>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
        <Spinner className="h-4 w-4" /> Cargando aulas…
      </div>
    );
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <SelectInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      invalid={invalid}
      required
    >
      <option value="">Seleccioná un aula…</option>
      {aulas.map((a) => (
        <option key={a.numero} value={String(a.numero)}>
          {a.numero} — {a.nombre} ({a.tipo}, cap. {a.capacidad})
        </option>
      ))}
    </SelectInput>
  );
}

function HorariosContent({ grupo, sigla }: { grupo: string; sigla: string }) {
  const [modulos, setModulos] = useState<Modulo[]>([]);

  useEffect(() => {
    modulosService.list().then(setModulos).catch(() => setModulos([]));
  }, []);

  return (
    <div>
      <Link
        href={`/academic/grupos/${grupo}`}
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        ← Volver a materias del grupo
      </Link>

      <EntityManager<Horario, Form>
        title={`Horarios · ${sigla}`}
        description="Horarios del grupo-materia. El sistema valida solapamientos de aula, grupo y docente."
        createLabel="Nuevo horario"
        rowKey={(h) => h.numero}
        columns={[
          { header: "Día", render: (h) => h.dia },
          { header: "Inicio", render: (h) => h.hora_inicio },
          { header: "Fin", render: (h) => h.hora_fin },
          {
            header: "Aula",
            render: (h) => `Mód. ${h.aula.modulo_numero} · Aula ${h.aula.numero}`,
          },
        ]}
        fetchAll={() => horariosService.list(grupo, sigla)}
        emptyForm={EMPTY}
        toForm={(h) => ({
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          aula_modulo_numero: h.aula.modulo_numero,
          aula_numero: String(h.aula.numero),
        })}
        create={(f) =>
          horariosService.create(grupo, sigla, {
            dia: f.dia,
            hora_inicio: f.hora_inicio,
            hora_fin: f.hora_fin,
            aula_modulo_numero: f.aula_modulo_numero,
            aula_numero: Number(f.aula_numero),
          })
        }
        update={(row, f) =>
          horariosService.update(grupo, sigla, row.numero, {
            dia: f.dia,
            hora_inicio: f.hora_inicio,
            hora_fin: f.hora_fin,
            aula_modulo_numero: f.aula_modulo_numero,
            aula_numero: Number(f.aula_numero),
          })
        }
        remove={(row) => horariosService.remove(grupo, sigla, row.numero)}
        describe={(h) => `${h.dia} ${h.hora_inicio}-${h.hora_fin}`}
        renderForm={({ values, set, fieldError }) => (
          <>
            <Field label="Día" error={fieldError("dia")}>
              <SelectInput
                value={values.dia}
                onChange={(e) => set("dia", e.target.value as DiaSemana)}
                invalid={Boolean(fieldError("dia"))}
              >
                {DIAS_SEMANA.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Hora inicio" error={fieldError("hora_inicio")}>
              <TextInput
                type="time"
                value={values.hora_inicio}
                onChange={(e) => set("hora_inicio", e.target.value)}
                invalid={Boolean(fieldError("hora_inicio"))}
                required
              />
            </Field>
            <Field label="Hora fin" error={fieldError("hora_fin")}>
              <TextInput
                type="time"
                value={values.hora_fin}
                onChange={(e) => set("hora_fin", e.target.value)}
                invalid={Boolean(fieldError("hora_fin"))}
                required
              />
            </Field>
            <Field label="Módulo" error={fieldError("aula_modulo_numero")}>
              <SelectInput
                value={values.aula_modulo_numero}
                onChange={(e) => {
                  set("aula_modulo_numero", e.target.value);
                  set("aula_numero", "");
                }}
                invalid={Boolean(fieldError("aula_modulo_numero"))}
                required
              >
                <option value="">Seleccioná un módulo…</option>
                {modulos.map((m) => (
                  <option key={m.numero} value={m.numero}>
                    {m.numero} — {m.nombre}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Aula" error={fieldError("aula_numero")}>
              <AulaSelect
                modulo={values.aula_modulo_numero}
                value={values.aula_numero}
                onChange={(n) => set("aula_numero", n)}
                invalid={Boolean(fieldError("aula_numero"))}
              />
            </Field>
          </>
        )}
      />
    </div>
  );
}

export default function HorariosPage() {
  const params = useParams<{ id: string; sigla: string }>();

  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <HorariosContent grupo={params.id} sigla={params.sigla} />
    </RequirePermission>
  );
}
