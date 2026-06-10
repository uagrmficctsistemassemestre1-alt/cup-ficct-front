"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilePreview } from "@/components/ui/FilePreview";

// Visor del recibo (PDF). Solo se genera si el pago está PAGADO; si no, el visor
// muestra el error que devuelve el backend (422).
export function ReciboButton({ pagoId }: { pagoId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Ver recibo</Button>
      {open && (
        <FilePreview
          title={`Recibo · Pago #${pagoId}`}
          proxyPath={`/api/recibo/${pagoId}`}
          downloadName={`recibo-${pagoId}.pdf`}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
