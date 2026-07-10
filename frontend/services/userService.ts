import { api } from "./api";
import type {
  ApiResponse,
  ChangePasswordInput,
  ListUsersParams,
  ManagedUser,
  PaginatedResponse,
  Role,
  UpdateProfileInput,
  User,
} from "@/types";

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/users/me");
    return data.data;
  },

  async updateProfile(input: UpdateProfileInput): Promise<User> {
    const { data } = await api.patch<ApiResponse<User>>("/users/me", input);
    return data.data;
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await api.patch("/users/me/password", input);
  },

  async list(params: ListUsersParams): Promise<PaginatedResponse<ManagedUser>> {
    const { data } = await api.get<PaginatedResponse<ManagedUser>>("/users", { params });
    return data;
  },

  async setStatus(id: string, isActive: boolean): Promise<ManagedUser> {
    const { data } = await api.patch<ApiResponse<ManagedUser>>(`/users/${id}/status`, { isActive });
    return data.data;
  },

  async updateRole(id: string, role: Role): Promise<ManagedUser> {
    const { data } = await api.patch<ApiResponse<ManagedUser>>(`/users/${id}`, { role });
    return data.data;
  },
};
