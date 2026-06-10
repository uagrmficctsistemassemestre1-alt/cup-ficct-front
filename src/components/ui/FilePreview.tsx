"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { fetchBlobPreview, getErrorMessage } from "@/lib/api";

// Visor inline de archivos (imagen / PDF) servidos por el proxy same-origin.
export function FilePreview({
  title,
  proxyPath,
  downloadName,
  onClose,
}: {
  title: string;
  proxyPath: string;
  downloadName?: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;
    fetchBlobPreview(proxyPath)
      .then((res) => {
        if (!active) {
          URL.revokeObjectURL(res.url);
          return;
        }
        objectUrl = res.url;
        setUrl(res.url);
        setType(res.type);
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [proxyPath]);

  const isImage = type.startsWith("image/");
  const isPdf = type === "application/pdf";

  return (
    <Modal open onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : url ? (
          <div className="flex max-h-[70vh] justify-center overflow-auto rounded-md bg-slate-50 p-2">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={title} className="max-h-[66vh] w-auto object-contain" />
            ) : isPdf ? (
              <iframe src={url} title={title} className="h-[66vh] w-full" />
            ) : (
              <p className="p-6 text-sm text-slate-500">
                No se puede previsualizar este tipo de archivo ({type || "desconocido"}).
                Usá “Descargar”.
              </p>
            )}
          </div>
        ) : null}

        <div className="flex justify-end gap-2">
          {url && (
            <a
              href={url}
              download={downloadName || true}
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Descargar
            </a>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
