"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService } from "@/services/appointmentService";
import { getApiErrorMessage } from "@/services/api";
import { brl, formatDateTime, statusClass, statusLabel } from "@/lib/appointment";
import type { Appointment, AppointmentStatus } from "@/types";

const STATUS_OPTIONS: (AppointmentStatus | "")[] = [
  "",
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const LIMIT = 10;

function AppointmentRow({ appt, isStaff }: { appt: Appointment; isStaff: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="py-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{formatDateTime(appt.startTime)}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[appt.status]}`}>
              {statusLabel[appt.status]}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-muted">
            {appt.services.map((s) => s.name).join(", ")} · {brl(appt.totalPrice)}
          </p>
        </div>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-border bg-surface-2/50 p-4 text-sm">
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted">Barbeiro</dt>
              <dd className="text-foreground">{appt.barber.name}</dd>
            </div>
            {isStaff && (
              <div className="flex justify-between">
                <dt className="text-muted">Cliente</dt>
                <dd className="text-foreground">{appt.client.name}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">Duração</dt>
              <dd className="text-foreground">{appt.totalDuration} min</dd>
            </div>
          </dl>

          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">Serviços</p>
            <ul className="space-y-1">
              {appt.services.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span className="text-foreground">{s.name} <span className="text-muted">({s.durationMinutes}min)</span></span>
                  <span className="text-muted">{brl(s.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-gold">{brl(appt.totalPrice)}</span>
            </div>
          </div>

          {appt.notes && (
            <p className="mt-3 text-muted">
              <span className="text-foreground">Obs.:</span> {appt.notes}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

function History() {
  const { user } = useAuth();
  const isStaff = user?.role === "ADMIN" || user?.role === "BARBER";

  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["history", status, from, to, page],
    queryFn: () =>
      appointmentService.history({
        page,
        limit: LIMIT,
        status: status || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Histórico</h1>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Status</label>
            <select
              value={status}
              onChange={(e) => resetToFirstPage(setStatus)(e.target.value as AppointmentStatus | "")}
              className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground focus:border-gold/60 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s || "all"} value={s}>
                  {s ? statusLabel[s] : "Todos"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">De</label>
            <input
              type="date"
              value={from}
              onChange={(e) => resetToFirstPage(setFrom)(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Até</label>
            <input
              type="date"
              value={to}
              onChange={(e) => resetToFirstPage(setTo)(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
            />
          </div>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <p className="py-6 text-center text-muted">Carregando...</p>
        ) : error ? (
          <p className="py-6 text-center text-danger">{getApiErrorMessage(error)}</p>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-muted">Nenhum atendimento encontrado para o filtro.</p>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <AppointmentRow key={a.id} appt={a} isStaff={isStaff} />
              ))}
            </ul>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between text-sm text-muted">
                <span>
                  Página {pagination.page} de {pagination.totalPages} · {pagination.total} registros
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
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
          </>
        )}
      </Card>
    </div>
  );
}

export default function HistoricoPage() {
  return (
    <RequireAuth>
      <AppShell>
        <History />
      </AppShell>
    </RequireAuth>
  );
}
