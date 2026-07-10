import { api } from "./api";
import type { ApiResponse, BarberReviews } from "@/types";

export const reviewService = {
  async create(appointmentId: string, rating: number, comment?: string): Promise<void> {
    await api.post(`/appointments/${appointmentId}/review`, { rating, comment });
  },

  async byBarber(barberId: string): Promise<BarberReviews> {
    const { data } = await api.get<ApiResponse<BarberReviews>>(`/barbers/${barberId}/reviews`);
    return data.data;
  },
};
