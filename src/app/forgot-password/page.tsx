"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as authService from "@/services/auth.service";
import { AuthCard } from "@/components/AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const { message, handle, reset, fieldError } = useFormErrors();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message);
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace a tu correo"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {message && <Alert variant="error">{message}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

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

        <Button type="submit" loading={submitting} className="w-full">
          Enviar enlace
        </Button>

        <div className="text-center text-sm">
          <Link href="/login" className="text-slate-600 hover:text-slate-900">
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
