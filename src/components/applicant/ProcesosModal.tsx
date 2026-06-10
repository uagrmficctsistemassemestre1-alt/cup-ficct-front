"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/api";
import { procesosService } from "@/services/applicant/procesos.service";
import { periodosService } from "@/services/academic/periodos.service";
import type {
  AsignarCarrerasResult,
  Convocatoria,
  GenerarGruposResult,
} from "@/lib/applicant";
import type { Periodo } from "@/lib/academic";

export function ProcesosModal({
  convocatoria,
  onClose,
}: {
  convocatoria: Convocatoria;
  onClose: () => void;
}) {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [periodoId, setPeriodoId] = useState("");

  const [busyGrupos, setBusyGrupos] = useState(false);
  const [grupos, setGrupos] = useState<GenerarGruposResult | null>(null);
  const [errGrupos, setErrGrupos] = useState<string | null>(null);

  const [busyCarreras, setBusyCarreras] = useState(false);
  const [carreras, setCarreras] = useState<AsignarCarrerasResult | null>(null);
  const [errCarreras, setErrCarreras] = useState<string | null>(null);

  useEffect(() => {
    periodosService.list().then(setPeriodos).catch(() => setPeriodos([]));
  }, []);

  async function generarGrupos() {
    setBusyGrupos(true);
    setErrGrupos(null);
    try {
      setGrupos(
        await procesosService.generarGrupos(
          convocatoria.id,
          periodoId ? Number(periodoId) : undefined,
        ),
      );
    } catch (e) {
      setErrGrupos(getErrorMessage(e));
    } finally {
      setBusyGrupos(false);
    }
  }

  async function asignarCarreras() {
    setBusyCarreras(true);
    setErrCarreras(null);
    try {
      setCarreras(await procesosService.asignarCarreras(convocatoria.id));
    } catch (e) {
      setErrCarreras(getErrorMessage(e));
    } finally {
      setBusyCarreras(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Procesos automáticos · ${convocatoria.nombre}`}
    >
      <div className="flex flex-col gap-6">
        {/* Generar grupos */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Generar grupos</h3>
          <p className="text-xs text-slate-500">
            Arma grupos y asigna a los elegibles (VERIFICADO + pago realizado). Regenera
            si ya existían.
          </p>
          <Field label="Periodo (opcional)">
            <SelectInput value={periodoId} onChange={(e) => setPeriodoId(e.target.value)}>
              <option value="">Sin periodo</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} ({p.gestion})
                </option>
              ))}
            </SelectInput>
          </Field>
          {errGrupos && <Alert variant="error">{errGrupos}</Alert>}
          {grupos && (
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <Stat label="Grupos" value={grupos.grupos_creados} />
              <Stat label="Inscritos" value={grupos.inscritos} />
              <Stat label="Mañana" value={grupos.manana} />
              <Stat label="Tarde" value={grupos.tarde} />
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={generarGrupos} loading={busyGrupos}>
              Generar grupos
            </Button>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Asignar carreras */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Asignar carreras</h3>
          <p className="text-xs text-slate-500">
            Asigna la carrera definitiva por nota descendente y cupos. Regenera.
          </p>
          {errCarreras && <Alert variant="error">{errCarreras}</Alert>}
          {carreras && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <Stat label="Elegibles" value={carreras.elegibles} />
                <Stat label="Asignados" value={carreras.asignados} />
                <Stat label="Sin cupo" value={carreras.sin_cupo} />
              </div>
              {Object.keys(carreras.por_carrera).length > 0 && (
                <div className="rounded-md border border-slate-200 p-3 text-sm">
                  <p className="mb-1 font-medium text-slate-700">Por carrera</p>
                  <ul className="space-y-0.5 text-slate-600">
                    {Object.entries(carreras.por_carrera).map(([codigo, n]) => (
                      <li key={codigo} className="flex justify-between">
                        <span>{codigo}</span>
                        <span className="font-medium">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={asignarCarreras} loading={busyCarreras}>
              Asignar carreras
            </Button>
          </div>
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <p className="text-xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
