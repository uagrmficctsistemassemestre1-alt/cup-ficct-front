"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { ReportView } from "@/components/reports/ReportView";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { useReporte } from "@/hooks/useReporte";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { carrerasService } from "@/services/academic/carreras.service";
import { REPORT_VIEW } from "@/lib/reports";
import {
  ESTADOS_POSTULACION,
  TURNOS_PREFERENCIA,
  type Convocatoria,
} from "@/lib/applicant";
import type { Carrera } from "@/lib/academic";

function Content() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [convId, setConvId] = useState("");
  const [estado, setEstado] = useState("");
  const [carrera, setCarrera] = useState("");
  const [turno, setTurno] = useState("");
  const [nombre, setNombre] = useState("");

  const path = convId ? `/convocatorias/${convId}/postulantes` : "";
  const { data, loading, error, run, exportar } = useReporte(path);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
    carrerasService.list().then(setCarreras).catch(() => setCarreras([]));
  }, []);

  function params() {
    return { estado, carrera, turno_preferencia: turno, nombre };
  }

  return (
    <div>
      <PageHeader
        title="Postulantes por convocatoria"
        description="Postulantes de una convocatoria, con sus filtros."
      />

      <Card className="mb-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Convocatoria">
            <SelectInput value={convId} onChange={(e) => setConvId(e.target.value)}>
              <option value="">Seleccioná…</option>
              {convocatorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.gestion})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Estado">
            <SelectInput value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS_POSTULACION.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Turno preferencia">
            <SelectInput value={turno} onChange={(e) => setTurno(e.target.value)}>
              <option value="">Todos</option>
              {TURNOS_PREFERENCIA.map((t) => (
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
            <Button onClick={() => run(params())} loading={loading} disabled={!convId}>
              Generar reporte
            </Button>
          </div>
        </div>
      </Card>

      <div className="mb-3 flex justify-end">
        <ExportButtons
          disabled={!data}
          onExport={(format) => exportar(params(), format, "postulantes")}
        />
      </div>

      <ReportView data={data} loading={loading} error={error} />
    </div>
  );
}

export default function PostulantesReportPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
