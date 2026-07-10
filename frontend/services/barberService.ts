import { api } from "./api";
import type {
  ApiResponse,
  Barber,
  CreateBarberInput,
  UpdateBarberInput,
} from "@/types";

export const barberService = {
  async list(includeInactive = false): Promise<Barber[]> {
    const { data } = await api.get<ApiResponse<Barber[]>>("/barbers", {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return data.data;
  },

  async getById(id: string): Promise<Barber> {
    const { data } = await api.get<ApiResponse<Barber>>(`/barbers/${id}`);
    return data.data;
  },

  async create(input: CreateBarberInput): Promise<Barber> {
    const { data } = await api.post<ApiResponse<Barber>>("/barbers", input);
    return data.data;
  },

  async update(id: string, input: UpdateBarberInput): Promise<Barber> {
    const { data } = await api.patch<ApiResponse<Barber>>(`/barbers/${id}`, input);
    return data.data;
  },

  async setStatus(id: string, isActive: boolean): Promise<Barber> {
    const { data } = await api.patch<ApiResponse<Barber>>(`/barbers/${id}/status`, { isActive });
    return data.data;
  },

  // Perfil do próprio barbeiro
  async getMe(): Promise<Barber> {
    const { data } = await api.get<ApiResponse<Barber>>("/barbers/me");
    return data.data;
  },

  async updateMe(input: UpdateBarberInput): Promise<Barber> {
    const { data } = await api.patch<ApiResponse<Barber>>("/barbers/me", input);
    return data.data;
  },
};
