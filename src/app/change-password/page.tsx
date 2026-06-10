"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as authService from "@/services/auth.service";
import { AuthCard } from "@/components/AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

// Cambio de contraseña. Sirve para el cambio forzado (primer ingreso) y el voluntario.
export default function ChangePasswordPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user, refreshMe } = useAuth();
  const { message, handle, reset, fieldError } = useFormErrors();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Requiere sesión.
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, router]);

  const forced = user?.must_change_password === true;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirm,
      });
      // Re-fetch /me para que must_change_password pase a false y se libere la navegación.
      await refreshMe();
      router.replace("/dashboard");
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Cambiar contraseña"
      subtitle={
        forced
          ? "Debés cambiar tu contraseña antes de continuar."
          : "Actualizá tu contraseña."
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {message && <Alert variant="error">{message}</Alert>}

        <Field
          label="Contraseña actual"
          htmlFor="current_password"
          error={fieldError("current_password")}
        >
          <TextInput
            id="current_password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            invalid={Boolean(fieldError("current_password"))}
            required
          />
        </Field>

        <Field
          label="Nueva contraseña"
          htmlFor="new_password"
          error={fieldError("new_password")}
        >
          <TextInput
            id="new_password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            invalid={Boolean(fieldError("new_password"))}
            required
          />
        </Field>

        <Field
          label="Confirmar nueva contraseña"
          htmlFor="new_password_confirmation"
          error={fieldError("new_password_confirmation")}
        >
          <TextInput
            id="new_password_confirmation"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            invalid={Boolean(fieldError("new_password_confirmation"))}
            required
          />
        </Field>

        <Button type="submit" loading={submitting} className="w-full">
          Guardar contraseña
        </Button>
      </form>
    </AuthCard>
  );
}
