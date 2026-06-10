import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /payments/comprobantes/{id}/descargar (302 -> URL firmada)
// reenviando el Bearer del cliente, igual que la foto/título.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return proxyFoto(
    `/payments/comprobantes/${id}/descargar`,
    request.headers.get("authorization"),
  );
}
