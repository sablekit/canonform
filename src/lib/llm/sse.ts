/**
 * Pure helpers for parsing the Server-Sent-Events stream from an OpenAI-compatible
 * chat completion. Kept separate from the network client so the fiddly parsing is
 * unit-testable without a live request.
 *
 * A streamed completion looks like:
 *   data: {"choices":[{"delta":{"content":"Hello"}}]}
 *   data: {"choices":[{"delta":{"content":" world"}}]}
 *   data: [DONE]
 * with occasional ":"-prefixed comment/keep-alive lines.
 */

/**
 * Extract the text delta from a single SSE line. Returns null for anything that
 * isn't a content chunk — keep-alives, the `[DONE]` sentinel, blanks, or malformed
 * JSON (we never throw on a bad line; we just skip it).
 */
export function parseDataLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;

  const payload = trimmed.slice("data:".length).trim();
  if (payload === "" || payload === "[DONE]") return null;

  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.delta?.content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}
