"use client";

import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { ReportTable } from "@/components/reports/ReportTable";
import { useCan } from "@/hooks/useAuth";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { getErrorMessage, getValidationErrors, isForbidden } from "@/lib/api";
import { reporteVoz, reporteVozExport } from "@/services/reports/reports.service";
import {
  REPORT_EXPORT,
  REPORT_VIEW,
  type ExportFormat,
  type ReporteVoz,
} from "@/lib/reports";

type Mensaje =
  | { id: number; rol: "user"; texto: string }
  | { id: number; rol: "bot"; texto: string; estado: "cargando" }
  | { id: number; rol: "bot"; texto: string; estado: "ok"; reporte: ReporteVoz }
  | { id: number; rol: "bot"; texto: string; estado: "error"; error: string };

function Descargas({ texto }: { texto: string }) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(format: ExportFormat) {
    setBusy(format);
    setError(null);
    try {
      await reporteVozExport(texto, format);
    } catch (e) {
      setError(isForbidden(e) ? "Sin permiso para exportar." : getErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex gap-2">
        {(["excel", "pdf"] as const).map((f) => (
          <button
            key={f}
            onClick={() => run(f)}
            disabled={busy !== null}
            className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === f ? "…" : f === "excel" ? "Excel" : "PDF"}
          </button>
        ))}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function ReportChatWidget() {
  const canView = useCan(REPORT_VIEW);
  const canExport = useCan(REPORT_EXPORT);
  const [open, setOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const idRef = useRef(0);
  const finRef = useRef<HTMLDivElement>(null);

  const { supported, listening, toggle } = useSpeechToText((t) =>
    setTexto((prev) => (prev ? `${prev} ${t}` : t)),
  );

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, open]);

  if (!canView) return null;

  async function enviar(prompt: string) {
    const q = prompt.trim();
    if (!q || enviando) return;
    setEnviando(true);
    setTexto("");
    const userId = ++idRef.current;
    const botId = ++idRef.current;
    setMensajes((m) => [
      ...m,
      { id: userId, rol: "user", texto: q },
      { id: botId, rol: "bot", texto: q, estado: "cargando" },
    ]);
    try {
      const reporte = await reporteVoz(q, "json");
      setMensajes((m) =>
        m.map((x) =>
          x.id === botId ? { id: botId, rol: "bot", texto: q, estado: "ok", reporte } : x,
        ),
      );
    } catch (e) {
      const v = getValidationErrors(e);
      const error = v ? Object.values(v).flat().join(" ") : getErrorMessage(e);
      setMensajes((m) =>
        m.map((x) =>
          x.id === botId ? { id: botId, rol: "bot", texto: q, estado: "error", error } : x,
        ),
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[26rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Asistente de reportes</p>
              <p className="text-xs text-slate-300">Pedí un reporte en lenguaje natural</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {mensajes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <p className="text-sm text-slate-500">
                  Ej.: “estudiantes del turno mañana de la gestión 2026” o “recaudación de la
                  convocatoria Admisión Prueba QA”.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {mensajes.map((m) =>
                  m.rol === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-slate-900 px-3 py-1.5 text-sm text-white">
                        {m.texto}
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-start">
                      <div className="w-full rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3 py-2">
                        {m.estado === "cargando" ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Spinner className="h-4 w-4" /> Generando…
                          </div>
                        ) : m.estado === "error" ? (
                          <p className="text-sm text-red-600">{m.error}</p>
                        ) : (
                          <>
                            <p className="mb-1 text-xs text-slate-500">
                              {m.reporte.interpretacion.reporte}
                            </p>
                            <p className="mb-1.5 text-xs font-semibold text-slate-900">
                              {m.reporte.titulo}
                            </p>
                            <div className="max-h-48 overflow-auto rounded-md border border-slate-200 bg-white text-xs">
                              <ReportTable reporte={m.reporte} />
                            </div>
                            {canExport && <Descargas texto={m.texto} />}
                          </>
                        )}
                      </div>
                    </div>
                  ),
                )}
                <div ref={finRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void enviar(texto);
            }}
            className="flex items-end gap-2 border-t border-slate-200 p-2"
          >
            <button
              type="button"
              onClick={toggle}
              disabled={!supported}
              title={supported ? "Dictar" : "Sin soporte de voz"}
              className={`h-9 w-9 shrink-0 rounded-md text-sm ring-1 ring-inset ring-slate-300 ${
                listening ? "bg-red-600 text-white" : "bg-white hover:bg-slate-50"
              } disabled:opacity-50`}
            >
              {listening ? "■" : "🎤"}
            </button>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void enviar(texto);
                }
              }}
              rows={1}
              placeholder="Pedí un reporte…"
              className="min-h-[36px] max-h-24 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              className="h-9 shrink-0 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {enviando ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Asistente de reportes"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg transition hover:bg-slate-700"
      >
        {open ? "✕" : "🤖"}
      </button>
    </>
  );
}
