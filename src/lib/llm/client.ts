/**
 * OpenRouter streaming chat client. Sends a ChatMessage[] (from the prompt builder)
 * and yields text deltas as they arrive, so the article can be streamed to the
 * browser token-by-token (the "watch it write itself" payoff).
 *
 * Server-only: it reads the API key from the environment. The fiddly SSE parsing
 * lives in ./sse so it can be tested without a network call.
 */
import { getLlmConfig } from "./config";
import { parseDataLine } from "./sse";
import type { ChatMessage } from "./types";

export interface ChatOptions {
  /** Override the configured model for this call. */
  model?: string;
  /** Prose variety; SPEC §5 wants this high to avoid templated articles. */
  temperature?: number;
  /** Abort the request (e.g. on a server-side timeout). */
  signal?: AbortSignal;
}

/** Stream a chat completion, yielding text deltas in order. */
export async function* streamChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): AsyncGenerator<string> {
  const cfg = getLlmConfig();

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter attribution (optional but recommended).
      "HTTP-Referer": "https://github.com/sablekit/canonform",
      "X-Title": "Canonform",
    },
    body: JSON.stringify({
      model: options.model ?? cfg.model,
      messages,
      stream: true,
      temperature: options.temperature ?? 0.9,
    }),
    signal: options.signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${res.status} ${res.statusText}): ${detail.slice(0, 300)}`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines; keep the trailing partial line in the buffer.
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      const delta = parseDataLine(line);
      if (delta) yield delta;
    }
  }

  // Flush a trailing line with no final newline.
  const tail = parseDataLine(buffer);
  if (tail) yield tail;
}

/** Convenience: run a streaming completion to completion and return the full text. */
export async function generateChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  let out = "";
  for await (const delta of streamChat(messages, options)) out += delta;
  return out;
}
