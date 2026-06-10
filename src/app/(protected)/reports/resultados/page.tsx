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
import { gruposService } from "@/services/academic/grupos.service";
import { REPORT_VIEW } from "@/lib/reports";
import type { Convocatoria } from "@/lib/applicant";
import type { Grupo } from "@/lib/academic";

const ESTADOS_RESULTADO = ["APROBADO", "REPROBADO"] as const;

function Content() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [convId, setConvId] = useState("");
  const [estado, setEstado] = useState("");
  const [notaMin, setNotaMin] = useState("");
  const [notaMax, setNotaMax] = useState("");
  const [grupoId, setGrupoId] = useState("");

  const path = convId ? `/convocatorias/${convId}/resultados` : "";
  const { data, loading, error, run, exportar } = useReporte(path);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
    gruposService.list().then(setGrupos).catch(() => setGrupos([]));
  }, []);

  function params() {
    return { estado, nota_min: notaMin, nota_max: notaMax, grupo_id: grupoId };
  }

  return (
    <div>
      <PageHeader
        title="Resultados"
        description="Resultados de los postulantes de una convocatoria (promedio final y estado)."
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
              {ESTADOS_RESULTADO.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
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
          <Field label="Nota mínima">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={notaMin}
              onChange={(e) => setNotaMin(e.target.value)}
            />
          </Field>
          <Field label="Nota máxima">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={notaMax}
              onChange={(e) => setNotaMax(e.target.value)}
            />
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
          onExport={(format) => exportar(params(), format, "resultados")}
        />
      </div>

      <ReportView data={data} loading={loading} error={error} />
    </div>
  );
}

export default function ResultadosPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
