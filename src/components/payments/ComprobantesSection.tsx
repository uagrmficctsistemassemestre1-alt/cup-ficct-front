"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { FilePreview } from "@/components/ui/FilePreview";
import { getErrorMessage } from "@/lib/api";
import { comprobantesService } from "@/services/payments/comprobantes.service";
import type { Comprobante } from "@/lib/payments";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ComprobantesSection({
  pagoId,
  isStaff,
}: {
  pagoId: number;
  isStaff: boolean;
}) {
  const [items, setItems] = useState<Comprobante[]>([]);
  const [loading, setLoading] = useState(isStaff);
  const [listError, setListError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadOk, setUploadOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<Comprobante | null>(null);

  const load = useCallback(async () => {
    if (!isStaff) return;
    setLoading(true);
    setListError(null);
    try {
      setItems(await comprobantesService.list(pagoId));
    } catch (e) {
      setListError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [pagoId, isStaff]);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setUploadError("Seleccioná un archivo (pdf/jpg/jpeg/png).");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadOk(false);
    try {
      await comprobantesService.upload(pagoId, file);
      setUploadOk(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      await load();
    } catch (e) {
      setUploadError(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="mt-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Comprobantes</h2>

      <form onSubmit={upload} className="mb-4 flex flex-col gap-3">
        {uploadError && <Alert variant="error">{uploadError}</Alert>}
        {uploadOk && <Alert variant="success">Comprobante subido.</Alert>}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
        />
        <div>
          <Button type="submit" loading={uploading} disabled={!file}>
            Subir comprobante
          </Button>
        </div>
      </form>

      {isStaff && (
        <div className="border-t border-slate-200 pt-4">
          {listError && <Alert variant="error">{listError}</Alert>}
          {loading ? (
            <div className="flex justify-center p-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No hay comprobantes cargados.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {c.nombre_original}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.mime} · {formatSize(c.tamano)} · {c.created_at}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={() => setPreview(c)}>
                    Ver
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {preview && (
        <FilePreview
          title={preview.nombre_original}
          proxyPath={`/api/comprobante/${preview.id}`}
          downloadName={preview.nombre_original}
          onClose={() => setPreview(null)}
        />
      )}
    </Card>
  );
}
