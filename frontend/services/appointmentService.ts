import { api } from "./api";
import type {
  ApiResponse,
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  ListAppointmentsParams,
  Pagination,
} from "@/types";

export interface HistoryParams extends ListAppointmentsParams {
  page?: number;
  limit?: number;
}

export interface HistoryResult {
  items: Appointment[];
  pagination: Pagination | null;
}

export const appointmentService = {
  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const { data } = await api.post<ApiResponse<Appointment>>("/appointments", input);
    return data.data;
  },

  async list(params: ListAppointmentsParams = {}): Promise<Appointment[]> {
    const { data } = await api.get<ApiResponse<Appointment[]>>("/appointments", { params });
    return data.data;
  },

  /** Listagem paginada para o histórico. */
  async history(params: HistoryParams): Promise<HistoryResult> {
    const { data } = await api.get<ApiResponse<Appointment[]> & { pagination: Pagination | null }>(
      "/appointments",
      { params },
    );
    return { items: data.data, pagination: data.pagination };
  },

  async getById(id: string): Promise<Appointment> {
    const { data } = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return data.data;
  },

  async cancel(id: string): Promise<Appointment> {
    const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
    return data.data;
  },

  async setStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status });
    return data.data;
  },

  async reschedule(id: string, startTime: string): Promise<Appointment> {
    const { data } = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, { startTime });
    return data.data;
  },
};
