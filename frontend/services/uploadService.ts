import { api } from "./api";
import type { ApiResponse } from "@/types";

interface UploadResult {
  path: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadService = {
  /** Envia uma imagem e retorna o caminho relativo ("/uploads/..."). */
  async upload(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    // O adapter do axios remove o Content-Type padrão quando o corpo é FormData,
    // deixando o browser definir o boundary do multipart.
    const { data } = await api.post<ApiResponse<UploadResult>>("/uploads", form);
    return data.data.path;
  },
};
