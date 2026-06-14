# Contributing to Canonform

Thanks for your interest! A few things up front so we don't waste each other's time.

## What Canonform is (and isn't)
Canonform is a small toy: seed a fictional world, then browse a wiki that writes
itself and stays consistent. The goal is to keep the **core small and the
experience sharp**. It is intentionally **not** a simulation, an "AI town," or a
general website generator.

Because of that, I may decline contributions that expand scope — even good ones —
to keep the project maintainable. Nothing personal.

## Reporting a bug
Search existing issues first, then open one with:
- what you did (steps to reproduce)
- what you expected vs. what actually happened
- your environment (browser; the model/seed if relevant)
- a screenshot or the world/article URL if you can

**A bug without a reproduction is hard to act on** and may be closed until one is
provided.

## Suggesting a feature
Open an issue describing the **problem** first, not just the solution. If it fits
the small-and-sharp scope, great — if not, I'll say so honestly.

## Pull requests
- **Open an issue first** for anything non-trivial, so we agree on the approach
  before you spend time.
- **Keep PRs small and focused** — one thing per PR. Large, mixed PRs are hard to
  review and tend to stall.
- **Include a test** for behavior changes, and make sure existing tests pass.
- Say **what** changed and **why**.

I review every PR carefully and won't merge what I can't fully evaluate — so
smaller, clearer changes get merged faster.

## What to expect
This is maintained by one person, part-time. I aim to respond within a few days;
please be patient. Issues tagged `help wanted` are open for anyone to take.

## Dev setup
```bash
git clone <repo>
cd canonform
npm install
cp .env.example .env   # add your LLM API key
npm run dev
```
See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.

## A note on AI
Canonform is built with heavy AI assistance, then human-reviewed and maintained.
If you submit AI-generated code, please make sure it's something **you understand
and have tested** — I hold contributions to the same bar I hold my own.

## License
By contributing, you agree your contributions are licensed under the project's
[LICENSE](LICENSE).

Questions? Reach out on X: [@sablekithq](https://x.com/sablekithq)
