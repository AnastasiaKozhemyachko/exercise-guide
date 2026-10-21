/** Metadata paths stay relative to public/; Vite supplies the deployment prefix. */
export function assetUrl(
  path: string,
  base = import.meta.env.BASE_URL,
): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
