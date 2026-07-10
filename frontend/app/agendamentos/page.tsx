"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { ReviewDialog } from "@/components/reviews/ReviewDialog";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService } from "@/services/appointmentService";
import { getApiErrorMessage } from "@/services/api";
import { brl, formatDateTime, statusClass, statusLabel } from "@/lib/appointment";
import type { Appointment, AppointmentStatus } from "@/types";

// Próximo status sugerido para o fluxo de atendimento (barbeiro/admin)
const NEXT_STATUS: Partial<Record<AppointmentStatus, { to: AppointmentStatus; label: string }>> = {
  SCHEDULED: { to: "CONFIRMED", label: "Confirmar" },
  CONFIRMED: { to: "IN_PROGRESS", label: "Iniciar" },
  IN_PROGRESS: { to: "COMPLETED", label: "Finalizar" },
};

function AppointmentList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isStaff = user?.role === "ADMIN" || user?.role === "BARBER";
  const [reviewFor, setReviewFor] = useState<string | null>(null);

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentService.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["appointments"] });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentService.cancel(id),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      appointmentService.setStatus(id, status),
    onSuccess: invalidate,
  });

  const noShowMutation = useMutation({
    mutationFn: (id: string) => appointmentService.setStatus(id, "NO_SHOW"),
    onSuccess: invalidate,
  });

  const canCancel = (a: Appointment) => ["SCHEDULED", "CONFIRMED"].includes(a.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
        {user?.role === "CLIENT" && (
          <Link href="/agendar">
            <Button>Novo agendamento</Button>
          </Link>
        )}
      </div>

      <Card>
        {isLoading ? (
          <p className="py-6 text-center text-muted">Carregando...</p>
        ) : error ? (
          <p className="py-6 text-center text-danger">{getApiErrorMessage(error)}</p>
        ) : !appointments || appointments.length === 0 ? (
          <p className="py-6 text-center text-muted">Nenhum agendamento por aqui ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {appointments.map((a) => {
              const next = isStaff ? NEXT_STATUS[a.status] : undefined;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{formatDateTime(a.startTime)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[a.status]}`}>
                        {statusLabel[a.status]}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted">
                      {a.services.map((s) => s.name).join(", ")} · {brl(a.totalPrice)}
                    </p>
                    <p className="text-xs text-muted">
                      {isStaff ? `Cliente: ${a.client.name}` : `Barbeiro: ${a.barber.name}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Avaliação: cliente, atendimento finalizado */}
                    {user?.role === "CLIENT" && a.status === "COMPLETED" && (
                      a.review ? (
                        <Stars value={a.review.rating} />
                      ) : (
                        <Button variant="outline" onClick={() => setReviewFor(a.id)}>
                          Avaliar
                        </Button>
                      )
                    )}
                    {next && (
                      <Button
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: a.id, status: next.to })}
                      >
                        {next.label}
                      </Button>
                    )}
                    {isStaff && ["SCHEDULED", "CONFIRMED"].includes(a.status) && (
                      <Button
                        variant="ghost"
                        disabled={noShowMutation.isPending}
                        onClick={() => noShowMutation.mutate(a.id)}
                      >
                        Faltou
                      </Button>
                    )}
                    {canCancel(a) && (
                      <Button
                        variant="ghost"
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                          if (confirm("Cancelar este agendamento?")) cancelMutation.mutate(a.id);
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {reviewFor && <ReviewDialog appointmentId={reviewFor} onClose={() => setReviewFor(null)} />}
    </div>
  );
}

export default function AgendamentosPage() {
  return (
    <RequireAuth>
      <AppShell>
        <AppointmentList />
      </AppShell>
    </RequireAuth>
  );
}
