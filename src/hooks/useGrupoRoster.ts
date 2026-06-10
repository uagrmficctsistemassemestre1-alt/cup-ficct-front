"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notasService, type MiGrupoMateria, type RosterRow } from "@/services/evaluation/notas.service";
import { getErrorMessage } from "@/lib/api";

// Grupo visible en las planillas (derivado de las asignaciones del usuario).
export interface RosterGrupo {
  id: number;
  codigo: string;
  turno: string;
  gestion: string;
  convocatoria_id: number | null;
}

export interface RosterMateria {
  sigla: string;
  nombre: string;
}

// Estado compartido por las planillas: grupo → materia del grupo → roster de inscritos.
// Los grupos/materias se limitan a lo asignado al usuario (docente: lo suyo; staff: todo).
export function useGrupoRoster() {
  const [asignaciones, setAsignaciones] = useState<MiGrupoMateria[]>([]);
  const [grupo, setGrupo] = useState<RosterGrupo | null>(null);
  const [materia, setMateria] = useState<string>("");
  const [roster, setRoster] = useState<RosterRow[]>([]);

  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notasService
      .misGrupos()
      .then(setAsignaciones)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoadingGrupos(false));
  }, []);

  // Grupos únicos a partir de las asignaciones.
  const grupos = useMemo<RosterGrupo[]>(() => {
    const map = new Map<number, RosterGrupo>();
    for (const a of asignaciones) {
      if (!map.has(a.grupo_id)) {
        map.set(a.grupo_id, {
          id: a.grupo_id,
          codigo: a.grupo_codigo,
          turno: a.turno,
          gestion: a.gestion,
          convocatoria_id: a.convocatoria_id,
        });
      }
    }
    return Array.from(map.values());
  }, [asignaciones]);

  // Materias de cada grupo (solo las asignadas al usuario).
  const materias = useMemo<RosterMateria[]>(() => {
    if (!grupo) return [];
    return asignaciones
      .filter((a) => a.grupo_id === grupo.id)
      .map((a) => ({ sigla: a.materia_sigla, nombre: a.materia_nombre }));
  }, [asignaciones, grupo]);

  const selectGrupo = useCallback(async (g: RosterGrupo | null) => {
    setGrupo(g);
    setMateria("");
    setRoster([]);
    if (!g) return;
    setLoadingDetail(true);
    setError(null);
    try {
      setRoster(await notasService.estudiantesGrupo(g.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  return {
    grupos,
    grupo,
    selectGrupo,
    materias,
    materia,
    setMateria,
    roster,
    loadingGrupos,
    loadingDetail,
    error,
  };
}
