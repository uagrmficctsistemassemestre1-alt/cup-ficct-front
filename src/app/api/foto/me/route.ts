import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /auth/me/foto reenviando el Bearer del cliente.
export function GET(request: NextRequest): Promise<Response> {
  return proxyFoto("/auth/me/foto", request.headers.get("authorization"));
}
