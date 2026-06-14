/**
 * Bootstrap a world from its seed: ask the model for a name and a few core canon
 * facts, which become the world title and the initial L3 "world bible".
 *
 * Cheap models return imperfect JSON, so `parseWorldSetup` is lenient — it extracts
 * the first JSON object, validates loosely, and falls back to a name derived from the
 * seed rather than ever throwing. The parser is pure and unit-tested.
 */
import { generateChat } from "../llm/client";
import type { ChatMessage } from "../llm/types";

export interface WorldSetup {
  worldName: string;
  canonFacts: string[];
}

export interface WorldSetupDeps {
  /** Override the model call (used by tests). Defaults to the OpenRouter client. */
  complete?: (messages: ChatMessage[]) => Promise<string>;
}

const MAX_FACTS = 5;

export async function generateWorldSetup(
  seed: string,
  deps: WorldSetupDeps = {},
): Promise<WorldSetup> {
  const complete = deps.complete ?? generateChat;
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        'You are setting up a fictional world for an in-world encyclopedia. Given a one-sentence seed, respond with ONLY a JSON object — no prose, no code fences — of the form {"worldName": string, "canonFacts": string[]}, where canonFacts is 3–5 short, concrete facts that anchor the world (its name, era, a couple of key entities).',
    },
    { role: "user", content: `Seed: "${seed}"` },
  ];
  const raw = await complete(messages);
  return parseWorldSetup(raw, seed);
}

/** Parse the model's (possibly messy) reply into a WorldSetup, never throwing. */
export function parseWorldSetup(raw: string, seed: string): WorldSetup {
  const match = raw.match(/\{[\s\S]*\}/); // first {...} block, ignoring fences/prose
  if (match) {
    try {
      const obj = JSON.parse(match[0]) as {
        worldName?: unknown;
        canonFacts?: unknown;
      };
      const worldName =
        typeof obj.worldName === "string" && obj.worldName.trim()
          ? obj.worldName.trim()
          : fallbackName(seed);
      const canonFacts = Array.isArray(obj.canonFacts)
        ? obj.canonFacts
            .filter((f): f is string => typeof f === "string" && f.trim() !== "")
            .map((f) => f.trim())
            .slice(0, MAX_FACTS)
        : [];
      return { worldName, canonFacts };
    } catch {
      // fall through to the fallback
    }
  }
  return { worldName: fallbackName(seed), canonFacts: [] };
}

/** When the model gives us nothing usable, name the world from the seed itself. */
function fallbackName(seed: string): string {
  const words = seed.trim().split(/\s+/).slice(0, 4).join(" ").replace(/[.,!?;:]+$/, "");
  return words || "An Unnamed World";
}
