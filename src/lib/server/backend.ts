// Utilidades de servidor (route handlers). No usar en el cliente.

// URL base de la API para llamadas server-side (proxys de archivos).
// En Docker el server de Next corre dentro del contenedor: "localhost" apunta al
// propio contenedor, no al backend. Por eso se permite una URL server-only
// (BACKEND_API_URL, ej. http://host.docker.internal:8000/api). Si no está,
// cae a NEXT_PUBLIC_API_URL (válido cuando el server corre en el host).
export function backendBaseUrl(): string {
  const url = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL / NEXT_PUBLIC_API_URL no configurada");
  }
  return url.replace(/\/$/, "");
}

// Proxea una foto del backend (que responde 302 -> URL firmada de R2) y devuelve
// los bytes de la imagen. El navegador no puede leer la redirección a R2 por CORS,
// así que el servidor de Next la resuelve y reenvía la imagen al mismo origen.
export async function proxyFoto(
  path: string,
  authorization: string | null,
): Promise<Response> {
  if (!authorization) {
    return new Response("No autorizado.", { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${backendBaseUrl()}${path}`, {
      headers: { Authorization: authorization, Accept: "application/json" },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return new Response("No se pudo contactar la API.", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response(null, { status: upstream.status });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "no-store",
    },
  });
}
