"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as authService from "@/services/auth.service";
import { AuthCard } from "@/components/AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { FullScreenLoader } from "@/components/ui/Spinner";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { message, handle, reset, fieldError } = useFormErrors();

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: confirm,
      });
      setSuccess(res.message);
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">{success}</Alert>
        <Link
          href="/login"
          className="rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {message && <Alert variant="error">{message}</Alert>}
      {!token && (
        <Alert variant="error">
          Falta el token de recuperación en el enlace.
        </Alert>
      )}

      <Field label="Correo electrónico" htmlFor="email" error={fieldError("email")}>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          invalid={Boolean(fieldError("email"))}
          required
        />
      </Field>

      <Field label="Nueva contraseña" htmlFor="password" error={fieldError("password")}>
        <TextInput
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={Boolean(fieldError("password"))}
          required
        />
      </Field>

      <Field
        label="Confirmar contraseña"
        htmlFor="password_confirmation"
        error={fieldError("password_confirmation")}
      >
        <TextInput
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          invalid={Boolean(fieldError("password_confirmation"))}
          required
        />
      </Field>

      <Button type="submit" loading={submitting} disabled={!token} className="w-full">
        Restablecer contraseña
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Restablecer contraseña" subtitle="Definí tu nueva contraseña">
      <Suspense fallback={<FullScreenLoader />}>
        <ResetForm />
      </Suspense>
    </AuthCard>
  );
}
