"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { serviceService } from "@/services/serviceService";
import { getApiErrorMessage } from "@/services/api";
import type { CreateServiceInput, Service } from "@/types";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ServicesManager() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => serviceService.list(true),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["services"] });

  const saveMutation = useMutation({
    mutationFn: async (payload: CreateServiceInput) =>
      editing ? serviceService.update(editing.id, payload) : serviceService.create(payload),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      serviceService.setStatus(id, isActive),
    onSuccess: invalidate,
    onError: (e) => setListError(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => serviceService.remove(id),
    onSuccess: invalidate,
    onError: (e) => setListError(getApiErrorMessage(e)),
  });

  function openCreate() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }
  function openEdit(service: Service) {
    setEditing(service);
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
        <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
        {!formOpen && <Button onClick={openCreate}>Novo serviço</Button>}
      </div>

      {formOpen && (
        <Card title={editing ? `Editar ${editing.name}` : "Cadastrar serviço"}>
          <ServiceForm
            service={editing}
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
        {listError && <p className="mb-4 text-sm text-danger">{listError}</p>}
        {isLoading ? (
          <p className="py-6 text-center text-muted">Carregando...</p>
        ) : !services || services.length === 0 ? (
          <p className="py-6 text-center text-muted">Nenhum serviço cadastrado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {services.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{s.name}</span>
                    {!s.isActive && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {brl(s.price)} · {s.durationMinutes} min
                    {s.category ? ` · ${s.category}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => openEdit(s)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: s.id, isActive: !s.isActive })}
                  >
                    {s.isActive ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (confirm(`Remover o serviço "${s.name}"?`)) deleteMutation.mutate(s.id);
                    }}
                  >
                    Remover
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

export default function AdminServicosPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AppShell>
        <ServicesManager />
      </AppShell>
    </RequireAuth>
  );
}
