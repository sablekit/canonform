import { describe, it, expect, beforeEach } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";
import type { Database } from "./index";
import {
  createWorld,
  getWorld,
  getPage,
  insertPage,
  recordLinks,
  getIncomingLinks,
} from "./repo";

// A fresh in-memory Postgres (WASM) with our migrations applied, per test.
async function makeTestDb(): Promise<Database> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  // pglite's Drizzle type is structurally compatible with our postgres.js Database
  // for every operation the repo uses; the cast keeps the repo signatures simple.
  return db as unknown as Database;
}

describe("repo", () => {
  let db: Database;
  beforeEach(async () => {
    db = await makeTestDb();
  });

  it("creates and reads a world with sane defaults", async () => {
    await createWorld(db, { id: "w1", seed: "A drowned city.", title: "Vellumar" });
    const world = await getWorld(db, "w1");
    expect(world?.seed).toBe("A drowned city.");
    expect(world?.title).toBe("Vellumar");
    expect(world?.visibility).toBe("public");
    expect(world?.canonFacts).toEqual([]);
  });

  it("getPage misses, then hits after insert (L1)", async () => {
    await createWorld(db, { id: "w1", seed: "s" });
    expect(await getPage(db, "w1", "spire")).toBeUndefined();

    const inserted = await insertPage(db, {
      worldId: "w1",
      slug: "spire",
      title: "The Spire",
      body: "...",
    });
    expect(inserted).toBe(true);
    expect((await getPage(db, "w1", "spire"))?.title).toBe("The Spire");
  });

  it("insertPage is immutable: a second write never overwrites", async () => {
    await createWorld(db, { id: "w1", seed: "s" });
    await insertPage(db, { worldId: "w1", slug: "spire", title: "First", body: "first body" });

    const again = await insertPage(db, {
      worldId: "w1",
      slug: "spire",
      title: "Second",
      body: "second body",
    });
    expect(again).toBe(false);

    const page = await getPage(db, "w1", "spire");
    expect(page?.title).toBe("First");
    expect(page?.body).toBe("first body");
  });

  it("getIncomingLinks returns existing source pages that link in (L2)", async () => {
    await createWorld(db, { id: "w1", seed: "s" });
    await insertPage(db, {
      worldId: "w1",
      slug: "vellumar",
      title: "Vellumar",
      body: "Vellumar sank beneath the tide.",
    });
    await recordLinks(db, "w1", "vellumar", [{ dstSlug: "the-tide", anchor: "the tide" }]);
    // an edge from a not-yet-generated source page must be ignored by the join
    await recordLinks(db, "w1", "ghost", [{ dstSlug: "the-tide", anchor: "x" }]);

    const incoming = await getIncomingLinks(db, "w1", "the-tide");
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toMatchObject({
      srcSlug: "vellumar",
      fromTitle: "Vellumar",
      anchor: "the tide",
      body: "Vellumar sank beneath the tide.",
    });
  });

  it("recordLinks is idempotent per (src, dst) — keeps the first edge", async () => {
    await createWorld(db, { id: "w1", seed: "s" });
    await insertPage(db, { worldId: "w1", slug: "a", title: "A", body: "b" });
    await recordLinks(db, "w1", "a", [{ dstSlug: "x", anchor: "first" }]);
    await recordLinks(db, "w1", "a", [{ dstSlug: "x", anchor: "second" }]);

    const incoming = await getIncomingLinks(db, "w1", "x");
    expect(incoming).toHaveLength(1);
    expect(incoming[0].anchor).toBe("first");
  });
});
