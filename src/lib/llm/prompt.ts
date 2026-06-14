/**
 * Build the chat messages for generating one article. This is where the two
 * world-consistency layers become an actual prompt:
 *
 *   L3 — the "world bible": the seed + a capped list of canon facts, rendered as a
 *        stable SYSTEM prefix. It's identical for every page in a world, so it can be
 *        prompt-cached and keeps the whole world anchored to the same ground truth.
 *   L2 — link-graph context: the pages that already link INTO this article, injected
 *        into the USER message so the new article stays consistent with where the
 *        reader clicked from. (Contradictions between directly-linked entities are
 *        the bulk of "this feels inconsistent" — this is the cheapest fix.)
 *
 * Pure by design: callers fetch the world + incoming links from the DB and pass them
 * in. Output is a provider-agnostic ChatMessage[] the client can send as-is.
 */
import type { ChatMessage } from "./types";

export interface WorldContext {
  /** The one-sentence seed — the root of the world. */
  seed: string;
  /** The world's name, once it's known. */
  title?: string | null;
  /** Capped, append-only canon facts — the L3 bible. */
  canonFacts: string[];
}

/** One page that links into the article we're about to generate (an L2 edge). */
export interface IncomingLink {
  /** Title of the source page that contains the link. */
  fromTitle: string;
  /** Anchor text the source used. */
  anchor: string;
  /** A snippet of the source page, to ground the new article in what's established. */
  excerpt: string;
}

export interface ArticlePromptInput {
  world: WorldContext;
  /** Title of the article to write. */
  targetTitle: string;
  /** Pages that already reference this one (L2). Empty for a brand-new starter page. */
  incomingLinks?: IncomingLink[];
}

export function buildArticleMessages(input: ArticlePromptInput): ChatMessage[] {
  return [
    { role: "system", content: buildWorldBible(input.world) },
    {
      role: "user",
      content: buildArticleTask(input.targetTitle, input.incomingLinks ?? []),
    },
  ];
}

/** L3: the stable, prompt-cacheable world-bible system prefix. */
function buildWorldBible(world: WorldContext): string {
  const lines: string[] = [
    "You are the in-world encyclopedia of a fictional universe. Write entries as",
    "established, in-world fact, in a neutral, encyclopedic tone. Never say the world",
    "is fictional or AI-generated, and never break character.",
    "",
    "# This world",
  ];
  if (world.title) lines.push(`Name: ${world.title}`);
  lines.push(`Premise (the seed it grew from): "${world.seed}"`);

  if (world.canonFacts.length > 0) {
    lines.push("", "# Established canon (fixed truth — never contradict)");
    for (const fact of world.canonFacts) lines.push(`- ${fact}`);
  }

  lines.push(
    "",
    "# How to write",
    "- Output Markdown, like a Wikipedia article: a short lead paragraph, then sections.",
    "- Link related people, places, events, and concepts with [[double-bracket]] wikilinks.",
    "  Invent and link freely — every link becomes its own article. Use [[Target|shown text]]",
    "  when the wording differs from the linked title.",
    "- Be concrete and specific; prefer invented detail over vague filler.",
    "- Stay consistent with the established canon and any referenced articles.",
  );
  return lines.join("\n");
}

/** L2: the task, plus the incoming-reference context for consistency. */
function buildArticleTask(targetTitle: string, incoming: IncomingLink[]): string {
  const lines: string[] = [`Write the encyclopedia article titled: "${targetTitle}"`];

  if (incoming.length > 0) {
    lines.push(
      "",
      "This subject is already referenced by existing articles. Stay consistent with",
      "how it is described there:",
    );
    for (const link of incoming) {
      lines.push(
        `- In "${link.fromTitle}" (linked as "${link.anchor}"): ${link.excerpt}`,
      );
    }
  }

  lines.push("", "Begin the article now.");
  return lines.join("\n");
}
