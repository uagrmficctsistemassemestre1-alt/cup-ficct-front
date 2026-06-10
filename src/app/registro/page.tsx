"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useAuthStore } from "@/store/auth.store";
import * as authService from "@/services/auth.service";

export default function RegistroPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const { message, handle, reset, fieldError } = useFormErrors();

  const [form, setForm] = useState({
    documento: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    password_confirmation: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    try {
      const res = await authService.register({
        documento: form.documento,
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono || null,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSession(res.access_token, res.user, res.expires_in);
      router.replace("/dashboard");
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold text-slate-900">CUP-FICCT</p>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            Postulate a la FICCT
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Creá tu cuenta con tus datos. Después podrás completar tu perfil, subir tu
            título y seguir tu postulación.
          </p>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            {message && <Alert variant="error">{message}</Alert>}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Documento (CI)" error={fieldError("documento")}>
                <TextInput
                  value={form.documento}
                  onChange={(e) => set("documento", e.target.value)}
                  invalid={Boolean(fieldError("documento"))}
                  required
                />
              </Field>
              <Field label="Teléfono (opcional)" error={fieldError("telefono")}>
                <TextInput
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  invalid={Boolean(fieldError("telefono"))}
                />
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
            </div>

            <Field label="Correo electrónico" error={fieldError("email")}>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                invalid={Boolean(fieldError("email"))}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contraseña" error={fieldError("password")}>
                <TextInput
                  type="password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  invalid={Boolean(fieldError("password"))}
                  required
                />
              </Field>
              <Field label="Repetir contraseña" error={fieldError("password_confirmation")}>
                <TextInput
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => set("password_confirmation", e.target.value)}
                  invalid={Boolean(fieldError("password_confirmation"))}
                  required
                />
              </Field>
            </div>

            <Button type="submit" loading={submitting}>
              Crear cuenta y postularme
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
