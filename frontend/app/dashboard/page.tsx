"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { dashboardService } from "@/services/dashboardService";
import { getApiErrorMessage } from "@/services/api";
import { brl, statusClass, statusLabel } from "@/lib/appointment";
import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

const PERIODS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

function fromDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/70 p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function DashboardContent() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => dashboardService.overview({ from: fromDays(days) }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                days === p.days ? "bg-gold text-on-gold" : "text-muted hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Carregando...</p>
      ) : error ? (
        <Card><p className="text-danger">{getApiErrorMessage(error)}</p></Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Agendamentos hoje" value={String(data.metrics.todayAppointments)} />
            <StatCard label="Receita no período" value={brl(data.metrics.periodRevenue)} hint="Atendimentos finalizados" />
            <StatCard label="Atendimentos concluídos" value={String(data.metrics.completed)} />
            <StatCard label="Próximos agendamentos" value={String(data.metrics.upcoming)} hint="Agendados/confirmados" />
            <StatCard label="Clientes atendidos" value={String(data.metrics.clientsServed)} />
            <StatCard label="Cancelados/faltas" value={String(data.metrics.cancelled)} />
          </div>

          <Card>
            <RevenueChart data={data.revenueByDay} />
          </Card>

          <Card title="Agendamentos por status">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(Object.keys(data.byStatus) as AppointmentStatus[]).map((s) => (
                <div key={s} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs", statusClass[s])}>
                    {statusLabel[s]}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{data.byStatus[s]}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth roles={["ADMIN", "BARBER"]}>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </RequireAuth>
  );
}
