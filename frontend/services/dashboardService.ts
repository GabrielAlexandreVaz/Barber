import { api } from "./api";
import type { ApiResponse, DashboardOverview } from "@/types";

export const dashboardService = {
  async overview(params: { from?: string; to?: string; barberId?: string } = {}): Promise<DashboardOverview> {
    const { data } = await api.get<ApiResponse<DashboardOverview>>("/dashboard/overview", { params });
    return data.data;
  },
};
