import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /payments/pagos/{id}/recibo (302 -> URL firmada del PDF)
// reenviando el Bearer del cliente, igual que la foto/título/comprobante.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return proxyFoto(
    `/payments/pagos/${id}/recibo`,
    request.headers.get("authorization"),
  );
}
