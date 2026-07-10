"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  createBarberSchema,
  editBarberSchema,
  type CreateBarberForm,
} from "@/lib/schemas";
import type { Barber, CreateBarberInput, UpdateBarberInput } from "@/types";

interface BarberFormProps {
  /** Barbeiro em edição; null = criação. */
  barber: Barber | null;
  onSubmit: (data: CreateBarberInput | UpdateBarberInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string | null;
}

/** Formulário de criação/edição de barbeiro (compartilha os campos de perfil). */
export function BarberForm({ barber, onSubmit, onCancel, submitting, error }: BarberFormProps) {
  const isEdit = !!barber;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBarberForm>({
    // Ambos os schemas validam o subconjunto de perfil; no modo edição os campos
    // email/senha não são renderizados. Cast necessário pois os schemas diferem.
    resolver: zodResolver(isEdit ? editBarberSchema : createBarberSchema) as unknown as Resolver<CreateBarberForm>,
    defaultValues: {
      name: barber?.name ?? "",
      email: "",
      password: "",
      phone: barber?.phone ?? "",
      specialty: barber?.specialty ?? "",
      bio: barber?.bio ?? "",
      photoUrl: barber?.photoUrl ?? "",
      instagram: barber?.instagram ?? "",
    },
  });

  async function submit(values: CreateBarberForm) {
    // Normaliza strings vazias -> undefined (não enviar campo)
    const clean = (v?: string) => (v && v.trim() !== "" ? v.trim() : undefined);

    if (isEdit) {
      const payload: UpdateBarberInput = {
        name: values.name,
        phone: clean(values.phone) ?? null,
        specialty: clean(values.specialty) ?? null,
        bio: clean(values.bio) ?? null,
        photoUrl: clean(values.photoUrl) ?? null,
        instagram: clean(values.instagram) ?? null,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateBarberInput = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: clean(values.phone),
        specialty: clean(values.specialty),
        bio: clean(values.bio),
        photoUrl: clean(values.photoUrl),
        instagram: clean(values.instagram),
      };
      await onSubmit(payload);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="bf-name" error={errors.name?.message}>
          <Input id="bf-name" {...register("name")} />
        </Field>
        <Field label="Telefone" htmlFor="bf-phone" error={errors.phone?.message}>
          <Input id="bf-phone" placeholder="(00) 00000-0000" {...register("phone")} />
        </Field>
      </div>

      {!isEdit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="bf-email" error={errors.email?.message}>
            <Input id="bf-email" type="email" {...register("email")} />
          </Field>
          <Field label="Senha inicial" htmlFor="bf-password" error={errors.password?.message}>
            <Input id="bf-password" type="password" autoComplete="new-password" {...register("password")} />
          </Field>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Especialidade" htmlFor="bf-specialty" error={errors.specialty?.message}>
          <Input id="bf-specialty" placeholder="Ex.: degradê, navalhado" {...register("specialty")} />
        </Field>
        <Field label="Instagram" htmlFor="bf-instagram" error={errors.instagram?.message}>
          <Input id="bf-instagram" placeholder="@usuario" {...register("instagram")} />
        </Field>
      </div>

      <ImageUpload
        label="Foto do barbeiro"
        value={watch("photoUrl")}
        onChange={(path) => setValue("photoUrl", path)}
      />
      {errors.photoUrl?.message && <p className="text-xs text-danger">{errors.photoUrl.message}</p>}

      <Field label="Biografia" htmlFor="bf-bio" error={errors.bio?.message}>
        <Textarea id="bf-bio" placeholder="Um pouco sobre o barbeiro..." {...register("bio")} />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {isEdit ? "Salvar" : "Cadastrar barbeiro"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
