/**
 * Turn a human title into a URL-safe slug — a page's key within its world.
 *
 * Unicode-aware on purpose: generated content follows the seed's language (a
 * Chinese seed yields Chinese titles), so we KEEP letters/numbers of any script
 * and only collapse everything else to hyphens. Stripping non-ASCII would erase
 * non-Latin titles entirely.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-") // any run of non letter/number → one hyphen
    .slice(0, 120) // keep slugs (and URLs) bounded
    .replace(/^-+|-+$/g, ""); // trim hyphens (after slicing, so a cut can't leave one)
  return slug || "untitled";
}

/**
 * Best-effort inverse of slugify, for when we only have a slug and need a display
 * title: "the-long-tide" → "The Long Tide". Lossy (original casing/punctuation are
 * gone), so it's a fallback, not a true round-trip.
 */
export function titleFromSlug(slug: string): string {
  const title = slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return title || "Untitled";
}
