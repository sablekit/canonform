/**
 * Data-access layer — the only place that reads/writes the three tables. Every
 * function takes the `db` explicitly (dependency injection) so the same code runs
 * against postgres.js in production and against an in-memory Postgres in tests.
 *
 * The two critical-path operations: `insertPage` is the L1 immutable cache write,
 * and `getIncomingLinks` is the L2 "who links into this?" join that feeds the
 * prompt builder.
 */
import { and, eq } from "drizzle-orm";
import type { Database } from "./index";
import { links, pages, worlds } from "./schema";
import type { NewPage, Page, World } from "./schema";

// --- worlds ------------------------------------------------------------------

export async function createWorld(
  db: Database,
  input: { id: string; seed: string; title?: string | null; canonFacts?: string[] },
): Promise<World> {
  const [world] = await db
    .insert(worlds)
    .values({
      id: input.id,
      seed: input.seed,
      title: input.title ?? null,
      // Let the column default ('[]') apply unless facts are supplied.
      ...(input.canonFacts ? { canonFacts: input.canonFacts } : {}),
    })
    .returning();
  return world;
}

export async function getWorld(db: Database, id: string): Promise<World | undefined> {
  const [world] = await db
    .select()
    .from(worlds)
    .where(eq(worlds.id, id))
    .limit(1);
  return world;
}

// --- pages: the L1 immutable cache -------------------------------------------

export async function getPage(
  db: Database,
  worldId: string,
  slug: string,
): Promise<Page | undefined> {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.worldId, worldId), eq(pages.slug, slug)))
    .limit(1);
  return page;
}

/**
 * Freeze a generated page into the cache. `ON CONFLICT DO NOTHING` makes this safe
 * under a generation race: the first writer wins and the page is immutable forever.
 * Returns true if this call inserted the page, false if it already existed.
 */
export async function insertPage(db: Database, page: NewPage): Promise<boolean> {
  const inserted = await db
    .insert(pages)
    .values(page)
    .onConflictDoNothing()
    .returning({ slug: pages.slug });
  return inserted.length > 0;
}

// --- links: the L2 graph -----------------------------------------------------

export interface LinkEdgeInput {
  dstSlug: string;
  anchor: string;
  contextHint?: string | null;
}

/** Record the outgoing edges of a freshly generated page. Idempotent per (src,dst). */
export async function recordLinks(
  db: Database,
  worldId: string,
  srcSlug: string,
  edges: LinkEdgeInput[],
): Promise<void> {
  if (edges.length === 0) return;
  await db
    .insert(links)
    .values(
      edges.map((e) => ({
        worldId,
        srcSlug,
        dstSlug: e.dstSlug,
        anchor: e.anchor,
        contextHint: e.contextHint ?? null,
      })),
    )
    .onConflictDoNothing();
}

export interface IncomingLinkRow {
  srcSlug: string;
  fromTitle: string;
  anchor: string;
  body: string;
}

/**
 * L2's core query: every page that links INTO `dstSlug`, joined to the source
 * page's title and body so the generator can inject that context. The inner join
 * means only pages that actually exist (have been generated) are returned —
 * blue links to ungenerated pages contribute nothing.
 */
export async function getIncomingLinks(
  db: Database,
  worldId: string,
  dstSlug: string,
): Promise<IncomingLinkRow[]> {
  return db
    .select({
      srcSlug: links.srcSlug,
      fromTitle: pages.title,
      anchor: links.anchor,
      body: pages.body,
    })
    .from(links)
    .innerJoin(
      pages,
      and(eq(pages.worldId, links.worldId), eq(pages.slug, links.srcSlug)),
    )
    .where(and(eq(links.worldId, worldId), eq(links.dstSlug, dstSlug)));
}
