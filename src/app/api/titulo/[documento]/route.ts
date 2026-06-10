import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /applicant-admission/postulantes/{documento}/titulo (302 -> URL firmada)
// reenviando el Bearer del cliente, igual que la foto de perfil.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documento: string }> },
): Promise<Response> {
  const { documento } = await params;
  return proxyFoto(
    `/applicant-admission/postulantes/${documento}/titulo`,
    request.headers.get("authorization"),
  );
}
