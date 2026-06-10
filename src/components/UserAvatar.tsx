"use client";

import { useEffect, useState } from "react";
import { fetchFotoObjectUrl } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

// Avatar que carga la foto vía el proxy same-origin; si no hay, muestra la inicial.
export function UserAvatar({
  proxyPath,
  hasFoto,
  name,
  size = 36,
}: {
  proxyPath: string;
  hasFoto: boolean;
  name: string;
  size?: number;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(hasFoto);

  useEffect(() => {
    let active = true;
    let created: string | null = null;

    if (!hasFoto) {
      setUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchFotoObjectUrl(proxyPath)
      .then((objectUrl) => {
        if (active) {
          created = objectUrl;
          setUrl(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      })
      .catch(() => {
        if (active) setUrl(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [proxyPath, hasFoto]);

  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-500 ring-1 ring-slate-200"
      style={{ width: size, height: size }}
    >
      {loading ? (
        <Spinner className="h-4 w-4" />
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
