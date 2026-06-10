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
import { REPORT_VIEW } from "@/lib/reports";
import { ESTADOS_PAGO, METODOS_PAGO } from "@/lib/payments";
import type { Convocatoria } from "@/lib/applicant";

function Content() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [convId, setConvId] = useState("");
  const [estado, setEstado] = useState("");
  const [metodo, setMetodo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const path = convId ? `/convocatorias/${convId}/recaudacion` : "";
  const { data, loading, error, run, exportar } = useReporte(path);

  useEffect(() => {
    convocatoriasService.list().then(setConvocatorias).catch(() => setConvocatorias([]));
  }, []);

  function params() {
    return { estado, metodo, desde, hasta };
  }

  return (
    <div>
      <PageHeader
        title="Recaudación"
        description="Recaudación de pagos de una convocatoria, por estado, método y fechas."
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
              {ESTADOS_PAGO.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Método">
            <SelectInput value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="">Todos</option>
              {METODOS_PAGO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Desde">
            <TextInput type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <TextInput type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
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
          onExport={(format) => exportar(params(), format, "recaudacion")}
        />
      </div>

      <ReportView data={data} loading={loading} error={error} />
    </div>
  );
}

export default function RecaudacionPage() {
  return (
    <RequirePermission permission={REPORT_VIEW}>
      <Content />
    </RequirePermission>
  );
}
