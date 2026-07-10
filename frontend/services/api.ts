import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
import type { ApiResponse, AuthPayload } from "@/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Anexa o access token em toda requisição
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Refresh automático em 401 ---
// Evita múltiplos refreshes simultâneos enfileirando as requisições pendentes.
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    // Instância limpa para não entrar em loop de interceptors
    const { data } = await axios.post<ApiResponse<AuthPayload>>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
    );
    tokenStorage.set({
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    });
    return data.data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;

      if (isRefreshing) {
        // Aguarda o refresh em andamento
        const token = await new Promise<string | null>((resolve) => {
          pendingQueue.push(resolve);
        });
        if (!token) return Promise.reject(error);
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }

      isRefreshing = true;
      const newToken = await requestNewAccessToken();
      isRefreshing = false;
      flushQueue(newToken);

      if (!newToken) return Promise.reject(error);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    }

    return Promise.reject(error);
  },
);

/** Extrai uma mensagem de erro amigável de uma falha do Axios. */
export function getApiErrorMessage(error: unknown, fallback = "Algo deu errado."): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string })?.message || fallback;
  }
  return fallback;
}
