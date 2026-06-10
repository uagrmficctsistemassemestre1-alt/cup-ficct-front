"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useCan } from "@/hooks/useAuth";
import { getErrorMessage, isForbidden } from "@/lib/api";
import { REPORT_EXPORT, type ExportFormat } from "@/lib/reports";

// Botones Excel/PDF: solo visibles con report.export; descargan el blob.
export function ExportButtons({
  onExport,
  disabled = false,
}: {
  onExport: (format: ExportFormat) => Promise<void>;
  disabled?: boolean;
}) {
  const canExport = useCan(REPORT_EXPORT);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!canExport) return null;

  async function run(format: ExportFormat) {
    setBusy(format);
    setError(null);
    try {
      await onExport(format);
    } catch (e) {
      setError(
        isForbidden(e)
          ? "No tenés permiso para exportar (report.export)."
          : getErrorMessage(e),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          loading={busy === "excel"}
          disabled={disabled || busy !== null}
          onClick={() => run("excel")}
        >
          Exportar Excel
        </Button>
        <Button
          variant="secondary"
          loading={busy === "pdf"}
          disabled={disabled || busy !== null}
          onClick={() => run("pdf")}
        >
          Exportar PDF
        </Button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
