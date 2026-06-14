# Architecture

> **Living document — keep it in sync with the code.** If you change a flow, a
> module boundary, or the data model, update this file in the same change.
> Paths marked `TODO` are not built yet; fill them in as you go.

## What Canonform is
Seed a fictional world in one sentence, then browse a Wikipedia-style wiki for it:
every article is generated on first visit by an LLM, every link spawns a new
article, and the world stays internally consistent and persistent as it grows.
Each world is its own namespace.

## Request flows

### 1. Seed a world
User submits a one-sentence seed → create a `world` row (id, seed, initial canon
facts) → **pre-generate 3–5 interlinked starter articles** so the world isn't an
empty shell → redirect to the world's home article.

### 2. Open an article — the core loop
`GET /w/{worldId}/{slug}`
1. If the page is cached (`pages` row exists) → serve it (immutable; from cache/CDN).
2. If not → **generate**:
   1. Build the prompt: world bible (L3) + source-link context (L2) + style rules.
   2. Stream the article (SSE) token-by-token to the client.
   3. Parse `[[wikilinks]]`; record link edges.
   4. On completion, write the page to cache **atomically** (only fully-generated pages).
3. Every later visit is a cache hit.

## Consistency model — the moat (understand this part deeply)
- **L1 — immutable cache-as-canon.** A generated page is frozen forever, keyed by
  `(worldId, slug)`; the same page never regenerates. Kills "same page, different
  answer" drift. Module: `TODO`.
- **L2 — link-graph context injection.** When generating page B reached from page A,
  inject A's text (or summary) + the link anchor into B's prompt so B stays
  consistent with A. Highest-leverage consistency move. Module: `TODO`.
- **L3 — per-world "world bible" prefix.** Seed sentence + a small, capped,
  append-only list of core canon facts, prepended to every generation and marked
  for prompt-caching. Module: `TODO`.
- **L4 (deferred)** — embeddings/RAG over generated pages, only once a world
  routinely exceeds the context window.

## Data model
- `worlds` — `id`, `seed`, `canon_facts` (capped list), `visibility`, `created_at`
- `pages`  — `world_id`, `slug`, `title`, `body`, `status`, `created_at`
- `links`  — `world_id`, `src_slug`, `dst_slug`, `anchor`, `context_hint`

## Caching & cost controls (see SPEC §4)
- Every page cached permanently and immutably → reads are ~free, served from edge/CDN.
- Prompt-cache the L3 world-bible prefix.
- Per-IP rate limit on **new-page generation**; global **daily spend kill-switch**.
- Cheap model by default; optional BYO-key tier.

## Tech stack
Principle: light, laptop-dev, zero heavy infra (no cluster, no Prometheus, no service mesh).

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** + **SSE** streaming | Server-generated articles stream token-by-token to the client (watching it "write itself" is the payoff). |
| LLM access | **OpenRouter** | One endpoint over many models — easy model swap and fallback. Cheap model by default; optional BYO-key tier. |
| Database | **Postgres** (managed, e.g. Neon) via **Drizzle ORM** | The `links` graph drives L2, so relational queries matter; SQLite/KV fit serverless poorly or can't hold the relations. Drizzle is light and TS-native. |
| Deploy / edge | **Vercel** | First-class Next.js host: SSE, edge cache, and Postgres integration are zero-config. |
| Caching | CDN/edge for reads · DB row = L1 canon · prompt-cache the L3 prefix | Immutable pages mean reads are ~free; only true new pages hit the LLM. |

Deferred alternatives (kept for context): Cloudflare for deploy, SQLite/KV for storage —
revisit only if a concrete need outgrows the above.

## Module map
| Area | Path | Notes |
|---|---|---|
| Seed / world create | `TODO` | + starter-pack pre-generation |
| Article page (SSR + stream) | `TODO` | the core loop |
| Prompt build (L2 + L3) | `TODO` | the moat |
| Cache / persistence | `TODO` | L1 |
| Rate limit / spend cap | `TODO` | survival |
