import { describe, it, expect } from "vitest";
import { parseWikiLinks, uniqueLinkEdges, linkifyWikilinks } from "./wikilinks";

describe("parseWikiLinks", () => {
  it("parses a simple [[link]]", () => {
    const [link] = parseWikiLinks("See the [[Drowned Archive]] for more.");
    expect(link).toMatchObject({
      target: "Drowned Archive",
      anchor: "Drowned Archive",
      slug: "drowned-archive",
    });
  });

  it("parses [[target|anchor]] with a custom anchor", () => {
    const [link] = parseWikiLinks("the [[Drowned Archive|archive]] sank");
    expect(link).toMatchObject({
      target: "Drowned Archive",
      anchor: "archive",
      slug: "drowned-archive",
    });
  });

  it("extracts multiple links in document order", () => {
    const links = parseWikiLinks("[[A]] then [[B]] then [[C]]");
    expect(links.map((l) => l.target)).toEqual(["A", "B", "C"]);
  });

  it("ignores empty or whitespace-only brackets", () => {
    expect(parseWikiLinks("[[]] and [[ ]]")).toEqual([]);
  });

  it("trims whitespace inside the brackets", () => {
    const [link] = parseWikiLinks("[[  The Spire  |  the spire  ]]");
    expect(link).toMatchObject({ target: "The Spire", anchor: "the spire" });
  });
});

describe("uniqueLinkEdges", () => {
  it("collapses duplicate targets to one edge, keeping the first anchor", () => {
    const edges = uniqueLinkEdges(
      parseWikiLinks("[[Spire]], later [[Spire|the spire]] again"),
    );
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ slug: "spire", anchor: "Spire" });
  });
});

describe("linkifyWikilinks", () => {
  it("rewrites [[Target]] into a markdown link to the world page", () => {
    expect(linkifyWikilinks("See [[The Long Tide]].", "w1")).toBe(
      "See [The Long Tide](/w/w1/the-long-tide).",
    );
  });

  it("uses the anchor text for [[Target|anchor]]", () => {
    expect(linkifyWikilinks("the [[The Long Tide|tide]] rose", "w1")).toBe(
      "the [tide](/w/w1/the-long-tide) rose",
    );
  });

  it("rewrites multiple links and leaves surrounding text untouched", () => {
    expect(linkifyWikilinks("[[A]] and [[B]]!", "w9")).toBe(
      "[A](/w/w9/a) and [B](/w/w9/b)!",
    );
  });
});
