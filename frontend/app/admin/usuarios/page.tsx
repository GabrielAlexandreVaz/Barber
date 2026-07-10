"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userService } from "@/services/userService";
import { getApiErrorMessage } from "@/services/api";
import type { ManagedUser, Role } from "@/types";

const ROLES: Role[] = ["CLIENT", "BARBER", "ADMIN"];

const roleLabel: Record<Role, string> = {
  CLIENT: "Cliente",
  BARBER: "Barbeiro",
  ADMIN: "Admin",
};

function UsersTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["users", { search: debounced, page }],
    queryFn: () => userService.list({ search: debounced || undefined, page, limit: 10 }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.setStatus(id, isActive),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => userService.updateRole(id, role),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setDebounced(search.trim());
  }

  const users = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <Card>
      <form onSubmit={applySearch} className="mb-5 flex gap-2">
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-3">Usuário</th>
              <th className="px-3 py-3">Papel</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              users.map((u: ManagedUser) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="px-3 py-3">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={u.role.name}
                      onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value as Role })}
                      disabled={roleMutation.isPending}
                      className="h-9 rounded-md border border-border bg-surface-2 px-2 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {roleLabel[r]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        u.isActive
                          ? "rounded-full bg-success/10 px-2.5 py-1 text-xs text-success"
                          : "rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger"
                      }
                    >
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => statusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                      disabled={statusMutation.isPending}
                    >
                      {u.isActive ? "Desativar" : "Ativar"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted">
          <span>
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} usuários
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={page >= pagination.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminUsuariosPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AppShell>
        <h1 className="mb-6 text-2xl font-bold text-foreground">Usuários</h1>
        <UsersTable />
      </AppShell>
    </RequireAuth>
  );
}
