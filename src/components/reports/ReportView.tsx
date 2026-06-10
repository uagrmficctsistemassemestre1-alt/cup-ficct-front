import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { ReportTable } from "@/components/reports/ReportTable";
import type { Reporte } from "@/lib/reports";

// Render de un reporte: estado vacío / cargando / error / tabla.
export function ReportView({
  data,
  loading,
  error,
}: {
  data: Reporte | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <Card className="p-0">
      {error && (
        <div className="p-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-10">
          <Spinner className="h-7 w-7" />
        </div>
      ) : data ? (
        <>
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">{data.titulo}</p>
          </div>
          <ReportTable reporte={data} />
        </>
      ) : (
        <p className="p-6 text-center text-sm text-slate-500">
          Configurá los filtros y generá el reporte.
        </p>
      )}
    </Card>
  );
}
