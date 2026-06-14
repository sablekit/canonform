# Canonform

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/sablekit/canonform/actions/workflows/ci.yml/badge.svg)](https://github.com/sablekit/canonform/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/sablekit/canonform?style=social)](https://github.com/sablekit/canonform/stargazers)

**Seed a fictional world in one sentence — get your own browsable, self-generating,
internally-consistent wiki for it.**

Type *"a desert empire that worships its own shadow"* and Canonform pre-generates a
handful of interlinked encyclopedia articles. Click any blue `[[link]]` and the next
article writes itself, live, token by token — then it's cached as canon forever.

> **Your world, not one shared hallucination.** Other self-writing wikis grow a single
> shared world that everyone edits. In Canonform, *each person seeds their own*
> persistent, consistent, shareable universe. Infinite wikis, plural.

> 🚧 **Status: early development.** v0.1 is being built in the open. Star the repo to
> follow along; expect rough edges until the first release.

## How it works

The whole experience is one tight loop:

```
seed → pre-generate 3–5 interlinked starter articles → Wikipedia-style page
     → click a [[link]] → stream-generate the new article → cache as canon → repeat
```

The hard part isn't generating text — it's keeping a growing, hallucinated world
**consistent with itself**. Canonform does that in three layers:

- **L1 — immutable cache as canon.** Once an article is generated it's frozen forever,
  keyed by `(world, slug)`. The same page never changes, which also kills the "same
  question, different answer" problem of non-deterministic models.
- **L2 — link-graph context injection.** When you reach article B by clicking a link in
  article A, A's content and the link's anchor text are injected into B's prompt — so B
  stays consistent with where you came from. Most "this feels inconsistent" moments come
  from contradictions between directly-linked entities; this is the highest-leverage fix.
- **L3 — per-world "world bible".** The seed plus a small, capped, append-only list of
  core canon facts is prepended to every generation and prompt-cached, so the world never
  forgets its own ground truth.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## Tech stack

Light by design — laptop-dev, no heavy infra.

- **Next.js** (App Router) with **SSE** streaming
- **OpenRouter** for the LLM (cheap model by default; bring-your-own-key supported)
- **Postgres** (via Drizzle ORM) for persistence and the link graph
- **Vercel** for hosting and edge-cached reads

## Quickstart

```bash
git clone https://github.com/sablekit/canonform.git
cd canonform
npm install
cp .env.example .env   # add your OpenRouter API key
npm run dev
```

Then open <http://localhost:3000> and seed your first world.

You'll need an [OpenRouter API key](https://openrouter.ai/keys). Generation cost is
designed to stay around **$0.001–0.006 per page** on a cheap model, and cached pages
cost nothing to read.

## Contributing

Issues and PRs are welcome — please read [CONTRIBUTING.md](CONTRIBUTING.md) first. This
is a deliberately small, sharp toy maintained by one person part-time, so scope-expanding
changes may be declined to keep it maintainable.

- 🐛 Found a bug? [Open an issue](https://github.com/sablekit/canonform/issues/new/choose).
- 🔒 Found a security problem? See [SECURITY.md](SECURITY.md) — please don't open a public issue.
- 💬 Questions or want to share a world you made? Find me on X: [@sablekithq](https://x.com/sablekithq).

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) © Sablekit
