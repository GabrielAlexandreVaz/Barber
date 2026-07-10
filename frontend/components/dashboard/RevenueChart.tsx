"use client";

import { brl } from "@/lib/appointment";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

const shortDay = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/** Gráfico de barras simples e acessível para a receita diária (tema dourado). */
export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const total = data.reduce((a, d) => a + d.revenue, 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm text-muted">Receita no período</span>
        <span className="text-lg font-semibold text-gold">{brl(total)}</span>
      </div>

      <div className="flex h-40 items-end gap-1 overflow-x-auto pb-1" role="img" aria-label="Gráfico de receita diária">
        {data.map((d) => {
          const heightPct = d.revenue > 0 ? Math.max(4, (d.revenue / max) * 100) : 1.5;
          return (
            <div key={d.date} className="flex min-w-[6px] flex-1 flex-col items-center justify-end">
              <div
                className={
                  d.revenue > 0
                    ? "w-full rounded-t bg-gradient-to-t from-gold-deep to-gold transition-all"
                    : "w-full rounded-t bg-surface-2"
                }
                style={{ height: `${heightPct}%` }}
                title={`${shortDay(d.date)}: ${brl(d.revenue)}`}
              />
            </div>
          );
        })}
      </div>

      {data.length > 0 && (
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{shortDay(data[0].date)}</span>
          <span>{shortDay(data[data.length - 1].date)}</span>
        </div>
      )}
    </div>
  );
}
