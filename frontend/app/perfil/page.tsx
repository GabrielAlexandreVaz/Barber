"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";
import { BarberProfileCard } from "@/components/perfil/BarberProfileCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import { getApiErrorMessage } from "@/services/api";
import {
  profileSchema,
  changePasswordSchema,
  type ProfileForm,
  type ChangePasswordForm,
} from "@/lib/schemas";

function ProfileInfoCard() {
  const { user, updateUser } = useAuth();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" },
  });

  async function onSubmit(values: ProfileForm) {
    setFeedback(null);
    try {
      const updated = await userService.updateProfile({
        name: values.name,
        phone: values.phone || null,
      });
      updateUser({ name: updated.name, phone: updated.phone });
      setFeedback({ type: "ok", msg: "Perfil atualizado com sucesso." });
    } catch (err) {
      setFeedback({ type: "error", msg: getApiErrorMessage(err) });
    }
  }

  return (
    <Card title="Meus dados" description="Atualize suas informações pessoais.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" value={user?.email ?? ""} disabled />
        </Field>
        <Field label="Telefone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" placeholder="(00) 00000-0000" {...register("phone")} />
        </Field>

        {feedback && (
          <p className={feedback.type === "ok" ? "text-sm text-success" : "text-sm text-danger"}>
            {feedback.msg}
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </Card>
  );
}

function ChangePasswordCard() {
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordForm) {
    setFeedback(null);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setFeedback({ type: "ok", msg: "Senha alterada com sucesso." });
    } catch (err) {
      setFeedback({ type: "error", msg: getApiErrorMessage(err) });
    }
  }

  return (
    <Card title="Segurança" description="Altere sua senha de acesso.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Senha atual" htmlFor="currentPassword" error={errors.currentPassword?.message}>
          <Input id="currentPassword" type="password" autoComplete="current-password" {...register("currentPassword")} />
        </Field>
        <Field label="Nova senha" htmlFor="newPassword" error={errors.newPassword?.message}>
          <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
        </Field>
        <Field label="Confirmar nova senha" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </Field>

        {feedback && (
          <p className={feedback.type === "ok" ? "text-sm text-success" : "text-sm text-danger"}>
            {feedback.msg}
          </p>
        )}

        <Button type="submit" loading={isSubmitting}>
          Alterar senha
        </Button>
      </form>
    </Card>
  );
}

function PerfilContent() {
  const { user } = useAuth();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Meu perfil</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileInfoCard />
        <ChangePasswordCard />
      </div>
      {user?.role === "BARBER" && (
        <div className="mt-6">
          <BarberProfileCard />
        </div>
      )}
    </>
  );
}

export default function PerfilPage() {
  return (
    <RequireAuth>
      <AppShell>
        <PerfilContent />
      </AppShell>
    </RequireAuth>
  );
}
