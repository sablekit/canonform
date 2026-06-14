import { describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../../db/schema";
import type { Database } from "../../db";
import { createWorld, getPage, getIncomingLinks } from "../../db/repo";
import { generateArticle } from "./article";

async function makeTestDb(): Promise<Database> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as Database;
}

// A fake model stream that emits a fixed article containing a [[wikilink]].
async function* fakeStream(): AsyncGenerator<string> {
  yield "Vellumar fell when ";
  yield "the [[Long Tide]] swallowed it.";
}

describe("generateArticle", () => {
  it("streams, freezes the page (L1), and records its links (L2)", async () => {
    const db = await makeTestDb();
    await createWorld(db, { id: "w1", seed: "A drowned city." });

    const deltas: string[] = [];
    for await (const delta of generateArticle(
      db,
      { worldId: "w1", slug: "vellumar", title: "Vellumar" },
      { stream: () => fakeStream() },
    )) {
      deltas.push(delta);
    }

    // streamed text reached the caller
    expect(deltas.join("")).toContain("Long Tide");

    // page was frozen with the full body (L1)
    const page = await getPage(db, "w1", "vellumar");
    expect(page?.title).toBe("Vellumar");
    expect(page?.body).toContain("[[Long Tide]]");

    // the outgoing edge vellumar → long-tide was recorded (L2): querying incoming
    // links of "long-tide" finds the source page "vellumar"
    const incoming = await getIncomingLinks(db, "w1", "long-tide");
    expect(incoming).toHaveLength(1);
    expect(incoming[0]).toMatchObject({ srcSlug: "vellumar", anchor: "Long Tide" });
  });

  it("throws if the world does not exist", async () => {
    const db = await makeTestDb();
    const gen = generateArticle(
      db,
      { worldId: "missing", slug: "x", title: "X" },
      { stream: () => fakeStream() },
    );
    await expect(gen.next()).rejects.toThrow(/World not found/);
  });
});
