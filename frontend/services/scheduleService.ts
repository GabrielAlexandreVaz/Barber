import { api } from "./api";
import type {
  ApiResponse,
  AvailabilitySlot,
  BlockedDate,
  CreateBlockedDateInput,
  WorkingHour,
  WorkingHourInput,
} from "@/types";

export const scheduleService = {
  async getWorkingHours(barberId: string): Promise<WorkingHour[]> {
    const { data } = await api.get<ApiResponse<WorkingHour[]>>(`/barbers/${barberId}/working-hours`);
    return data.data;
  },

  async setWorkingHours(barberId: string, entries: WorkingHourInput[]): Promise<WorkingHour[]> {
    const { data } = await api.put<ApiResponse<WorkingHour[]>>(
      `/barbers/${barberId}/working-hours`,
      { entries },
    );
    return data.data;
  },

  async listBlockedDates(barberId: string, from?: string, to?: string): Promise<BlockedDate[]> {
    const { data } = await api.get<ApiResponse<BlockedDate[]>>(
      `/barbers/${barberId}/blocked-dates`,
      { params: { from, to } },
    );
    return data.data;
  },

  async createBlockedDate(barberId: string, input: CreateBlockedDateInput): Promise<BlockedDate> {
    const { data } = await api.post<ApiResponse<BlockedDate>>(
      `/barbers/${barberId}/blocked-dates`,
      input,
    );
    return data.data;
  },

  async deleteBlockedDate(barberId: string, blockedId: string): Promise<void> {
    await api.delete(`/barbers/${barberId}/blocked-dates/${blockedId}`);
  },

  async getAvailability(
    barberId: string,
    date: string,
    duration: number,
    step?: number,
  ): Promise<AvailabilitySlot[]> {
    const { data } = await api.get<ApiResponse<AvailabilitySlot[]>>(
      `/barbers/${barberId}/availability`,
      { params: { date, duration, step } },
    );
    return data.data;
  },
};
