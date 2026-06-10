import { makeCrud } from "./crud";
import type { Periodo } from "@/lib/academic";

export interface PeriodoPayload {
  codigo: string;
  gestion: string;
  fecha_inicio_clases: string;
  fecha_fin_clases: string;
}

export const periodosService = makeCrud<Periodo, PeriodoPayload>("periodos");
