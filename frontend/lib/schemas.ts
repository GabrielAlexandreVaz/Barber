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

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
