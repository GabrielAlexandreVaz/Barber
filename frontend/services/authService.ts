import { api } from "./api";
import { tokenStorage } from "./tokenStorage";
import type {
  ApiResponse,
  AuthPayload,
  LoginInput,
  RegisterInput,
  User,
} from "@/types";

export const authService = {
  async register(input: RegisterInput): Promise<AuthPayload> {
    const { data } = await api.post<ApiResponse<AuthPayload>>("/auth/register", input);
    tokenStorage.set(data.data);
    return data.data;
  },

  async login(input: LoginInput): Promise<AuthPayload> {
    const { data } = await api.post<ApiResponse<AuthPayload>>("/auth/login", input);
    tokenStorage.set(data.data);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");
    return data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefresh();
    try {
      await api.post("/auth/logout", { refreshToken });
    } finally {
      tokenStorage.clear();
    }
  },
};
