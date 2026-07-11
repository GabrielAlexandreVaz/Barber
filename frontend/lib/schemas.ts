import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres.")
    .regex(/[A-Za-z]/, "Deve conter ao menos uma letra.")
    .regex(/\d/, "Deve conter ao menos um número."),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido.")
    .optional()
    .or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  phone: z
    .string()
    .trim()
    .min(8, "Telefone inválido.")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z
      .string()
      .min(8, "Mínimo de 8 caracteres.")
      .regex(/[A-Za-z]/, "Deve conter ao menos uma letra.")
      .regex(/\d/, "Deve conter ao menos um número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

// Aceita vazio, URL http(s) completa ou caminho de upload local ("/uploads/...").
// (Espelha o isImageRef do backend — uploads retornam caminho relativo.)
const imageRef = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || v.startsWith("/uploads/") || /^https?:\/\//.test(v),
    "Imagem inválida.",
  )
  .optional()
  .or(z.literal(""));

const barberBase = {
  name: z.string().min(2, "Informe o nome."),
  phone: z.string().trim().min(8, "Telefone inválido.").optional().or(z.literal("")),
  specialty: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  photoUrl: imageRef,
  instagram: z.string().trim().max(60).optional().or(z.literal("")),
};

export const createBarberSchema = z.object({
  ...barberBase,
  email: z.string().email("E-mail inválido."),
  password: z
    .string()
    .min(8, "Mínimo de 8 caracteres.")
    .regex(/[A-Za-z]/, "Deve conter ao menos uma letra.")
    .regex(/\d/, "Deve conter ao menos um número."),
});

export const editBarberSchema = z.object(barberBase);

export const serviceSchema = z.object({
  name: z.string().min(2, "Informe o nome."),
  price: z
    .number({ error: "Informe um preço válido." })
    .min(0, "Preço não pode ser negativo."),
  durationMinutes: z
    .number({ error: "Informe a duração." })
    .int("Use minutos inteiros.")
    .min(1, "Mínimo 1 minuto.")
    .max(600, "Máximo 600 minutos."),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  imageUrl: imageRef,
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
export type CreateBarberForm = z.infer<typeof createBarberSchema>;
export type EditBarberForm = z.infer<typeof editBarberSchema>;
export type ServiceForm = z.infer<typeof serviceSchema>;
