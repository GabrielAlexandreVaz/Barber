"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { ImageUpload } from "@/components/ui/image-upload";
import { settingService, type Settings } from "@/services/settingService";
import { getApiErrorMessage } from "@/services/api";

const FIELDS: { key: string; label: string; textarea?: boolean }[] = [
  { key: "shop.name", label: "Nome da barbearia" },
  { key: "shop.phone", label: "Telefone" },
  { key: "shop.email", label: "E-mail" },
  { key: "shop.instagram", label: "Instagram" },
  { key: "shop.address", label: "Endereço" },
  { key: "shop.openingHours", label: "Horário de funcionamento", textarea: true },
  { key: "shop.about", label: "Sobre a barbearia", textarea: true },
];

function SettingsForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Settings>({});
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingService.getAll(),
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => settingService.update(form),
    onSuccess: (updated) => {
      setForm(updated);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setFeedback({ type: "ok", msg: "Configurações salvas." });
    },
    onError: (e) => setFeedback({ type: "error", msg: getApiErrorMessage(e) }),
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  if (isLoading) {
    return <Card><p className="text-muted">Carregando...</p></Card>;
  }

  return (
    <div className="space-y-6">
      <Card title="Identidade">
        <ImageUpload
          label="Logo da barbearia"
          value={form["shop.logoUrl"]}
          onChange={(path) => set("shop.logoUrl", path)}
        />
      </Card>

      <Card title="Informações">
        <div className="space-y-4">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} htmlFor={f.key}>
              {f.textarea ? (
                <Textarea
                  id={f.key}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <Input id={f.key} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
              )}
            </Field>
          ))}

          {feedback && (
            <p className={feedback.type === "ok" ? "text-sm text-success" : "text-sm text-danger"}>
              {feedback.msg}
            </p>
          )}

          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Salvar configurações
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ConfiguracoesPage() {
  return (
    <RequireAuth roles={["ADMIN"]}>
      <AppShell>
        <h1 className="mb-6 text-2xl font-bold text-foreground">Configurações</h1>
        <SettingsForm />
      </AppShell>
    </RequireAuth>
  );
}
