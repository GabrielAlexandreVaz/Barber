export type Role = "CLIENT" | "BARBER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload extends AuthTokens {
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Envelope padrão da API. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
