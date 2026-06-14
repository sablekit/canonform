/**
 * Parse the `[[wikilinks]]` out of a generated article. This is what populates the
 * `links` table (the L2 graph): every link in page A becomes an edge A → target.
 *
 * Supported syntax:
 *   [[Target Title]]            → links to slug("Target Title"), anchor = the title
 *   [[Target Title|shown text]] → links to slug("Target Title"), anchor = "shown text"
 */
import { slugify } from "./slug";

export interface WikiLink {
  /** The full matched token, e.g. "[[The Drowned Archive|the archive]]". */
  raw: string;
  /** The page title being linked to (left of the pipe). */
  target: string;
  /** Display/anchor text (right of the pipe, or the target if there's no pipe). */
  anchor: string;
  /** URL slug derived from the target — the `dst_slug` edge for the links table. */
  slug: string;
}

// [[target]] or [[target|anchor]]. Non-greedy; target excludes "]" and "|".
// Surrounding whitespace is absorbed by the \s* so captures come back trimmed.
const WIKILINK_RE = /\[\[\s*([^\]|]+?)\s*(?:\|\s*([^\]]+?)\s*)?\]\]/g;

/** Extract every `[[wikilink]]` occurrence from text, in document order. */
export function parseWikiLinks(text: string): WikiLink[] {
  const links: WikiLink[] = [];
  for (const m of text.matchAll(WIKILINK_RE)) {
    const target = m[1].trim();
    if (!target) continue; // ignore empty/whitespace-only brackets
    const anchor = (m[2] ?? m[1]).trim();
    links.push({ raw: m[0], target, anchor, slug: slugify(target) });
  }
  return links;
}

/**
 * Collapse parsed links to one edge per destination slug. The `links` table is
 * keyed by (world, src, dst), so a page linking the same target twice is a single
 * edge. Keeps the first anchor seen for each slug.
 */
export function uniqueLinkEdges(links: WikiLink[]): WikiLink[] {
  const seen = new Map<string, WikiLink>();
  for (const link of links) {
    if (!seen.has(link.slug)) seen.set(link.slug, link);
  }
  return [...seen.values()];
}
