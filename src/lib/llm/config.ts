/**
 * LLM configuration, read from the environment. We talk to OpenRouter's
 * OpenAI-compatible API so the model is a single swappable string.
 */
export interface LlmConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

// Cheap model by default (SPEC §4: the wow comes from skin + streaming + consistency,
// not model tier). Override per-world or globally with CANONFORM_MODEL.
const DEFAULT_MODEL = "google/gemini-2.0-flash-001";
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export function getLlmConfig(): LlmConfig {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set — copy .env.example to .env and add your key.",
    );
  }
  return {
    apiKey,
    model: process.env.CANONFORM_MODEL || DEFAULT_MODEL,
    baseUrl: process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL,
  };
}
