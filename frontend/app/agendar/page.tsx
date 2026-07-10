"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Stars } from "@/components/ui/stars";
import { fileUrl } from "@/lib/media";
import { brl, todayISODate, formatTime } from "@/lib/appointment";
import { serviceService } from "@/services/serviceService";
import { barberService } from "@/services/barberService";
import { scheduleService } from "@/services/scheduleService";
import { appointmentService } from "@/services/appointmentService";
import { getApiErrorMessage } from "@/services/api";

function Stepper({ step }: { step: number }) {
  const labels = ["Serviços", "Barbeiro", "Data e hora", "Confirmar"];
  return (
    <div className="mb-6 flex items-center gap-2">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              i <= step ? "bg-gold text-on-gold" : "bg-surface-2 text-muted",
            )}
          >
            {i + 1}
          </span>
          <span className={cn("hidden text-sm sm:inline", i === step ? "text-foreground" : "text-muted")}>
            {label}
          </span>
          {i < labels.length - 1 && <span className="mx-1 h-px w-6 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: services } = useQuery({ queryKey: ["services"], queryFn: () => serviceService.list() });
  const { data: barbers } = useQuery({ queryKey: ["barbers"], queryFn: () => barberService.list() });

  const selectedServices = useMemo(
    () => (services ?? []).filter((s) => serviceIds.includes(s.id)),
    [services, serviceIds],
  );
  const totalDuration = selectedServices.reduce((a, s) => a + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((a, s) => a + s.price, 0);
  const selectedBarber = (barbers ?? []).find((b) => b.id === barberId);

  const { data: slots, isFetching: loadingSlots } = useQuery({
    queryKey: ["availability", barberId, date, totalDuration],
    queryFn: () => scheduleService.getAvailability(barberId, date, totalDuration),
    enabled: step === 2 && !!barberId && !!date && totalDuration > 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      appointmentService.create({ barberId, serviceIds, startTime: slotStart }),
    onSuccess: () => router.push("/agendamentos"),
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setSlotStart("");
  }

  const canNext =
    (step === 0 && serviceIds.length > 0) ||
    (step === 1 && !!barberId) ||
    (step === 2 && !!slotStart);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Agendar horário</h1>
      <Stepper step={step} />

      {step === 0 && (
        <Card title="Escolha os serviços">
          <div className="grid gap-3 sm:grid-cols-2">
            {services?.map((s) => {
              const active = serviceIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    active ? "border-gold bg-gold/5" : "border-border hover:border-gold/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <span className="text-gold">{brl(s.price)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{s.durationMinutes} min</p>
                </button>
              );
            })}
          </div>
          {serviceIds.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              Total: <span className="text-foreground">{brl(totalPrice)}</span> · {totalDuration} min
            </p>
          )}
        </Card>
      )}

      {step === 1 && (
        <Card title="Escolha o barbeiro">
          <div className="grid gap-3 sm:grid-cols-2">
            {barbers?.map((b) => {
              const active = barberId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBarberId(b.id);
                    setSlotStart("");
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    active ? "border-gold bg-gold/5" : "border-border hover:border-gold/40",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {fileUrl(b.photoUrl) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileUrl(b.photoUrl)!}
                        alt={b.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">{b.name}</span>
                        {(b.reviewsCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-xs text-gold">
                            <Stars value={b.averageRating ?? 0} /> {b.averageRating?.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {b.specialty && <p className="mt-1 text-xs text-muted">{b.specialty}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Escolha a data e o horário">
          <label className="mb-1 block text-sm font-medium text-muted">Data</label>
          <input
            type="date"
            min={todayISODate()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlotStart("");
            }}
            className="h-11 rounded-lg border border-border bg-surface-2 px-3 text-sm text-foreground"
          />

          <div className="mt-5">
            {!date ? (
              <p className="text-sm text-muted">Selecione uma data.</p>
            ) : loadingSlots ? (
              <p className="text-sm text-muted">Buscando horários...</p>
            ) : !slots || slots.length === 0 ? (
              <p className="text-sm text-muted">Nenhum horário livre nesta data.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => setSlotStart(s.start)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      slotStart === s.start
                        ? "border-gold bg-gold text-on-gold"
                        : "border-gold/30 text-gold hover:bg-gold/10",
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Confirme seu agendamento">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Serviços</dt>
              <dd className="text-right text-foreground">
                {selectedServices.map((s) => s.name).join(", ")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Barbeiro</dt>
              <dd className="text-foreground">{selectedBarber?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Horário</dt>
              <dd className="text-foreground">
                {new Date(date).toLocaleDateString("pt-BR")} às {slotStart && formatTime(slotStart)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="text-muted">Total</dt>
              <dd className="font-semibold text-gold">
                {brl(totalPrice)} · {totalDuration} min
              </dd>
            </div>
          </dl>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        </Card>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Voltar
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Continuar
          </Button>
        ) : (
          <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
            Confirmar agendamento
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AgendarPage() {
  return (
    <RequireAuth roles={["CLIENT", "ADMIN"]}>
      <AppShell>
        <Wizard />
      </AppShell>
    </RequireAuth>
  );
}
