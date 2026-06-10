"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as authService from "@/services/auth.service";
import { getErrorMessage } from "@/lib/api";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export default function PerfilPage() {
  const { user, refreshMe } = useAuth();
  const { message, handle, reset, fieldError } = useFormErrors();

  const [username, setUsername] = useState(user?.username ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoLoading, setFotoLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fotoError, setFotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFoto = Boolean(user?.foto_perfil_path);

  // Carga la foto (GET /me/foto -> blob -> object URL).
  const loadFoto = useCallback(async () => {
    if (!user?.foto_perfil_path) {
      setFotoUrl(null);
      return;
    }
    setFotoLoading(true);
    try {
      const url = await authService.fetchMyFotoUrl();
      setFotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      setFotoUrl(null);
    } finally {
      setFotoLoading(false);
    }
  }, [user?.foto_perfil_path]);

  useEffect(() => {
    void loadFoto();
  }, [loadFoto]);

  // Libera el object URL al desmontar.
  useEffect(() => {
    return () => {
      if (fotoUrl) URL.revokeObjectURL(fotoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSaveName(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setNameSuccess(null);
    setSavingName(true);
    try {
      await authService.updateProfile(username);
      await refreshMe();
      setNameSuccess("Perfil actualizado.");
    } catch (error) {
      handle(error);
    } finally {
      setSavingName(false);
    }
  }

  async function onUploadFoto(event: React.FormEvent) {
    event.preventDefault();
    setFotoError(null);
    if (!file) {
      setFotoError("Seleccioná una imagen.");
      return;
    }
    setUploading(true);
    try {
      await authService.uploadMyFoto(file);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshMe();
      await loadFoto();
    } catch (error) {
      setFotoError(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  const initial = (user?.username ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl">
      <PageHeader title="Mi perfil" description="Editá tu nombre de usuario y tu foto." />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Datos</h2>
          <form onSubmit={onSaveName} className="flex flex-col gap-4" noValidate>
            {message && <Alert variant="error">{message}</Alert>}
            {nameSuccess && <Alert variant="success">{nameSuccess}</Alert>}

            <Field label="Correo">
              <TextInput value={user?.email ?? ""} disabled />
            </Field>

            <Field
              label="Nombre de usuario"
              htmlFor="username"
              error={fieldError("username")}
            >
              <TextInput
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                invalid={Boolean(fieldError("username"))}
              />
            </Field>

            <Button type="submit" loading={savingName}>
              Guardar cambios
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Foto de perfil</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              {fotoLoading ? (
                <Spinner />
              ) : fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-semibold text-slate-400">
                  {initial}
                </span>
              )}
            </div>

            <form onSubmit={onUploadFoto} className="flex w-full flex-col gap-3">
              {fotoError && <Alert variant="error">{fotoError}</Alert>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
              <Button type="submit" loading={uploading} disabled={!file}>
                {hasFoto ? "Reemplazar foto" : "Subir foto"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
