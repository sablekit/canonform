import { describe, it, expect } from "vitest";
import { parseDataLine } from "./sse";

describe("parseDataLine", () => {
  it("extracts the content delta from a data line", () => {
    expect(
      parseDataLine('data: {"choices":[{"delta":{"content":"Hello"}}]}'),
    ).toBe("Hello");
  });

  it("preserves whitespace inside the content", () => {
    expect(
      parseDataLine('data: {"choices":[{"delta":{"content":" world"}}]}'),
    ).toBe(" world");
  });

  it("returns null for the [DONE] sentinel", () => {
    expect(parseDataLine("data: [DONE]")).toBeNull();
  });

  it("returns null for comment/keep-alive lines", () => {
    expect(parseDataLine(": OPENROUTER PROCESSING")).toBeNull();
    expect(parseDataLine("")).toBeNull();
  });

  it("returns null when the delta has no content (e.g. a role-only chunk)", () => {
    expect(
      parseDataLine('data: {"choices":[{"delta":{"role":"assistant"}}]}'),
    ).toBeNull();
  });

  it("never throws on malformed JSON — returns null", () => {
    expect(parseDataLine("data: {not valid json")).toBeNull();
  });
});
