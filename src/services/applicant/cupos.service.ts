import { api } from "@/lib/api";
import type { DataResponse, MessageResponse } from "@/lib/types";
import type { CarreraCupo } from "@/lib/applicant";
import { APPLICANT_BASE } from "./postulantes.service";

function base(convocatoria: number | string): string {
  return `${APPLICANT_BASE}/convocatorias/${convocatoria}/cupos`;
}

export const cuposService = {
  async list(convocatoria: number | string): Promise<CarreraCupo[]> {
    const { data } = await api.get<DataResponse<CarreraCupo[]>>(base(convocatoria));
    return data.data;
  },
  // Fija/actualiza el cupo de una carrera; devuelve la lista actualizada.
  async set(
    convocatoria: number | string,
    carrera_codigo: string,
    cupos: number,
  ): Promise<CarreraCupo[]> {
    const { data } = await api.put<DataResponse<CarreraCupo[]>>(base(convocatoria), {
      carrera_codigo,
      cupos,
    });
    return data.data;
  },
  async remove(
    convocatoria: number | string,
    carrera_codigo: string,
  ): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(
      `${base(convocatoria)}/${carrera_codigo}`,
    );
    return data;
  },
};
