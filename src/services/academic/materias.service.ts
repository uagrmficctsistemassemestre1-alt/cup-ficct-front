import { makeCrud } from "./crud";
import type { Materia } from "@/lib/academic";

export interface MateriaPayload {
  sigla: string;
  nombre: string;
  peso: number;
}

export const materiasService = makeCrud<Materia, MateriaPayload>("materias");
