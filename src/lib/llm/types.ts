/**
 * Provider-agnostic chat types. OpenRouter (and OpenAI-compatible providers) all
 * speak this `{ role, content }[]` shape, so the prompt builder and the client can
 * share it without coupling to any one SDK.
 */
export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}
