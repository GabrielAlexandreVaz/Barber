import type { AuthTokens } from "@/types";

const ACCESS_KEY = "tg.accessToken";
const REFRESH_KEY = "tg.refreshToken";

const isBrowser = () => typeof window !== "undefined";

/** Persistência dos tokens no localStorage (SPA sob domínio próprio na VPS). */
export const tokenStorage = {
  getAccess(): string | null {
    return isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;
  },
  getRefresh(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;
  },
  set({ accessToken, refreshToken }: AuthTokens) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
