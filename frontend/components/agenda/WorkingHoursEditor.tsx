"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scheduleService } from "@/services/scheduleService";
import { getApiErrorMessage } from "@/services/api";
import type { WorkingHourInput } from "@/types";

const WEEKDAYS = [
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
}

type WeekState = Record<number, DayState>;

const emptyWeek = (): WeekState =>
  WEEKDAYS.reduce((acc, d) => {
    acc[d.value] = { enabled: false, start: "09:00", end: "18:00" };
    return acc;
  }, {} as WeekState);

/** Editor da grade semanal de horários de trabalho (um intervalo por dia). */
export function WorkingHoursEditor({ barberId }: { barberId: string }) {
  const queryClient = useQueryClient();
  const [week, setWeek] = useState<WeekState>(emptyWeek);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["working-hours", barberId],
    queryFn: () => scheduleService.getWorkingHours(barberId),
  });

  // Popula o estado local a partir dos horários carregados (primeiro intervalo por dia)
  useEffect(() => {
    if (!data) return;
    const next = emptyWeek();
    for (const wh of data) {
      if (next[wh.weekday] && !next[wh.weekday].enabled) {
        next[wh.weekday] = { enabled: true, start: wh.startTime, end: wh.endTime };
      }
    }
    setWeek(next);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (entries: WorkingHourInput[]) => scheduleService.setWorkingHours(barberId, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours", barberId] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setFeedback({ type: "ok", msg: "Horários salvos." });
    },
    onError: (e) => setFeedback({ type: "error", msg: getApiErrorMessage(e) }),
  });

  function update(weekday: number, patch: Partial<DayState>) {
    setWeek((prev) => ({ ...prev, [weekday]: { ...prev[weekday], ...patch } }));
  }

  function save() {
    setFeedback(null);
    const entries: WorkingHourInput[] = [];
    for (const d of WEEKDAYS) {
      const day = week[d.value];
      if (day.enabled) {
        if (day.start >= day.end) {
          setFeedback({ type: "error", msg: `${d.label}: início deve ser antes do fim.` });
          return;
        }
        entries.push({ weekday: d.value, startTime: day.start, endTime: day.end });
      }
    }
    saveMutation.mutate(entries);
  }

  return (
    <Card title="Horários de trabalho" description="Defina os dias e horários de atendimento (um período por dia).">
      {isLoading ? (
        <p className="py-4 text-muted">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {WEEKDAYS.map((d) => {
            const day = week[d.value];
            return (
              <div key={d.value} className="flex flex-wrap items-center gap-3">
                <label className="flex w-32 items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => update(d.value, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-gold"
                  />
                  {d.label}
                </label>
                <input
                  type="time"
                  value={day.start}
                  disabled={!day.enabled}
                  onChange={(e) => update(d.value, { start: e.target.value })}
                  className="h-9 rounded-md border border-border bg-surface-2 px-2 text-sm text-foreground disabled:opacity-40"
                />
                <span className="text-muted">até</span>
                <input
                  type="time"
                  value={day.end}
                  disabled={!day.enabled}
                  onChange={(e) => update(d.value, { end: e.target.value })}
                  className="h-9 rounded-md border border-border bg-surface-2 px-2 text-sm text-foreground disabled:opacity-40"
                />
              </div>
            );
          })}

          {feedback && (
            <p className={feedback.type === "ok" ? "text-sm text-success" : "text-sm text-danger"}>
              {feedback.msg}
            </p>
          )}

          <Button onClick={save} loading={saveMutation.isPending}>
            Salvar horários
          </Button>
        </div>
      )}
    </Card>
  );
}
