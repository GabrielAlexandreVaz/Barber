"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { scheduleService } from "@/services/scheduleService";
import { getApiErrorMessage } from "@/services/api";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Gerencia folgas/bloqueios do barbeiro. */
export function BlockedDatesManager({ barberId }: { barberId: string }) {
  const queryClient = useQueryClient();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["blocked-dates", barberId],
    queryFn: () => scheduleService.listBlockedDates(barberId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["blocked-dates", barberId] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const createMutation = useMutation({
    mutationFn: () =>
      scheduleService.createBlockedDate(barberId, {
        // datetime-local retorna "YYYY-MM-DDTHH:mm" (hora local) — enviado como está
        startAt: start,
        endAt: end,
        reason: reason.trim() || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setStart("");
      setEnd("");
      setReason("");
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleService.deleteBlockedDate(barberId, id),
    onSuccess: invalidate,
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  function add() {
    setError(null);
    if (!start || !end) {
      setError("Informe início e fim do bloqueio.");
      return;
    }
    if (start >= end) {
      setError("O início deve ser antes do fim.");
      return;
    }
    createMutation.mutate();
  }

  return (
    <Card title="Folgas e bloqueios" description="Períodos em que o barbeiro não estará disponível.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Início" htmlFor="blk-start">
          <input
            id="blk-start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
          />
        </Field>
        <Field label="Fim" htmlFor="blk-end">
          <input
            id="blk-end"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Motivo (opcional)" htmlFor="blk-reason">
          <Input id="blk-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: folga, feriado" />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <Button className="mt-4" onClick={add} loading={createMutation.isPending}>
        Adicionar bloqueio
      </Button>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-muted">Carregando...</p>
        ) : !blocks || blocks.length === 0 ? (
          <p className="text-sm text-muted">Nenhum bloqueio nos próximos 60 dias.</p>
        ) : (
          <ul className="divide-y divide-border">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">
                    {fmt(b.startAt)} → {fmt(b.endAt)}
                  </p>
                  {b.reason && <p className="text-xs text-muted">{b.reason}</p>}
                </div>
                <Button
                  variant="ghost"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(b.id)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
