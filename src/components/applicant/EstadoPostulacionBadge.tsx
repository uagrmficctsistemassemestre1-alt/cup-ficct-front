import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { EstadoPostulacion } from "@/lib/applicant";

const TONE: Record<EstadoPostulacion, BadgeTone> = {
  PENDIENTE: "warning",
  VERIFICADO: "success",
  RECHAZADO: "danger",
};

export function EstadoPostulacionBadge({ estado }: { estado: EstadoPostulacion }) {
  return <Badge tone={TONE[estado]}>{estado}</Badge>;
}
