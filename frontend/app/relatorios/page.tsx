"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reportService } from "@/services/reportService";
import { getApiErrorMessage } from "@/services/api";
import { brl } from "@/lib/appointment";
import { cn } from "@/lib/utils";

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

function ReportsContent() {
  const [days, setDays] = useState(30);
  const from = fromDays(days);

  const { data, isLoading, error } = useQuery({
    queryKey: ["reports", days],
    queryFn: () => reportService.summary(from),
  });

  const exportMutation = useMutation({
    mutationFn: () => reportService.downloadCsv(from),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <div className="flex items-center gap-3">
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
          <Button variant="outline" loading={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Carregando...</p>
      ) : error ? (
        <Card><p className="text-danger">{getApiErrorMessage(error)}</p></Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Faturamento" value={brl(data.totals.revenue)} hint="Atendimentos finalizados" />
            <StatCard label="Atendimentos" value={String(data.totals.appointments)} />
            <StatCard label="Concluídos" value={String(data.totals.completed)} />
            <StatCard
              label="Taxa de cancelamento"
              value={`${data.totals.cancellationRate}%`}
              hint={`${data.totals.canceled} cancelados/faltas`}
            />
          </div>

          <Card title="Faturamento por barbeiro">
            {data.revenueByBarber.length === 0 ? (
              <p className="text-sm text-muted">Sem dados no período.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                    <th className="py-2">Barbeiro</th>
                    <th className="py-2 text-right">Atendimentos</th>
                    <th className="py-2 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByBarber.map((r) => (
                    <tr key={r.barberId} className="border-b border-border/60">
                      <td className="py-2 text-foreground">{r.barberName}</td>
                      <td className="py-2 text-right text-muted">{r.completed}</td>
                      <td className="py-2 text-right font-medium text-gold">{brl(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="Serviços mais vendidos">
            {data.topServices.length === 0 ? (
              <p className="text-sm text-muted">Sem dados no período.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                    <th className="py-2">Serviço</th>
                    <th className="py-2 text-right">Qtde</th>
                    <th className="py-2 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServices.map((s) => (
                    <tr key={s.serviceId} className="border-b border-border/60">
                      <td className="py-2 text-foreground">{s.serviceName}</td>
                      <td className="py-2 text-right text-muted">{s.count}</td>
                      <td className="py-2 text-right font-medium text-gold">{brl(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}

export default function RelatoriosPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AppShell>
        <ReportsContent />
      </AppShell>
    </RequireAuth>
  );
}
