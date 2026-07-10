"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/services/api";
import { registerSchema, type RegisterForm } from "@/lib/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterForm) {
    setFormError(null);
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      router.push("/");
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Não foi possível criar a conta."));
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Cadastre-se em segundos e agende seu horário."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-gold hover:text-gold-soft">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Seu nome" {...register("name")} />
        </Field>

        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="voce@email.com" {...register("email")} />
        </Field>

        <Field label="Telefone (opcional)" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" placeholder="(00) 00000-0000" {...register("phone")} />
        </Field>

        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...register("password")} />
        </Field>

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
}
