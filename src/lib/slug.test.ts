import { describe, it, expect } from "vitest";
import { slugify, titleFromSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("The Drowned Archive")).toBe("the-drowned-archive");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugify("Smith & Sons, Ltd.")).toBe("smith-sons-ltd");
  });

  it("trims leading/trailing separators", () => {
    expect(slugify("  --Hello!--  ")).toBe("hello");
  });

  it("keeps non-Latin (e.g. Chinese) characters", () => {
    expect(slugify("龙之城 (传说)")).toBe("龙之城-传说");
  });

  it("falls back to 'untitled' for empty or punctuation-only input", () => {
    expect(slugify("!!!")).toBe("untitled");
    expect(slugify("")).toBe("untitled");
  });

  it("bounds slug length", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

describe("titleFromSlug", () => {
  it("title-cases a hyphenated slug", () => {
    expect(titleFromSlug("the-long-tide")).toBe("The Long Tide");
  });

  it("keeps non-Latin characters", () => {
    expect(titleFromSlug("龙之城-传说")).toBe("龙之城 传说");
  });

  it("returns 'Untitled' for an empty slug", () => {
    expect(titleFromSlug("")).toBe("Untitled");
  });
});
