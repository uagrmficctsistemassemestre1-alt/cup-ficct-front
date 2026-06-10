"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormErrors } from "@/hooks/useFormErrors";
import * as rolesService from "@/services/roles.service";
import { getErrorMessage } from "@/lib/api";
import type { Permission, Role } from "@/lib/types";
import { RequirePermission } from "@/components/RequirePermission";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { permissionLabel, permissionGroupLabel } from "@/lib/permissions";

export default function RolesPage() {
  return (
    <RequirePermission permission="role.manage">
      <RolesContent />
    </RequirePermission>
  );
}

function RolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        rolesService.listRoles(),
        rolesService.listPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setModalOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Gestión de roles y sus permisos."
        actions={<Button onClick={openCreate}>Nuevo rol</Button>}
      />

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
        ) : roles.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No hay roles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Permisos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {role.name}
                    </td>
                    <td className="px-4 py-3">
                      {role.permissions.length === 0 ? (
                        <span className="text-slate-400">Sin permisos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm}
                              title={perm}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {permissionLabel(perm)}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(role)}>
                          Editar
                        </Button>
                        <Button variant="danger" onClick={() => setDeleting(role)}>
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
        <RoleModal
          role={editing}
          permissions={permissions}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            void load();
          }}
        />
      )}

      {deleting && (
        <DeleteRoleModal
          role={deleting}
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

function RoleModal({
  role,
  permissions,
  onClose,
  onSaved,
}: {
  role: Role | null;
  permissions: Permission[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = role !== null;
  const { message, handle, reset, fieldError } = useFormErrors();

  const [name, setName] = useState(role?.name ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role?.permissions ?? []),
  );
  const [submitting, setSubmitting] = useState(false);

  // Agrupa permisos por prefijo (ej: "user", "role") para mostrarlos ordenados.
  const groups = useMemo(() => {
    const map = new Map<string, Permission[]>();
    for (const perm of permissions) {
      const key = perm.name.split(".")[0] ?? "otros";
      const list = map.get(key) ?? [];
      list.push(perm);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [permissions]);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    reset();
    setSubmitting(true);
    const perms = Array.from(selected);
    try {
      if (isEdit && role) {
        await rolesService.renameRole(role.id, name);
        if (perms.length > 0) {
          await rolesService.syncRolePermissions(role.id, perms);
        }
      } else {
        await rolesService.createRole({ name, permissions: perms });
      }
      onSaved();
    } catch (error) {
      handle(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={isEdit ? "Editar rol" : "Nuevo rol"}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {message && <Alert variant="error">{message}</Alert>}

        <Field label="Nombre" htmlFor="r-name" error={fieldError("name")}>
          <TextInput
            id="r-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={Boolean(fieldError("name"))}
            required
          />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Permisos</p>
          {fieldError("permissions") && (
            <p className="mb-2 text-sm text-red-600">{fieldError("permissions")}</p>
          )}
          {permissions.length === 0 ? (
            <p className="text-sm text-slate-400">No hay permisos disponibles.</p>
          ) : (
            <div className="max-h-64 space-y-4 overflow-y-auto rounded-md border border-slate-200 p-3">
              {groups.map(([group, perms]) => (
                <div key={group}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {permissionGroupLabel(group)}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        title={perm.name}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(perm.name)}
                          onChange={() => toggle(perm.name)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        {permissionLabel(perm.name)}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {isEdit && (
            <p className="mt-2 text-xs text-slate-400">
              Para quitar todos los permisos dejá la lista vacía y editá desde el
              backend; aquí se aplican los permisos seleccionados.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteRoleModal({
  role,
  onClose,
  onDeleted,
}: {
  role: Role;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setError(null);
    setDeleting(true);
    try {
      await rolesService.deleteRole(role.id);
      onDeleted();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Eliminar rol">
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        <p className="text-sm text-slate-600">
          ¿Seguro que querés eliminar el rol{" "}
          <span className="font-medium text-slate-900">{role.name}</span>?
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
