import { makeCrud } from "./crud";
import type { Grupo, Turno } from "@/lib/academic";

export interface GrupoPayload {
  codigo: string;
  turno: Turno;
  capacidad: number;
  gestion: string;
}

export const gruposService = makeCrud<Grupo, GrupoPayload>("grupos");
