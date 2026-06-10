import type { NextRequest } from "next/server";
import { proxyFoto } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

// Proxea GET /auth/users/{id}/foto reenviando el Bearer del cliente.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  return proxyFoto(`/auth/users/${id}/foto`, request.headers.get("authorization"));
}
