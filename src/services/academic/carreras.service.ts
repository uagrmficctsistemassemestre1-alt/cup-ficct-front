import { makeCrud } from "./crud";
import type { Carrera } from "@/lib/academic";

export interface CarreraPayload {
  codigo: string;
  nombre: string;
  facultad_codigo: string;
}

export const carrerasService = makeCrud<Carrera, CarreraPayload>("carreras");
