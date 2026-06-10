import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { EstadoPago } from "@/lib/payments";

const TONE: Record<EstadoPago, BadgeTone> = {
  PENDIENTE: "warning",
  PAGADO: "success",
  RECHAZADO: "danger",
};

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  return <Badge tone={TONE[estado]}>{estado}</Badge>;
}
