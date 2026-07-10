import type { AppointmentStatus } from "@/types";

export const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

/** Classes Tailwind (fundo/texto) para o badge de cada status. */
export const statusClass: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-gold/10 text-gold",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-purple-500/10 text-purple-400",
  COMPLETED: "bg-success/10 text-success",
  CANCELLED: "bg-danger/10 text-danger",
  NO_SHOW: "bg-zinc-500/10 text-zinc-400",
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** Data de hoje no formato YYYY-MM-DD (hora local). */
export const todayISODate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
