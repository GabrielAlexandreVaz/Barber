import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Superfície padrão do tema (borda + fundo escuro premium). */
export function Card({ title, description, children, className }: CardProps) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface/70 p-6 shadow-lg shadow-black/20", className)}>
      {(title || description) && (
        <header className="mb-5">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
