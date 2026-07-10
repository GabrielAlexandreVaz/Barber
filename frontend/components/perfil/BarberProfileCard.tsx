"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { ImageUpload } from "@/components/ui/image-upload";
import { barberService } from "@/services/barberService";
import { getApiErrorMessage } from "@/services/api";

/** Card para o barbeiro editar o próprio perfil profissional (foto, bio, etc.). */
export function BarberProfileCard() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ specialty: "", bio: "", instagram: "", photoUrl: "" });
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const { data: me, isLoading, error } = useQuery({
    queryKey: ["barber-me"],
    queryFn: () => barberService.getMe(),
  });

  useEffect(() => {
    if (me) {
      setForm({
        specialty: me.specialty ?? "",
        bio: me.bio ?? "",
        instagram: me.instagram ?? "",
        photoUrl: me.photoUrl ?? "",
      });
    }
  }, [me]);

  const mutation = useMutation({
    mutationFn: () =>
      barberService.updateMe({
        specialty: form.specialty.trim() || null,
        bio: form.bio.trim() || null,
        instagram: form.instagram.trim() || null,
        photoUrl: form.photoUrl || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber-me"] });
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      setFeedback({ type: "ok", msg: "Perfil profissional atualizado." });
    },
    onError: (e) => setFeedback({ type: "error", msg: getApiErrorMessage(e) }),
  });

  if (isLoading) {
    return <Card title="Perfil profissional"><p className="text-muted">Carregando...</p></Card>;
  }
  if (error || !me) {
    return (
      <Card title="Perfil profissional">
        <p className="text-danger">Não foi possível carregar o perfil de barbeiro.</p>
      </Card>
    );
  }

  return (
    <Card title="Perfil profissional" description="Sua foto e informações exibidas aos clientes.">
      <div className="space-y-4">
        <ImageUpload
          label="Foto do perfil"
          value={form.photoUrl}
          onChange={(path) => setForm((f) => ({ ...f, photoUrl: path }))}
        />

        <Field label="Especialidade" htmlFor="bp-specialty">
          <Input
            id="bp-specialty"
            value={form.specialty}
            onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
            placeholder="Ex.: degradê, navalhado"
          />
        </Field>

        <Field label="Instagram" htmlFor="bp-instagram">
          <Input
            id="bp-instagram"
            value={form.instagram}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
            placeholder="@usuario"
          />
        </Field>

        <Field label="Biografia" htmlFor="bp-bio">
          <Textarea
            id="bp-bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Um pouco sobre você..."
          />
        </Field>

        {feedback && (
          <p className={feedback.type === "ok" ? "text-sm text-success" : "text-sm text-danger"}>
            {feedback.msg}
          </p>
        )}

        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
          Salvar perfil profissional
        </Button>
      </div>
    </Card>
  );
}
