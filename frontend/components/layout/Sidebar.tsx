"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { fileUrl } from "@/lib/media";
import { NAV_ITEMS, NAV_GROUP_ORDER } from "./nav-items";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

/** Conteúdo da sidebar — reutilizado pela versão desktop (fixa) e mobile (drawer). */
export function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const shopName = settings?.["shop.name"] || "THE GUETTO";
  // Logo: prioriza a enviada em Configurações; senão tenta /logo.png (public);
  // se nenhuma existir, cai para o texto/monograma.
  const uploadedLogo = fileUrl(settings?.["shop.logoUrl"]);
  const [defaultLogoOk, setDefaultLogoOk] = useState(true);
  const logo = uploadedLogo || (defaultLogoOk ? "/logo.png" : null);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const initials = (user?.name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const monogram = shopName.replace(/[^A-Za-zÀ-ÿ]/g, "").slice(0, 2).toUpperCase() || "TG";

  return (
    <div className="flex h-full flex-col bg-surface/80 backdrop-blur">
      {/* Branding */}
      <div className={cn("flex h-[65px] items-center border-b border-border", collapsed ? "justify-center px-2" : "px-4")}>
        <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5">
          {logo ? (
            // Logo circular (recorte remove as bordas brancas)
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={shopName}
              onError={() => {
                if (!uploadedLogo) setDefaultLogoOk(false);
              }}
              className={cn("shrink-0 rounded-full object-cover", collapsed ? "h-9 w-9" : "h-10 w-10")}
            />
          ) : collapsed ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 text-sm font-bold text-gold">
              {monogram}
            </span>
          ) : null}
          {/* Nome ao lado da logo (some no modo recolhido) */}
          {!collapsed && (
            <span className="min-w-0 truncate text-sm font-bold uppercase tracking-[0.06em] text-gradient-gold">
              {shopName}
            </span>
          )}
        </Link>
      </div>

      {/* Navegação */}
      <nav className="scrollbar-slim flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_GROUP_ORDER.map((group) => {
          const items = visibleItems.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/70">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-gold/10 text-gold"
                        : "text-muted hover:bg-surface-2 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-gold" />
                    )}
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Rodapé: apenas nome + thumb; clique abre um popover com "Sair" */}
      <div className="relative border-t border-border p-3">
        {menuOpen && (
          <>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute bottom-full left-2 z-20 mb-2 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-xl shadow-black/40">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          title={collapsed ? user?.name : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2",
            collapsed && "justify-center px-0",
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-gold">
            {initials}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground">
              {user?.name}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
