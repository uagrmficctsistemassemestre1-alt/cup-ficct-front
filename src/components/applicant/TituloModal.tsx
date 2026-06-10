"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FilePreview } from "@/components/ui/FilePreview";
import { getErrorMessage } from "@/lib/api";
import { postulantesService } from "@/services/applicant/postulantes.service";
import type { Postulante } from "@/lib/applicant";

export function TituloModal({
  postulante,
  onClose,
  onDone,
}: {
  postulante: Postulante;
  onClose: () => void;
  onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTitulo, setHasTitulo] = useState(
    Boolean(postulante.titulo_bachiller_path),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Seleccioná un archivo (pdf/jpg/jpeg/png).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await postulantesService.uploadTitulo(postulante.documento, file);
      setHasTitulo(Boolean(updated.titulo_bachiller_path));
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onDone();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Título de bachiller · ${postulante.nombres} ${postulante.apellidos}`}
    >
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
          <span className="text-slate-600">
            {hasTitulo ? "Tiene título cargado." : "Sin título cargado."}
          </span>
          {hasTitulo && (
            <Button variant="secondary" onClick={() => setPreview(true)}>
              Ver
            </Button>
          )}
        </div>

        <form onSubmit={upload} className="flex flex-col gap-3" noValidate>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
          />
          <p className="text-xs text-slate-500">pdf/jpg/jpeg/png, máx. 5 MB.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            <Button type="submit" loading={busy} disabled={!file}>
              {hasTitulo ? "Reemplazar" : "Subir"}
            </Button>
          </div>
        </form>
      </div>

      {preview && (
        <FilePreview
          title={`Título · ${postulante.nombres} ${postulante.apellidos}`}
          proxyPath={`/api/titulo/${postulante.documento}`}
          downloadName={`titulo-${postulante.documento}`}
          onClose={() => setPreview(false)}
        />
      )}
    </Modal>
  );
}
