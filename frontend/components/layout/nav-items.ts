import {
  LayoutDashboard,
  BarChart3,
  CalendarPlus,
  CalendarClock,
  History,
  CalendarDays,
  Scissors,
  Tag,
  Users,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types";

export type NavGroup = "Operação" | "Gestão" | "Conta";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  group: NavGroup;
}

/** Itens de navegação da sidebar (filtrados por papel no componente). */
export const NAV_ITEMS: NavItem[] = [
  // Operação
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "BARBER"], group: "Operação" },
  { href: "/agendar", label: "Agendar", icon: CalendarPlus, roles: ["CLIENT"], group: "Operação" },
  { href: "/agendamentos", label: "Agendamentos", icon: CalendarClock, group: "Operação" },
  { href: "/agenda", label: "Agenda", icon: CalendarDays, roles: ["ADMIN", "BARBER"], group: "Operação" },
  { href: "/historico", label: "Histórico", icon: History, group: "Operação" },

  // Gestão (admin)
  { href: "/admin/barbeiros", label: "Barbeiros", icon: Scissors, roles: ["ADMIN"], group: "Gestão" },
  { href: "/admin/servicos", label: "Serviços", icon: Tag, roles: ["ADMIN"], group: "Gestão" },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, roles: ["ADMIN"], group: "Gestão" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, roles: ["ADMIN"], group: "Gestão" },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, roles: ["ADMIN"], group: "Gestão" },

  // Conta
  { href: "/perfil", label: "Perfil", icon: UserRound, group: "Conta" },
];

export const NAV_GROUP_ORDER: NavGroup[] = ["Operação", "Gestão", "Conta"];
