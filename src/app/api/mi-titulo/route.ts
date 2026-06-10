import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /applicant-admission/mi-postulante/titulo (302 -> URL firmada)
// reenviando el Bearer del cliente. El backend resuelve el postulante por el token.
export function GET(request: NextRequest): Promise<Response> {
  return proxyFoto(
    "/applicant-admission/mi-postulante/titulo",
    request.headers.get("authorization"),
  );
}
