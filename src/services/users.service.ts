import { api, fetchFotoObjectUrl } from "@/lib/api";
import type {
  CreateUserPayload,
  DataResponse,
  MessageResponse,
  Paginated,
  UpdateUserPayload,
  User,
} from "@/lib/types";

interface ListUsersParams {
  search?: string;
  role?: string;
  per_page?: number;
}

export async function listUsers(
  params: ListUsersParams = {},
): Promise<Paginated<User>> {
  const { data } = await api.get<Paginated<User>>("/auth/users", { params });
  return data;
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<DataResponse<User>>("/auth/users", payload);
  return data.data;
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await api.put<DataResponse<User>>(`/auth/users/${id}`, payload);
  return data.data;
}

export async function deleteUser(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/auth/users/${id}`);
  return data;
}

export async function uploadUserFoto(id: number, file: File): Promise<User> {
  const form = new FormData();
  form.append("foto", file);
  const { data } = await api.post<DataResponse<User>>(
    `/auth/users/${id}/foto`,
    form,
  );
  return data.data;
}

export function fetchUserFotoUrl(id: number): Promise<string> {
  return fetchFotoObjectUrl(`/api/foto/users/${id}`);
}
