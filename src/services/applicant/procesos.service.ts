import { api } from "@/lib/api";
import type { AsignarCarrerasResult, GenerarGruposResult } from "@/lib/applicant";
import { APPLICANT_BASE } from "./postulantes.service";

function base(convocatoria: number | string): string {
  return `${APPLICANT_BASE}/convocatorias/${convocatoria}`;
}

export const procesosService = {
  // Arma grupos y asigna a los elegibles (VERIFICADO + pago). Regenera si existían.
  async generarGrupos(
    convocatoria: number | string,
    periodoId?: number,
  ): Promise<GenerarGruposResult> {
    const body = periodoId ? { periodo_id: periodoId } : {};
    const { data } = await api.post<GenerarGruposResult>(
      `${base(convocatoria)}/generar-grupos`,
      body,
    );
    return data;
  },
  // Asigna carrera definitiva por nota desc y cupos. Regenera.
  async asignarCarreras(
    convocatoria: number | string,
  ): Promise<AsignarCarrerasResult> {
    const { data } = await api.post<AsignarCarrerasResult>(
      `${base(convocatoria)}/asignar-carreras`,
    );
    return data;
  },
};
