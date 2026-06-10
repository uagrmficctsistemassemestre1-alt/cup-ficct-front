import { api } from "@/lib/api";
import type {
  DataResponse,
  MessageResponse,
  Permission,
  Role,
  SaveRolePayload,
} from "@/lib/types";

export async function listRoles(): Promise<Role[]> {
  const { data } = await api.get<DataResponse<Role[]>>("/auth/roles");
  return data.data;
}

export async function createRole(payload: SaveRolePayload): Promise<Role> {
  const { data } = await api.post<DataResponse<Role>>("/auth/roles", payload);
  return data.data;
}

// Actualiza solo el nombre del rol.
export async function renameRole(id: number, name: string): Promise<Role> {
  const { data } = await api.put<DataResponse<Role>>(`/auth/roles/${id}`, {
    name,
  });
  return data.data;
}

// Reemplaza los permisos del rol (PUT /roles/{id}/permissions).
export async function syncRolePermissions(
  id: number,
  permissions: string[],
): Promise<Role> {
  const { data } = await api.put<DataResponse<Role>>(
    `/auth/roles/${id}/permissions`,
    { permissions },
  );
  return data.data;
}

export async function deleteRole(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/auth/roles/${id}`);
  return data;
}

export async function listPermissions(): Promise<Permission[]> {
  const { data } = await api.get<DataResponse<Permission[]>>("/auth/permissions");
  return data.data;
}
