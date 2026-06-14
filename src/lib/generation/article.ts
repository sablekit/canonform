/**
 * The core generation loop — turning a (world, slug, title) into a frozen article.
 *
 * Steps, in order:
 *   1. Load the world (L3 source) and the pages that link INTO this slug (L2 source).
 *   2. Build the prompt (world bible + incoming-link context).
 *   3. Stream the model's output, yielding each delta so the caller can pipe it to
 *      the browser token-by-token.
 *   4. On completion, parse the article's own [[links]] and, in a single transaction,
 *      freeze the page (L1) and record its outgoing edges (L2). The write is atomic
 *      so we never end up with a page missing its links, and `insertPage`'s
 *      ON CONFLICT DO NOTHING means a generation race resolves to one immutable page.
 *
 * The model stream is injected (`deps.stream`) so the whole loop can be tested with a
 * fake stream against an in-memory database — no real LLM call needed.
 */
import type { Database } from "../../db";
import {
  getIncomingLinks,
  getWorld,
  insertPage,
  recordLinks,
} from "../../db/repo";
import { streamChat } from "../llm/client";
import { buildArticleMessages } from "../llm/prompt";
import type { ChatMessage } from "../llm/types";
import { parseWikiLinks, uniqueLinkEdges } from "../wikilinks";

/** How much of a source page to inject as L2 context for the new article. */
const EXCERPT_LEN = 280;

export interface GenerateArticleInput {
  worldId: string;
  slug: string;
  /** The human title to write about (callers derive this from the link/slug). */
  title: string;
}

export interface GenerateArticleDeps {
  /** Override the model stream (used by tests). Defaults to the OpenRouter client. */
  stream?: (messages: ChatMessage[]) => AsyncGenerator<string>;
}

export async function* generateArticle(
  db: Database,
  input: GenerateArticleInput,
  deps: GenerateArticleDeps = {},
): AsyncGenerator<string> {
  const stream = deps.stream ?? streamChat;

  const world = await getWorld(db, input.worldId);
  if (!world) throw new Error(`World not found: ${input.worldId}`);

  // L2: pages that already point at this slug, with their text for grounding.
  const incoming = await getIncomingLinks(db, input.worldId, input.slug);
  const messages = buildArticleMessages({
    world: {
      seed: world.seed,
      title: world.title,
      canonFacts: world.canonFacts,
    },
    targetTitle: input.title,
    incomingLinks: incoming.map((row) => ({
      fromTitle: row.fromTitle,
      anchor: row.anchor,
      excerpt: excerpt(row.body),
    })),
  });

  // Stream the article, accumulating the full body as we go.
  let body = "";
  for await (const delta of stream(messages)) {
    body += delta;
    yield delta;
  }

  // Completion: parse this article's links and freeze page + edges atomically.
  const edges = uniqueLinkEdges(parseWikiLinks(body));
  await db.transaction(async (tx) => {
    const txdb = tx as unknown as Database;
    const inserted = await insertPage(txdb, {
      worldId: input.worldId,
      slug: input.slug,
      title: input.title,
      body,
    });
    if (inserted && edges.length > 0) {
      await recordLinks(
        txdb,
        input.worldId,
        input.slug,
        edges.map((e) => ({ dstSlug: e.slug, anchor: e.anchor })),
      );
    }
  });
}

/** Trim a source page down to a short, single-block excerpt for prompt context. */
function excerpt(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= EXCERPT_LEN) return trimmed;
  return trimmed.slice(0, EXCERPT_LEN).trimEnd() + "…";
}
