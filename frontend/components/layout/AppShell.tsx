"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { fileUrl } from "@/lib/media";
import { SidebarContent } from "./Sidebar";

const COLLAPSE_KEY = "tg.sidebarCollapsed";

/** Layout das páginas autenticadas: sidebar (desktop) + drawer (mobile) + conteúdo. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: settings } = useSettings();
  const shopName = settings?.["shop.name"] || "THE GUETTO";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logo da top bar (mobile): upload > /logo.png > texto
  const uploadedLogo = fileUrl(settings?.["shop.logoUrl"]);
  const [defaultLogoOk, setDefaultLogoOk] = useState(true);
  const logo = uploadedLogo || (defaultLogoOk ? "/logo.png" : null);

  // Restaura o estado de colapso (desktop)
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  // Fecha o drawer ao trocar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Fecha o drawer no Esc + trava o scroll do body enquanto aberto
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="bg-guetto min-h-screen lg:flex">
      {/* Sidebar fixa (desktop) */}
      <aside
        className={cn(
          "relative hidden shrink-0 border-r border-border transition-[width] duration-200 ease-out lg:block",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
        )}
      >
        {/* Botão flutuante de expandir/recolher (na borda) */}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3 top-5 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-md shadow-black/30 transition-colors hover:border-gold/50 hover:text-gold"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div className="sticky top-0 h-screen">
          <SidebarContent collapsed={collapsed} />
        </div>
      </aside>

      {/* Drawer (mobile) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border lg:hidden"
            >
              <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Área de conteúdo */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex items-center gap-3 border-b border-border bg-surface/60 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={shopName}
              onError={() => {
                if (!uploadedLogo) setDefaultLogoOk(false);
              }}
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <span className="truncate text-sm font-bold uppercase tracking-[0.12em] text-gradient-gold">
            {shopName}
          </span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
