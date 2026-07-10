"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavLink {
  href: string;
  label: string;
  roles?: string[];
}

const LINKS: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "BARBER"] },
  { href: "/relatorios", label: "Relatórios", roles: ["ADMIN"] },
  { href: "/agendar", label: "Agendar", roles: ["CLIENT"] },
  { href: "/agendamentos", label: "Agendamentos" },
  { href: "/historico", label: "Histórico" },
  { href: "/agenda", label: "Agenda", roles: ["ADMIN", "BARBER"] },
  { href: "/admin/barbeiros", label: "Barbeiros", roles: ["ADMIN"] },
  { href: "/admin/servicos", label: "Serviços", roles: ["ADMIN"] },
  { href: "/admin/usuarios", label: "Usuários", roles: ["ADMIN"] },
  { href: "/admin/configuracoes", label: "Configurações", roles: ["ADMIN"] },
  { href: "/perfil", label: "Perfil" },
];

/** Cabeçalho + container para as páginas autenticadas. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const visibleLinks = LINKS.filter((l) => !l.roles || (user && l.roles.includes(user.role)));

  return (
    <div className="bg-guetto min-h-screen">
      <header className="border-b border-border bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-bold tracking-[0.25em] text-gradient-gold">
              THE GUETTO
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    pathname === link.href
                      ? "bg-surface-2 text-gold"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted md:inline">{user?.name}</span>
            <Button variant="ghost" onClick={() => logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
