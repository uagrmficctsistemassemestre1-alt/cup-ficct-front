"use client";

import Link from "next/link";
import { useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CargaMasivaModal } from "@/components/applicant/CargaMasivaModal";
import { TituloModal } from "@/components/applicant/TituloModal";
import { postulantesService } from "@/services/applicant/postulantes.service";
import { APPLICANT_MANAGE, type Postulante } from "@/lib/applicant";

interface Form {
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  colegio: string;
  ciudad: string;
  // Título de bachiller (opcional): se sube tras crear/actualizar el postulante.
  titulo: File | null;
}

const EMPTY: Form = {
  documento: "",
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  fecha_nacimiento: "",
  colegio: "",
  ciudad: "",
  titulo: null,
};

function PostulantesContent() {
  const [carga, setCarga] = useState(false);
  const [titulo, setTitulo] = useState<Postulante | null>(null);
  // Remontar la tabla tras una carga masiva / subida de título para refrescar.
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      <EntityManager<Postulante, Form>
        key={reloadKey}
        title="Postulantes"
        description="Postulantes (documento como identificador; documento y email únicos)."
        createLabel="Nuevo postulante"
        toolbar={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setCarga(true)}>
              Carga masiva
            </Button>
          </div>
        }
        rowKey={(p) => p.documento}
        columns={[
          { header: "Documento", render: (p) => p.documento },
          { header: "Nombre", render: (p) => `${p.nombres} ${p.apellidos}` },
          { header: "Email", render: (p) => p.email },
          { header: "Ciudad", render: (p) => p.ciudad },
          { header: "Colegio", render: (p) => p.colegio },
        ]}
        fetchAll={() => postulantesService.list()}
        emptyForm={EMPTY}
        toForm={(p) => ({
          documento: p.documento,
          nombres: p.nombres,
          apellidos: p.apellidos,
          email: p.email,
          telefono: p.telefono ?? "",
          fecha_nacimiento: p.fecha_nacimiento,
          colegio: p.colegio,
          ciudad: p.ciudad,
          titulo: null,
        })}
        create={async (f) => {
          await postulantesService.create({
            documento: f.documento,
            nombres: f.nombres,
            apellidos: f.apellidos,
            email: f.email,
            telefono: f.telefono || null,
            fecha_nacimiento: f.fecha_nacimiento,
            colegio: f.colegio,
            ciudad: f.ciudad,
          });
          // El título se sube aparte (necesita el postulante ya creado).
          if (f.titulo) await postulantesService.uploadTitulo(f.documento, f.titulo);
        }}
        update={async (row, f) => {
          await postulantesService.update(row.documento, {
            nombres: f.nombres,
            apellidos: f.apellidos,
            email: f.email,
            telefono: f.telefono || null,
            fecha_nacimiento: f.fecha_nacimiento,
            colegio: f.colegio,
            ciudad: f.ciudad,
          });
          if (f.titulo) await postulantesService.uploadTitulo(row.documento, f.titulo);
        }}
        remove={(row) => postulantesService.remove(row.documento)}
        describe={(p) => `${p.nombres} ${p.apellidos} (${p.documento})`}
        rowActions={(p) => (
          <>
            <Link
              href={`/applicant/postulantes/${p.documento}/postulaciones`}
              className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Postulaciones
            </Link>
            <Button variant="secondary" onClick={() => setTitulo(p)}>
              Título
            </Button>
          </>
        )}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="Documento" error={fieldError("documento")}>
              <TextInput
                value={values.documento}
                onChange={(e) => set("documento", e.target.value)}
                invalid={Boolean(fieldError("documento"))}
                disabled={editing}
                required
              />
            </Field>
            <Field label="Nombres" error={fieldError("nombres")}>
              <TextInput
                value={values.nombres}
                onChange={(e) => set("nombres", e.target.value)}
                invalid={Boolean(fieldError("nombres"))}
                required
              />
            </Field>
            <Field label="Apellidos" error={fieldError("apellidos")}>
              <TextInput
                value={values.apellidos}
                onChange={(e) => set("apellidos", e.target.value)}
                invalid={Boolean(fieldError("apellidos"))}
                required
              />
            </Field>
            <Field label="Email" error={fieldError("email")}>
              <TextInput
                type="email"
                value={values.email}
                onChange={(e) => set("email", e.target.value)}
                invalid={Boolean(fieldError("email"))}
                required
              />
            </Field>
            <Field label="Teléfono" error={fieldError("telefono")}>
              <TextInput
                value={values.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                invalid={Boolean(fieldError("telefono"))}
              />
            </Field>
            <Field label="Fecha de nacimiento" error={fieldError("fecha_nacimiento")}>
              <TextInput
                type="date"
                value={values.fecha_nacimiento}
                onChange={(e) => set("fecha_nacimiento", e.target.value)}
                invalid={Boolean(fieldError("fecha_nacimiento"))}
                required
              />
            </Field>
            <Field label="Colegio" error={fieldError("colegio")}>
              <TextInput
                value={values.colegio}
                onChange={(e) => set("colegio", e.target.value)}
                invalid={Boolean(fieldError("colegio"))}
                required
              />
            </Field>
            <Field label="Ciudad" error={fieldError("ciudad")}>
              <TextInput
                value={values.ciudad}
                onChange={(e) => set("ciudad", e.target.value)}
                invalid={Boolean(fieldError("ciudad"))}
                required
              />
            </Field>
            <Field
              label={editing ? "Título de bachiller (reemplazar)" : "Título de bachiller (opcional)"}
              error={fieldError("titulo")}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => set("titulo", e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
              <p className="mt-1 text-xs text-slate-500">pdf/jpg/jpeg/png, máx. 5 MB.</p>
            </Field>
          </>
        )}
      />

      {carga && (
        <CargaMasivaModal
          onClose={() => setCarga(false)}
          onDone={() => {
            setCarga(false);
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {titulo && (
        <TituloModal
          postulante={titulo}
          onClose={() => setTitulo(null)}
          onDone={() => setReloadKey((k) => k + 1)}
        />
      )}
    </>
  );
}

export default function PostulantesPage() {
  return (
    <RequirePermission permission={APPLICANT_MANAGE}>
      <PostulantesContent />
    </RequirePermission>
  );
}
