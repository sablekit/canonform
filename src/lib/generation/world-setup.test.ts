import { describe, it, expect } from "vitest";
import { parseWorldSetup } from "./world-setup";

describe("parseWorldSetup", () => {
  it("parses clean JSON", () => {
    const r = parseWorldSetup(
      '{"worldName":"Vellumar","canonFacts":["Sank in the Long Tide","Memories are currency"]}',
      "seed",
    );
    expect(r.worldName).toBe("Vellumar");
    expect(r.canonFacts).toEqual(["Sank in the Long Tide", "Memories are currency"]);
  });

  it("extracts JSON from surrounding prose / code fences", () => {
    const r = parseWorldSetup(
      'Sure!\n```json\n{"worldName":"Aeravast","canonFacts":["A sky empire"]}\n```',
      "seed",
    );
    expect(r.worldName).toBe("Aeravast");
    expect(r.canonFacts).toEqual(["A sky empire"]);
  });

  it("caps canon facts at 5", () => {
    const r = parseWorldSetup(
      '{"worldName":"X","canonFacts":["1","2","3","4","5","6","7"]}',
      "s",
    );
    expect(r.canonFacts).toHaveLength(5);
  });

  it("ignores non-string / empty facts", () => {
    const r = parseWorldSetup(
      '{"worldName":"X","canonFacts":["ok",3,null,"  ","yes"]}',
      "s",
    );
    expect(r.canonFacts).toEqual(["ok", "yes"]);
  });

  it("falls back to a seed-derived name on garbage, never throwing", () => {
    const r = parseWorldSetup("not json at all", "A drowned city of glass.");
    expect(r.worldName.length).toBeGreaterThan(0);
    expect(r.canonFacts).toEqual([]);
  });
});
