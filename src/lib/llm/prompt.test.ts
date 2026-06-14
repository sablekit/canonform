import { describe, it, expect } from "vitest";
import { buildArticleMessages } from "./prompt";

const world = {
  seed: "A drowned city where memories are traded as currency.",
  title: "Vellumar",
  canonFacts: [
    "The city sank during the Long Tide.",
    "Memories are stored in glass vials.",
  ],
};

describe("buildArticleMessages", () => {
  it("returns a system message then a user message", () => {
    const msgs = buildArticleMessages({ world, targetTitle: "The Long Tide" });
    expect(msgs.map((m) => m.role)).toEqual(["system", "user"]);
  });

  it("puts the world bible — seed, title, canon facts — in the system message (L3)", () => {
    const [system] = buildArticleMessages({ world, targetTitle: "The Long Tide" });
    expect(system.content).toContain(world.seed);
    expect(system.content).toContain("Vellumar");
    expect(system.content).toContain("The city sank during the Long Tide.");
  });

  it("instructs the model to use [[wikilinks]]", () => {
    const [system] = buildArticleMessages({ world, targetTitle: "X" });
    expect(system.content).toContain("[[");
  });

  it("asks for the target title in the user message", () => {
    const user = buildArticleMessages({ world, targetTitle: "The Long Tide" })[1];
    expect(user.content).toContain("The Long Tide");
  });

  it("injects incoming-link context into the user message (L2)", () => {
    const user = buildArticleMessages({
      world,
      targetTitle: "The Long Tide",
      incomingLinks: [
        {
          fromTitle: "Vellumar",
          anchor: "the Long Tide",
          excerpt: "Vellumar sank beneath the Long Tide in a single night.",
        },
      ],
    })[1].content;
    expect(user).toContain("Vellumar");
    expect(user).toContain("sank beneath the Long Tide");
  });

  it("omits the references section when there are no incoming links", () => {
    const user = buildArticleMessages({ world, targetTitle: "X" })[1].content;
    expect(user).not.toContain("already referenced");
  });

  it("handles a world with no title and no canon facts", () => {
    const [system] = buildArticleMessages({
      world: { seed: "A library that dreams.", canonFacts: [] },
      targetTitle: "The Dreaming Stacks",
    });
    expect(system.content).toContain("A library that dreams.");
    expect(system.content).not.toContain("Established canon");
  });
});
