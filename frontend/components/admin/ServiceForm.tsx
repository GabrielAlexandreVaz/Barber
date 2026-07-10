"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { ImageUpload } from "@/components/ui/image-upload";
import { serviceSchema, type ServiceForm as ServiceFormValues } from "@/lib/schemas";
import type { CreateServiceInput, Service } from "@/types";

interface ServiceFormProps {
  service: Service | null;
  onSubmit: (data: CreateServiceInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  error?: string | null;
}

/** Formulário de criação/edição de serviço. */
export function ServiceForm({ service, onSubmit, onCancel, submitting, error }: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name ?? "",
      price: service?.price ?? 0,
      durationMinutes: service?.durationMinutes ?? 30,
      category: service?.category ?? "",
      description: service?.description ?? "",
      imageUrl: service?.imageUrl ?? "",
    },
  });

  async function submit(values: ServiceFormValues) {
    const clean = (v?: string) => (v && v.trim() !== "" ? v.trim() : undefined);
    await onSubmit({
      name: values.name,
      price: values.price,
      durationMinutes: values.durationMinutes,
      category: clean(values.category),
      description: clean(values.description),
      imageUrl: clean(values.imageUrl),
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <Field label="Nome" htmlFor="sf-name" error={errors.name?.message}>
        <Input id="sf-name" {...register("name")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Preço (R$)" htmlFor="sf-price" error={errors.price?.message}>
          <Input id="sf-price" type="number" step="0.01" min="0" {...register("price", { valueAsNumber: true })} />
        </Field>
        <Field label="Duração (min)" htmlFor="sf-duration" error={errors.durationMinutes?.message}>
          <Input id="sf-duration" type="number" min="1" {...register("durationMinutes", { valueAsNumber: true })} />
        </Field>
        <Field label="Categoria" htmlFor="sf-category" error={errors.category?.message}>
          <Input id="sf-category" placeholder="Cabelo, Barba..." {...register("category")} />
        </Field>
      </div>

      <ImageUpload
        label="Imagem do serviço"
        value={watch("imageUrl")}
        onChange={(path) => setValue("imageUrl", path)}
      />
      {errors.imageUrl?.message && <p className="text-xs text-danger">{errors.imageUrl.message}</p>}

      <Field label="Descrição" htmlFor="sf-desc" error={errors.description?.message}>
        <Textarea id="sf-desc" placeholder="Detalhes do serviço..." {...register("description")} />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {service ? "Salvar" : "Cadastrar serviço"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
