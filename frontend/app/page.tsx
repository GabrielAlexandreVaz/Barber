"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <main className="bg-guetto flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <span className="text-lg font-bold tracking-[0.25em] text-gradient-gold">
          THE GUETTO
        </span>
        <nav className="flex items-center gap-3">
          {isLoading ? null : isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">
                Olá, {user?.name.split(" ")[0]}
              </span>
              <Button variant="ghost" onClick={() => logout()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Criar conta</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="flex flex-1 items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-gold">
            Barbearia premium
          </p>
          <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Estilo, precisão e <span className="text-gradient-gold">atitude</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base text-muted">
            Agende seu horário na The Guetto Barber em menos de um minuto.
            Escolha o serviço, o barbeiro e o melhor horário para você.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={isAuthenticated ? "/agendar" : "/register"}>
              <Button size="lg" className="w-full sm:w-auto">
                Agendar horário
              </Button>
            </Link>
            <a
              href="https://www.instagram.com/theguettoofc/"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Ver no Instagram
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-muted">
        © 2026 The Guetto Barber. Todos os direitos reservados.
      </footer>
    </main>
  );
}
