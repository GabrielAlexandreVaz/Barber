"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/types";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Papéis autorizados; se omitido, basta estar autenticado. */
  roles?: Role[];
}

/**
 * Guarda de rota client-side. Redireciona para /login quando não autenticado
 * e para a home quando o papel não é permitido.
 */
export function RequireAuth({ children, roles }: RequireAuthProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const unauthorized = !isLoading && (!isAuthenticated || (roles && user && !roles.includes(user.role)));

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (roles && user && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, roles, user, router]);

  if (isLoading || unauthorized) {
    return (
      <div className="bg-guetto flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
