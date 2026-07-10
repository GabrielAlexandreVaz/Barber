import { api } from "./api";
import type { ApiResponse, ReportSummary } from "@/types";

export const reportService = {
  async summary(from?: string, to?: string): Promise<ReportSummary> {
    const { data } = await api.get<ApiResponse<ReportSummary>>("/reports/summary", {
      params: { from, to },
    });
    return data.data;
  },

  /** Baixa o CSV do período (autenticado via blob) e dispara o download. */
  async downloadCsv(from?: string, to?: string): Promise<void> {
    const res = await api.get("/reports/export", {
      params: { from, to },
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
