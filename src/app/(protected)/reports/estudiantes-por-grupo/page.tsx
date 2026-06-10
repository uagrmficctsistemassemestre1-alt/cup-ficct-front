"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { PageHeader } from "@/components/ui/Card";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { ReportView } from "@/components/reports/ReportView";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { useReporte } from "@/hooks/useReporte";
import { gruposService } from "@/services/academic/grupos.service";
import { carrerasService } from "@/services/academic/carreras.service";
import { REPORT_VIEW } from "@/lib/reports";
import { TURNOS, type Grupo, type Carrera } from "@/lib/academic";

const PATH = "/estudiantes-por-grupo";

function Content() {
  const { data, loading, error, run, exportar } = useReporte(PATH);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  const [gestion, setGestion] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [turno, setTurno] = useState("");
  const [carrera, setCarrera] = useState("");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    gruposService.list().then(setGrupos).catch(() => setGrupos([]));
    carrerasService.list().then(setCarreras).catch(() => setCarreras([]));
  }, []);

  function params() {
    return { gestion, grupo_id: grupoId, turno, carrera, nombre };
  }

  return (
    <div>
      <PageHeader
        title="Estudiantes por grupo"
        description="Estudiantes asignados por grupo en una gestión. La gestión es obligatoria."
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Gestión (requerida)">
            <TextInput
              value={gestion}
              onChange={(e) => setGestion(e.target.value)}
              placeholder="2026"
            />
          </Field>
          <Field label="Grupo">
            <SelectInput value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
              <option value="">Todos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.codigo} · {g.turno} · {g.gestion}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Turno">
            <SelectInput value={turno} onChange={(e) => setTurno(e.target.value)}>
              <option value="">Todos</option>
              {TURNOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Carrera">
            <SelectInput value={carrera} onChange={(e) => setCarrera(e.target.value)}>
              <option value="">Todas</option>
              {carreras.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} — {c.nombre}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Nombre">
            <TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button onClick={() => run(params())} loading={loading}>
              Generar reporte
            </Button>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex justify-end">
        <ExportButtons
          disabled={!data}
          onExport={(format) => exportar(params(), format, "estudiantes-por-grupo")}
        />
      </div>

      <ReportView data={data} loading={loading} error={error} />
    </div>
  );
}

export default function EstudiantesPorGrupoPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
