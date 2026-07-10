"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Exibição de estrelas (somente leitura). */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(value) ? "text-gold" : "text-border"}>
          ★
        </span>
      ))}
    </span>
  );
}

/** Seletor de estrelas (interativo). */
export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "text-2xl transition-colors",
            i <= (hover || value) ? "text-gold" : "text-border hover:text-gold/50",
          )}
          aria-label={`Nota ${i}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
