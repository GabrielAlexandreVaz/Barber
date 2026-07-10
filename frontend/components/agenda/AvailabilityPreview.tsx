"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { scheduleService } from "@/services/scheduleService";
import { getApiErrorMessage } from "@/services/api";

/** Prévia dos horários livres — demonstra o cálculo de disponibilidade. */
export function AvailabilityPreview({ barberId }: { barberId: string }) {
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(40);

  const enabled = !!date && duration > 0;

  const { data: slots, isFetching, error } = useQuery({
    queryKey: ["availability", barberId, date, duration],
    queryFn: () => scheduleService.getAvailability(barberId, date, duration),
    enabled,
  });

  return (
    <Card title="Prévia de horários livres" description="Consulte os horários disponíveis para uma data e duração.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Data" htmlFor="av-date">
          <input
            id="av-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
          />
        </Field>
        <Field label="Duração (min)" htmlFor="av-duration">
          <Input
            id="av-duration"
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="mt-5">
        {!enabled ? (
          <p className="text-sm text-muted">Escolha uma data para ver os horários.</p>
        ) : isFetching ? (
          <p className="text-sm text-muted">Calculando...</p>
        ) : error ? (
          <p className="text-sm text-danger">{getApiErrorMessage(error)}</p>
        ) : !slots || slots.length === 0 ? (
          <p className="text-sm text-muted">Nenhum horário livre nesta data.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => (
              <span
                key={s.start}
                className="rounded-lg border border-gold/30 bg-gold/5 px-3 py-1.5 text-sm text-gold"
              >
                {s.time}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
