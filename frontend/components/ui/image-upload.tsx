"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadService } from "@/services/uploadService";
import { getApiErrorMessage } from "@/services/api";
import { fileUrl } from "@/lib/media";

interface ImageUploadProps {
  value?: string | null;
  onChange: (path: string) => void;
  label?: string;
}

/** Seletor de imagem com upload imediato e preview. */
export function ImageUpload({ value, onChange, label = "Imagem" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = fileUrl(value);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const path = await uploadService.upload(file);
      onChange(path);
    } catch (err) {
      setError(getApiErrorMessage(err, "Falha no upload."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted">sem foto</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <Button type="button" variant="outline" loading={uploading} onClick={() => inputRef.current?.click()}>
            {preview ? "Trocar imagem" : "Enviar imagem"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" onClick={() => onChange("")}>
              Remover
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
