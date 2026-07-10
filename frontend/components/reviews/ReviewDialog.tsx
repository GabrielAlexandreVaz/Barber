"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarInput } from "@/components/ui/stars";
import { reviewService } from "@/services/reviewService";
import { getApiErrorMessage } from "@/services/api";

interface ReviewDialogProps {
  appointmentId: string;
  onClose: () => void;
}

/** Modal simples para avaliar um atendimento finalizado. */
export function ReviewDialog({ appointmentId, onClose }: ReviewDialogProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => reviewService.create(appointmentId, rating, comment.trim() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      onClose();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  function submit() {
    setError(null);
    if (rating < 1) {
      setError("Escolha uma nota.");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Avaliar atendimento</h2>
        <p className="mt-1 text-sm text-muted">Como foi sua experiência?</p>

        <div className="mt-4">
          <StarInput value={rating} onChange={setRating} />
        </div>

        <div className="mt-4">
          <Textarea
            placeholder="Comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={mutation.isPending}>
            Enviar avaliação
          </Button>
        </div>
      </div>
    </div>
  );
}
