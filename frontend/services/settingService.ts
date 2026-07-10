import { api } from "./api";
import type { ApiResponse } from "@/types";

export type Settings = Record<string, string>;

/** Normaliza valores para string (o seed pode ter guardado objetos/JSON). */
function normalize(raw: Record<string, unknown>): Settings {
  const out: Settings = {};
  for (const [k, v] of Object.entries(raw)) {
    out[k] = typeof v === "string" ? v : v == null ? "" : "";
  }
  return out;
}

export const settingService = {
  async getAll(): Promise<Settings> {
    const { data } = await api.get<ApiResponse<Record<string, unknown>>>("/settings");
    return normalize(data.data);
  },

  async update(settings: Settings): Promise<Settings> {
    const { data } = await api.put<ApiResponse<Record<string, unknown>>>("/settings", settings);
    return normalize(data.data);
  },
};
