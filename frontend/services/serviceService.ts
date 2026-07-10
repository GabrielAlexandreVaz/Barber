import { api } from "./api";
import type {
  ApiResponse,
  CreateServiceInput,
  Service,
  UpdateServiceInput,
} from "@/types";

export const serviceService = {
  async list(includeInactive = false): Promise<Service[]> {
    const { data } = await api.get<ApiResponse<Service[]>>("/services", {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return data.data;
  },

  async create(input: CreateServiceInput): Promise<Service> {
    const { data } = await api.post<ApiResponse<Service>>("/services", input);
    return data.data;
  },

  async update(id: string, input: UpdateServiceInput): Promise<Service> {
    const { data } = await api.patch<ApiResponse<Service>>(`/services/${id}`, input);
    return data.data;
  },

  async setStatus(id: string, isActive: boolean): Promise<Service> {
    const { data } = await api.patch<ApiResponse<Service>>(`/services/${id}/status`, { isActive });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
