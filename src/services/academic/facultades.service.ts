import { makeCrud } from "./crud";
import type { Facultad } from "@/lib/academic";

export interface FacultadPayload {
  codigo: string;
  nombre: string;
  abreviatura: string;
}

export const facultadesService = makeCrud<Facultad, FacultadPayload>("facultades");
