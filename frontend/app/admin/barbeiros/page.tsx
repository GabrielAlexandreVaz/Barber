"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarberForm } from "@/components/admin/BarberForm";
import { barberService } from "@/services/barberService";
import { getApiErrorMessage } from "@/services/api";
import type { Barber, CreateBarberInput, UpdateBarberInput } from "@/types";

function BarbersManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Barber | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: barbers, isLoading } = useQuery({
    queryKey: ["barbers", "all"],
    queryFn: () => barberService.list(true),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["barbers"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: CreateBarberInput | UpdateBarberInput) => {
      if (editing) return barberService.update(editing.id, payload as UpdateBarberInput);
      return barberService.create(payload as CreateBarberInput);
    },
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      barberService.setStatus(id, isActive),
    onSuccess: invalidate,
  });

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(barber: Barber) {
    setEditing(barber);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setFormError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Barbeiros</h1>
        {!formOpen && <Button onClick={openCreate}>Novo barbeiro</Button>}
      </div>

      {formOpen && (
        <Card title={editing ? `Editar ${editing.name}` : "Cadastrar barbeiro"}>
          <BarberForm
            barber={editing}
            submitting={saveMutation.isPending}
            error={formError}
            onSubmit={async (payload) => {
              setFormError(null);
              await saveMutation.mutateAsync(payload).catch(() => {});
            }}
            onCancel={closeForm}
          />
        </Card>
      )}

      <Card>
        {isLoading ? (
          <p className="py-6 text-center text-muted">Carregando...</p>
        ) : !barbers || barbers.length === 0 ? (
          <p className="py-6 text-center text-muted">Nenhum barbeiro cadastrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {barbers.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{b.name}</span>
                    {!b.isActive && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {b.specialty || "Sem especialidade"} · {b.email}
                    {(b.reviewsCount ?? 0) > 0 && ` · ★ ${b.averageRating?.toFixed(1)} (${b.reviewsCount})`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => openEdit(b)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: b.id, isActive: !b.isActive })}
                  >
                    {b.isActive ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function AdminBarbeirosPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AppShell>
        <BarbersManager />
      </AppShell>
    </RequireAuth>
  );
}
