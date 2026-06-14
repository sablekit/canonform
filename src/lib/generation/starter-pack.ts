/**
 * Seed a new world from one sentence and pre-generate an interlinked starter pack,
 * so a fresh world is never a lonely single page (the "cold-start empty shell"
 * failure mode in SPEC §5).
 *
 * Steps:
 *   1. ask the model to name the world + a few canon facts (seeds the L3 bible)
 *   2. generate the "home" article (titled after the world)
 *   3. generate the first few articles the home links to — these now have the home
 *      as an incoming link, so L2 kicks in immediately and the world feels connected
 */
import { randomBytes } from "node:crypto";
import type { Database } from "../../db";
import { createWorld, getPage } from "../../db/repo";
import { slugify } from "../slug";
import { parseWikiLinks, uniqueLinkEdges } from "../wikilinks";
import { generateArticle, type GenerateArticleDeps } from "./article";
import { generateWorldSetup, type WorldSetupDeps } from "./world-setup";

/** How many of the home article's links to pre-generate. */
const STARTER_LINKS = 4;

export interface SeedWorldDeps extends GenerateArticleDeps, WorldSetupDeps {
  /** Override the world-id generator (used by tests). */
  makeId?: () => string;
}

export interface SeededWorld {
  worldId: string;
  homeSlug: string;
}

export async function seedWorld(
  db: Database,
  seed: string,
  deps: SeedWorldDeps = {},
): Promise<SeededWorld> {
  const makeId = deps.makeId ?? (() => randomBytes(9).toString("base64url"));

  const setup = await generateWorldSetup(seed, deps);
  const worldId = makeId();
  await createWorld(db, {
    id: worldId,
    seed,
    title: setup.worldName,
    canonFacts: setup.canonFacts,
  });

  const homeSlug = slugify(setup.worldName);
  await drain(
    generateArticle(db, { worldId, slug: homeSlug, title: setup.worldName }, deps),
  );

  // Pre-generate the articles the home links to (skipping any self-link).
  const home = await getPage(db, worldId, homeSlug);
  const targets = home
    ? uniqueLinkEdges(parseWikiLinks(home.body))
        .filter((link) => link.slug !== homeSlug)
        .slice(0, STARTER_LINKS)
    : [];
  for (const target of targets) {
    await drain(
      generateArticle(db, { worldId, slug: target.slug, title: target.target }, deps),
    );
  }

  return { worldId, homeSlug };
}

/** Run a streaming generation to completion, discarding the deltas. */
async function drain(gen: AsyncGenerator<string>): Promise<void> {
  while (!(await gen.next()).done) {
    // starter-pack generation doesn't stream to a client — we only want the writes.
  }
}
