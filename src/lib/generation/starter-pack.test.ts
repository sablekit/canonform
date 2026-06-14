import { describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../../db/schema";
import type { Database } from "../../db";
import { getPage, getIncomingLinks, getWorld } from "../../db/repo";
import { seedWorld } from "./starter-pack";

async function makeTestDb(): Promise<Database> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as Database;
}

// fake world-setup: a fixed name + facts
const fakeComplete = async () =>
  '{"worldName":"Vellumar","canonFacts":["The city sank in the Long Tide."]}';

// fake article stream: every article links to the same two entities
async function* fakeStream(): AsyncGenerator<string> {
  yield "An entry. See [[The Long Tide]] and [[The Glass Vaults]].";
}

describe("seedWorld", () => {
  it("creates the world and pre-generates an interlinked starter pack", async () => {
    const db = await makeTestDb();

    const { worldId, homeSlug } = await seedWorld(db, "A drowned city.", {
      complete: fakeComplete,
      stream: () => fakeStream(),
      makeId: () => "w-test",
    });

    expect(worldId).toBe("w-test");
    expect(homeSlug).toBe("vellumar");

    // world stored with the model's name + facts (L3)
    const world = await getWorld(db, "w-test");
    expect(world?.title).toBe("Vellumar");
    expect(world?.canonFacts).toEqual(["The city sank in the Long Tide."]);

    // home + the linked starter articles were generated
    expect((await getPage(db, "w-test", "vellumar"))?.title).toBe("Vellumar");
    expect(await getPage(db, "w-test", "the-long-tide")).toBeDefined();
    expect(await getPage(db, "w-test", "the-glass-vaults")).toBeDefined();

    // L2 is live from the start: the home links into a starter article
    const incoming = await getIncomingLinks(db, "w-test", "the-long-tide");
    expect(incoming.some((r) => r.srcSlug === "vellumar")).toBe(true);
  });
});
