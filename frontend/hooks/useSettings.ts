"use client";

import { useQuery } from "@tanstack/react-query";
import { settingService } from "@/services/settingService";

/** Configurações públicas da barbearia (nome, logo, contato). */
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}
