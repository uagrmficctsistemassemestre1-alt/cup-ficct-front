"use client";

import { useState } from "react";
import { RequirePermission } from "@/components/RequirePermission";
import { EntityManager } from "@/components/academic/EntityManager";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api";
import {
  createDocenteAccount,
  deleteDocenteAccount,
  docentesService,
} from "@/services/academic/docentes.service";
import { ACADEMIC_PERMISSION, type Docente } from "@/lib/academic";

interface Form {
  ci: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  profesion: string;
}

const EMPTY: Form = {
  ci: "",
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  profesion: "",
};

type AccountMode = "create" | "delete";

function AccountModal({
  docente,
  mode,
  onClose,
}: {
  docente: Docente;
  mode: AccountMode;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; temp: string } | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        const res = await createDocenteAccount(docente.ci);
        setCreated({ email: res.user.email, temp: res.temporary_password });
      } else {
        const res = await deleteDocenteAccount(docente.ci);
        setDoneMsg(res.message);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "create" ? "Crear cuenta de docente" : "Eliminar cuenta de docente";

  return (
    <Modal open onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        {created ? (
          <>
            <Alert variant="success">Cuenta creada.</Alert>
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <p>
                <span className="text-slate-500">Email:</span>{" "}
                <strong>{created.email}</strong>
              </p>
              <p>
                <span className="text-slate-500">Contraseña temporal:</span>{" "}
                <strong className="font-mono">{created.temp}</strong>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Guardala: el docente deberá cambiarla al primer ingreso.
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={onClose}>Listo</Button>
            </div>
          </>
        ) : doneMsg ? (
          <>
            <Alert variant="success">{doneMsg}</Alert>
            <div className="flex justify-end">
              <Button onClick={onClose}>Listo</Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {mode === "create" ? (
                <>
                  Crear cuenta de usuario (rol DOCENTE) para{" "}
                  <strong>
                    {docente.nombres} {docente.apellidos}
                  </strong>{" "}
                  ({docente.email})?
                </>
              ) : (
                <>
                  Eliminar la cuenta de usuario de{" "}
                  <strong>
                    {docente.nombres} {docente.apellidos}
                  </strong>
                  ?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant={mode === "delete" ? "danger" : "primary"}
                onClick={confirm}
                loading={busy}
              >
                {mode === "create" ? "Crear cuenta" : "Eliminar cuenta"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function DocentesContent() {
  const [account, setAccount] = useState<{ docente: Docente; mode: AccountMode } | null>(
    null,
  );

  return (
    <>
      <EntityManager<Docente, Form>
        title="Docentes"
        description="Docentes y sus cuentas de usuario."
        createLabel="Nuevo docente"
        rowKey={(d) => d.ci}
        columns={[
          { header: "CI", render: (d) => d.ci },
          { header: "Nombre", render: (d) => `${d.nombres} ${d.apellidos}` },
          { header: "Email", render: (d) => d.email },
          { header: "Teléfono", render: (d) => d.telefono ?? "—" },
          { header: "Profesión", render: (d) => d.profesion ?? "—" },
        ]}
        fetchAll={docentesService.list}
        emptyForm={EMPTY}
        toForm={(d) => ({
          ci: d.ci,
          nombres: d.nombres,
          apellidos: d.apellidos,
          email: d.email,
          telefono: d.telefono ?? "",
          profesion: d.profesion ?? "",
        })}
        create={(f) =>
          docentesService.create({
            ci: f.ci,
            nombres: f.nombres,
            apellidos: f.apellidos,
            email: f.email,
            telefono: f.telefono || null,
            profesion: f.profesion || null,
          })
        }
        update={(row, f) =>
          docentesService.update(row.ci, {
            nombres: f.nombres,
            apellidos: f.apellidos,
            email: f.email,
            telefono: f.telefono || null,
            profesion: f.profesion || null,
          })
        }
        remove={(row) => docentesService.remove(row.ci)}
        describe={(d) => `${d.nombres} ${d.apellidos}`}
        rowActions={(d) => (
          <>
            <Button variant="secondary" onClick={() => setAccount({ docente: d, mode: "create" })}>
              Crear cuenta
            </Button>
            <Button variant="secondary" onClick={() => setAccount({ docente: d, mode: "delete" })}>
              Quitar cuenta
            </Button>
          </>
        )}
        renderForm={({ values, set, fieldError, editing }) => (
          <>
            <Field label="CI" error={fieldError("ci")}>
              <TextInput
                value={values.ci}
                onChange={(e) => set("ci", e.target.value)}
                invalid={Boolean(fieldError("ci"))}
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
            <Field label="Profesión" error={fieldError("profesion")}>
              <TextInput
                value={values.profesion}
                onChange={(e) => set("profesion", e.target.value)}
                invalid={Boolean(fieldError("profesion"))}
              />
            </Field>
          </>
        )}
      />

      {account && (
        <AccountModal
          docente={account.docente}
          mode={account.mode}
          onClose={() => setAccount(null)}
        />
      )}
    </>
  );
}

export default function DocentesPage() {
  return (
    <RequirePermission permission={ACADEMIC_PERMISSION}>
      <DocentesContent />
    </RequirePermission>
  );
}
