/**
 * Canonform data model — the three tables the whole product turns on.
 *
 * Read this top-to-bottom: `worlds` is the root, `pages` is the cache (L1), and
 * `links` is the link graph (L2) — the consistency seam other "infinite wiki"
 * toys miss. The consistency design lives in ARCHITECTURE.md ("Consistency model").
 */
import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  jsonb,
  timestamp,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * Visibility of a world. v0.1 defaults every world to "public" + shareable
 * (SPEC §9 decision 1); "private" is reserved for a future Pro tier.
 */
export const visibility = pgEnum("visibility", ["public", "private"]);

/**
 * Lifecycle of a page's body.
 *  - "ready": fully generated and frozen — this is canon (L1). The vast majority.
 *  - "stub":  a placeholder we chose to persist instead of a real article — e.g. a
 *             captured model refusal rendered in-world as "[record sealed]" (SPEC §5).
 *
 * There is deliberately no "generating" state: generation happens in memory and a
 * row is inserted atomically only once we have a final body to freeze.
 */
export const pageStatus = pgEnum("page_status", ["ready", "stub"]);

// =============================================================================
// worlds — one row per user-seeded universe. The root of everything.
// =============================================================================
export const worlds = pgTable("worlds", {
  /**
   * Short, URL-friendly id (app-generated, e.g. nanoid) so a world is a shareable
   * link like /w/{id}. Intentionally NOT a uuid — we want short, copy-pasteable URLs.
   */
  id: text("id").primaryKey(),

  /** The one-sentence prompt the user typed. Immutable; the root of L3. */
  seed: text("seed").notNull(),

  /** Human-readable world name, derived from the seed. Null until the starter pack names it. */
  title: text("title"),

  /**
   * L3 "world bible": a small, capped, append-only list of core canon facts
   * (world name, era, a few established entities). Prepended to every generation
   * and prompt-cached. Stored as a JSON array of short fact strings.
   */
  canonFacts: jsonb("canon_facts")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),

  visibility: visibility("visibility").notNull().default("public"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =============================================================================
// pages — one row per generated article. THE cache, and L1 of consistency.
//
// Keyed by (worldId, slug): each article is generated exactly once and then frozen
// forever. That immutability is what kills "same page, different answer" drift —
// a hit on this table never calls the LLM again.
// =============================================================================
export const pages = pgTable(
  "pages",
  {
    worldId: text("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),

    /** URL slug of the article within its world, e.g. "the-drowned-archive". */
    slug: text("slug").notNull(),

    /** Display title, e.g. "The Drowned Archive". */
    title: text("title").notNull(),

    /** The generated article (markdown). Immutable once written. */
    body: text("body").notNull(),

    status: pageStatus("status").notNull().default("ready"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // (worldId, slug) is the cache key and the natural primary key.
    primaryKey({ columns: [t.worldId, t.slug] }),
  ],
);

// =============================================================================
// links — the link graph. THIS is L2, the highest-leverage consistency layer.
//
// When we generate page A and parse its [[wikilinks]], we record one edge per
// link: A (src) → B (dst), with the anchor text and a little surrounding context.
// Later, when the reader clicks through to B and we generate it, we look up the
// INCOMING edges to B (by worldId + dstSlug), pull in those source pages' content
// and anchors, and inject them into B's prompt — so B stays consistent with the
// pages that referenced it. Most "this feels inconsistent" moments come from
// contradictions between directly-linked entities; this is the cheapest fix.
//
// Note: dstSlug has NO foreign key to pages on purpose. A link routinely points at
// a page that doesn't exist yet — that IS the "blue link" waiting to be generated
// on first click. Only worldId is a real FK.
// =============================================================================
export const links = pgTable(
  "links",
  {
    worldId: text("world_id")
      .notNull()
      .references(() => worlds.id, { onDelete: "cascade" }),

    srcSlug: text("src_slug").notNull(),
    dstSlug: text("dst_slug").notNull(),

    /** Anchor text of the [[link]] as it appeared in the source page. */
    anchor: text("anchor").notNull(),

    /** Optional snippet of surrounding text, to give L2 more context. */
    contextHint: text("context_hint"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // One edge per (world, src, dst): re-recording the same link upserts.
    primaryKey({ columns: [t.worldId, t.srcSlug, t.dstSlug] }),
    // L2's hot query: "who links INTO this slug?" — fetch incoming edges fast.
    index("links_world_dst_idx").on(t.worldId, t.dstSlug),
    // Outgoing edges (a page's own links), for graph/debug views.
    index("links_world_src_idx").on(t.worldId, t.srcSlug),
  ],
);

// --- Inferred types, for use across the app ---------------------------------
export type World = typeof worlds.$inferSelect;
export type NewWorld = typeof worlds.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
