"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as usersService from "@/services/users.service";
import { getErrorMessage } from "@/lib/api";
import type { CreateUserPayload, UpdateUserPayload, User } from "@/lib/types";
import { RequirePermission } from "@/components/RequirePermission";
import { UserAvatar } from "@/components/UserAvatar";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

const ROLE_OPTIONS = ["ADMINISTRADOR", "COORDINADOR", "DOCENTE", "POSTULANTE"];

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function UsuariosPage() {
  return (
    <RequirePermission permission="user.manage">
      <UsuariosContent />
    </RequirePermission>
  );
}

function UsuariosContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await usersService.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        per_page: 100,
      });
      setUsers(res.data);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema."
        actions={<Button onClick={openCreate}>Nuevo usuario</Button>}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <TextInput
            placeholder="Buscar por email o usuario…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <SelectInput
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="max-w-xs"
          >
            <option value="">Todos los roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </SelectInput>
        </div>
      </Card>

      <Card className="p-0">
        {loadError && (
          <div className="p-4">
            <Alert variant="error">{loadError}</Alert>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : users.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No hay usuarios para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          proxyPath={`/api/foto/users/${user.id}`}
                          hasFoto={Boolean(user.foto_perfil_path)}
                          name={user.username ?? user.email}
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.username ?? "—"}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.role ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(user)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setDeleting(user)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <UserModal
          user={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            void load();
          }}
        />
      )}

      {deleting && (
        <DeleteUserModal
          user={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function UserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = user !== null;
  const { message, handle, reset, fieldError } = useFormErrors();

  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  // En alta no se preselecciona rol: obliga a elegirlo (evita crear ADMINISTRADOR por descuido).
  const [role, setRole] = useState(user?.role ?? "");
  const [submitting, setSubmitting] = useState(false);

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [fotoLoading, setFotoLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fotoMessage, setFotoMessage] = useState<string | null>(null);

  // Carga la foto del usuario en edición.
  useEffect(() => {
    let revoke: string | null = null;
    async function loadFoto() {
      if (!user?.foto_perfil_path) return;
      setFotoLoading(true);
      try {
        const url = await usersService.fetchUserFotoUrl(user.id);
        revoke = url;
        setFotoUrl(url);
      } catch {
        setFotoUrl(null);
      } finally {
        setFotoLoading(false);
      }
    }
    void loadFoto();
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [user]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    try {
      if (isEdit && user) {
        const payload: UpdateUserPayload = {
          email,
          username: username || null,
          role,
        };
        await usersService.updateUser(user.id, payload);
      } else {
        const payload: CreateUserPayload = {
          email,
          username: username || null,
          password,
          role,
        };
        await usersService.createUser(payload);
      }
      onSaved();
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function onUploadFoto() {
    if (!user || !file) return;
    setFotoMessage(null);
    setUploading(true);
    try {
      await usersService.uploadUserFoto(user.id, file);
      setFile(null);
      const url = await usersService.fetchUserFotoUrl(user.id);
      setFotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setFotoMessage("Foto actualizada.");
    } catch (error) {
      setFotoMessage(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? "Editar usuario" : "Nuevo usuario"}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {message && <Alert variant="error">{message}</Alert>}

        <Field label="Correo electrónico" htmlFor="u-email" error={fieldError("email")}>
          <TextInput
            id="u-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            invalid={Boolean(fieldError("email"))}
            required
          />
        </Field>

        <Field label="Nombre de usuario" htmlFor="u-username" error={fieldError("username")}>
          <TextInput
            id="u-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            invalid={Boolean(fieldError("username"))}
          />
        </Field>

        {!isEdit && (
          <Field label="Contraseña" htmlFor="u-password" error={fieldError("password")}>
            <TextInput
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              invalid={Boolean(fieldError("password"))}
              required
            />
          </Field>
        )}

        <Field label="Rol" htmlFor="u-role" error={fieldError("role")}>
          <SelectInput
            id="u-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            invalid={Boolean(fieldError("role"))}
            required
          >
            <option value="">Seleccioná un rol…</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectInput>
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>

      {isEdit && (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Foto de perfil</p>
          {fotoMessage && (
            <div className="mb-3">
              <Alert variant="info">{fotoMessage}</Alert>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
              {fotoLoading ? (
                <Spinner className="h-5 w-5" />
              ) : fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-slate-400">
                  {(user?.username ?? user?.email ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-700"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={onUploadFoto}
                loading={uploading}
                disabled={!file}
              >
                Subir foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setError(null);
    setDeleting(true);
    try {
      await usersService.deleteUser(user.id);
      onDeleted();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Eliminar usuario">
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        <p className="text-sm text-slate-600">
          ¿Seguro que querés eliminar a{" "}
          <span className="font-medium text-slate-900">
            {user.username ?? user.email}
          </span>
          ? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} loading={deleting}>
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
