"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Field, TextInput } from "@/components/ui/Field";
import { FilePreview } from "@/components/ui/FilePreview";
import { EstadoPagoBadge } from "@/components/payments/EstadoPagoBadge";
import { MiPostulacionForm } from "@/components/applicant/MiPostulacionForm";
import { useFormErrors } from "@/hooks/useFormErrors";
import { getErrorMessage, isForbidden } from "@/lib/api";
import { miPostulanteService } from "@/services/applicant/miPostulante.service";
import type { Postulante } from "@/lib/applicant";
import type { Pago } from "@/lib/payments";

interface Form {
  nombres: string;
  apellidos: string;
  telefono: string;
  fecha_nacimiento: string;
  colegio: string;
  ciudad: string;
}

function isComplete(p: Postulante): boolean {
  return Boolean(p.fecha_nacimiento && p.colegio && p.ciudad);
}

export default function MiPostulacionPage() {
  const { message, handle, reset, fieldError } = useFormErrors();
  const [postulante, setPostulante] = useState<Postulante | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState<Form>({
    nombres: "",
    apellidos: "",
    telefono: "",
    fecha_nacimiento: "",
    colegio: "",
    ciudad: "",
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [tituloError, setTituloError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fill = useCallback((p: Postulante) => {
    setForm({
      nombres: p.nombres,
      apellidos: p.apellidos,
      telefono: p.telefono ?? "",
      fecha_nacimiento: p.fecha_nacimiento ?? "",
      colegio: p.colegio ?? "",
      ciudad: p.ciudad ?? "",
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setNotFound(false);
    try {
      const p = await miPostulanteService.get();
      setPostulante(p);
      fill(p);
      try {
        setPagos(await miPostulanteService.pagos());
      } catch {
        setPagos([]);
      }
    } catch (e) {
      if (isForbidden(e)) setLoadError(getErrorMessage(e));
      else setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [fill]);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof Form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSavedOk(false);
    setSaving(true);
    try {
      const p = await miPostulanteService.update({
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono || null,
        fecha_nacimiento: form.fecha_nacimiento,
        colegio: form.colegio,
        ciudad: form.ciudad,
      });
      setPostulante(p);
      fill(p);
      setSavedOk(true);
    } catch (e) {
      handle(e);
    } finally {
      setSaving(false);
    }
  }

  async function uploadTitulo(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setTituloError("Seleccioná un archivo (pdf/jpg/jpeg/png).");
      return;
    }
    setUploading(true);
    setTituloError(null);
    try {
      const p = await miPostulanteService.uploadTitulo(file);
      setPostulante(p);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setTituloError(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <Card className="flex justify-center p-10">
        <Spinner className="h-7 w-7" />
      </Card>
    );
  }

  if (notFound) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <h2 className="text-lg font-semibold text-slate-900">No sos postulante</h2>
        <p className="mt-2 text-sm text-slate-500">
          Esta sección es para postulantes. Tu cuenta no tiene un registro de postulante
          asociado.
        </p>
      </Card>
    );
  }

  const complete = postulante ? isComplete(postulante) : false;
  const hasTitulo = Boolean(postulante?.titulo_bachiller_path);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Mi postulación"
        description="Completá tus datos personales y subí tu título de bachiller."
      />

      {loadError && <Alert variant="error">{loadError}</Alert>}

      {!complete && (
        <div className="mb-4">
          <Alert variant="error">
            Tu perfil está incompleto. Completá fecha de nacimiento, colegio y ciudad para
            poder avanzar con tu postulación.
          </Alert>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Datos personales</h2>
          <form onSubmit={save} className="flex flex-col gap-4" noValidate>
            {message && <Alert variant="error">{message}</Alert>}
            {savedOk && <Alert variant="success">Datos guardados.</Alert>}

            <Field label="Documento">
              <TextInput value={postulante?.documento ?? ""} disabled />
            </Field>
            <Field label="Correo">
              <TextInput value={postulante?.email ?? ""} disabled />
            </Field>
            <Field label="Nombres" error={fieldError("nombres")}>
              <TextInput
                value={form.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                invalid={Boolean(fieldError("nombres"))}
                required
              />
            </Field>
            <Field label="Apellidos" error={fieldError("apellidos")}>
              <TextInput
                value={form.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                invalid={Boolean(fieldError("apellidos"))}
                required
              />
            </Field>
            <Field label="Teléfono" error={fieldError("telefono")}>
              <TextInput
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                invalid={Boolean(fieldError("telefono"))}
              />
            </Field>
            <Field label="Fecha de nacimiento" error={fieldError("fecha_nacimiento")}>
              <TextInput
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => set("fecha_nacimiento", e.target.value)}
                invalid={Boolean(fieldError("fecha_nacimiento"))}
                required
              />
            </Field>
            <Field label="Colegio" error={fieldError("colegio")}>
              <TextInput
                value={form.colegio}
                onChange={(e) => set("colegio", e.target.value)}
                invalid={Boolean(fieldError("colegio"))}
                required
              />
            </Field>
            <Field label="Ciudad" error={fieldError("ciudad")}>
              <TextInput
                value={form.ciudad}
                onChange={(e) => set("ciudad", e.target.value)}
                invalid={Boolean(fieldError("ciudad"))}
                required
              />
            </Field>

            <Button type="submit" loading={saving}>
              Guardar datos
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Título de bachiller</h2>
          <div className="mb-3 flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
            <span className="text-slate-600">
              {hasTitulo ? "Título cargado." : "Sin título cargado."}
            </span>
            {hasTitulo && (
              <Button variant="secondary" onClick={() => setPreview(true)}>
                Ver
              </Button>
            )}
          </div>

          <form onSubmit={uploadTitulo} className="flex flex-col gap-3" noValidate>
            {tituloError && <Alert variant="error">{tituloError}</Alert>}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
            />
            <p className="text-xs text-slate-500">pdf/jpg/jpeg/png, máx. 5 MB.</p>
            <Button type="submit" loading={uploading} disabled={!file}>
              {hasTitulo ? "Reemplazar título" : "Subir título"}
            </Button>
          </form>
        </Card>
      </div>

      <MiPostulacionForm disabled={!complete} />

      <Card className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Mis pagos</h2>
        {pagos.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no tenés cobros. Cuando verifiquen tu postulación se genera el cobro de
            inscripción y vas a poder pagarlo en línea.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {pagos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {p.concepto} · {p.monto}
                  </p>
                  <p className="mt-0.5">
                    <EstadoPagoBadge estado={p.estado} />
                  </p>
                </div>
                <Link
                  href={`/payments/pagos/${p.id}`}
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  {p.estado === "PENDIENTE" ? "Pagar" : "Ver"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {preview && (
        <FilePreview
          title="Mi título de bachiller"
          proxyPath="/api/mi-titulo"
          downloadName="mi-titulo"
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}
