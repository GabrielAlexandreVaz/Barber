"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { WorkingHoursEditor } from "@/components/agenda/WorkingHoursEditor";
import { BlockedDatesManager } from "@/components/agenda/BlockedDatesManager";
import { AvailabilityPreview } from "@/components/agenda/AvailabilityPreview";
import { useAuth } from "@/contexts/AuthContext";
import { barberService } from "@/services/barberService";

/** Barbeiro gerencia a própria agenda. */
function BarberAgenda() {
  const { data: me, isLoading, error } = useQuery({
    queryKey: ["barber-me"],
    queryFn: () => barberService.getMe(),
  });

  if (isLoading) return <p className="text-muted">Carregando...</p>;
  if (error || !me)
    return <Card><p className="text-danger">Perfil de barbeiro não encontrado.</p></Card>;

  return <AgendaSections barberId={me.id} />;
}

/** Admin escolhe qual barbeiro gerenciar. */
function AdminAgenda() {
  const [barberId, setBarberId] = useState("");
  const { data: barbers } = useQuery({
    queryKey: ["barbers", "all"],
    queryFn: () => barberService.list(true),
  });

  return (
    <div className="space-y-6">
      <Card>
        <label className="mb-2 block text-sm font-medium text-muted">Barbeiro</label>
        <select
          value={barberId}
          onChange={(e) => setBarberId(e.target.value)}
          className="h-11 w-full max-w-sm rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
        >
          <option value="">Selecione um barbeiro...</option>
          {barbers?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} {b.isActive ? "" : "(inativo)"}
            </option>
          ))}
        </select>
      </Card>

      {barberId && <AgendaSections barberId={barberId} />}
    </div>
  );
}

function AgendaSections({ barberId }: { barberId: string }) {
  return (
    <div className="space-y-6">
      <WorkingHoursEditor barberId={barberId} />
      <BlockedDatesManager barberId={barberId} />
      <AvailabilityPreview barberId={barberId} />
    </div>
  );
}

function AgendaContent() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
      {user?.role === "ADMIN" ? <AdminAgenda /> : <BarberAgenda />}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <RequireAuth roles={["ADMIN", "BARBER"]}>
      <AppShell>
        <AgendaContent />
      </AppShell>
    </RequireAuth>
  );
}
