"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import { AuthCard } from "@/components/AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const { login, initialized, isAuthenticated, user } = useAuth();
  const { message, handle, reset, fieldError } = useFormErrors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión, salir del login.
  useEffect(() => {
    if (initialized && isAuthenticated && user) {
      router.replace(
        user.must_change_password ? "/change-password" : "/dashboard",
      );
    }
  }, [initialized, isAuthenticated, user, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      router.replace(
        loggedUser.must_change_password ? "/change-password" : "/dashboard",
      );
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="CUP-FICCT" subtitle="Iniciá sesión para continuar">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {message && <Alert variant="error">{message}</Alert>}

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

        <Field label="Contraseña" htmlFor="password" error={fieldError("password")}>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            invalid={Boolean(fieldError("password"))}
            required
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Ingresar
        </Button>

        <div className="flex flex-col gap-1 text-center text-sm">
          <Link href="/forgot-password" className="text-slate-600 hover:text-slate-900">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link href="/registro" className="font-medium text-slate-900 hover:underline">
            ¿No tenés cuenta? Postulate
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
