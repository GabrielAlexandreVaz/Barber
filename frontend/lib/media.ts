/** Origem da API sem o sufixo /api (para servir arquivos de /uploads). */
export const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api").replace(
  /\/api\/?$/,
  "",
);

/**
 * Resolve a URL exibível de uma imagem: retorna URLs http completas como estão
 * e prefixa caminhos de upload ("/uploads/...") com a origem da API.
 */
export function fileUrl(pathOrUrl?: string | null): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${apiOrigin}${pathOrUrl}`;
}
