// Maps a page slug to its public URL. Pure (no imports), so it's safe to use in
// both server components and the client editor.
export function publicPath(slug: string): string {
  if (slug === "home") return "/";
  if (slug === "collaborations-academic") return "/collaborations/academic";
  if (slug === "collaborations-industry") return "/collaborations/industry";
  return `/${slug}`;
}
