"use client";

import { useEffect, useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput } from "@/components/ui/Field";
import { ReportView } from "@/components/reports/ReportView";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { useReporte } from "@/hooks/useReporte";
import { convocatoriasService } from "@/services/applicant/convocatorias.service";
import { carrerasService } from "@/services/academic/carreras.service";
import { REPORT_VIEW } from "@/lib/reports";
import type { Convocatoria } from "@/lib/applicant";
import type { Carrera } from "@/lib/academic";

function Content() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [convId, setConvId] = useState("");
  const [carrera, setCarrera] = useState("");

  const path = convId ? `/convocatorias/${convId}/admitidos` : "";
  const { data, loading, error, run, exportar } = useReporte(path);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
    carrerasService.list().then(setCarreras).catch(() => setCarreras([]));
  }, []);

  function params() {
    return { carrera };
  }

  return (
    <div>
      <PageHeader
        title="Admitidos"
        description="Estudiantes aprobados que recibieron cupo (carrera asignada) en una convocatoria."
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
          onExport={(format) => exportar(params(), format, "admitidos")}
        />
      </div>

      <ReportView data={data} loading={loading} error={error} />
    </div>
  );
}

export default function AdmitidosPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
