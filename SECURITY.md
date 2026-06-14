# Security Policy

Thanks for helping keep Canonform and its users safe.

## Supported versions

Canonform is pre-1.0 and under active development. Only the latest `main` is supported;
fixes are applied there. There are no long-term-support branches yet.

## Reporting a vulnerability

**Please do not report security issues in public GitHub issues, pull requests, or on
social media.** Public disclosure before a fix puts users at risk.

Instead, report privately through one of:

1. **GitHub private vulnerability reporting** (preferred) — go to the repository's
   **Security** tab → **Report a vulnerability**. This opens a private advisory visible
   only to the maintainer.
2. **Direct message on X** — [@sablekithq](https://x.com/sablekithq) — if you can't use
   GitHub's reporting flow.

When you report, please include:

- a description of the issue and its potential impact,
- steps to reproduce (a proof-of-concept helps a lot),
- the affected version/commit, and any relevant configuration.

## What to expect

This project is maintained by one person, part-time:

- I aim to acknowledge a report within **a few days**.
- I'll confirm the issue, work on a fix, and coordinate a disclosure timeline with you.
- I'm happy to credit you in the release notes once a fix ships — let me know if you'd
  prefer to stay anonymous.
- There is no paid bug-bounty program; this is a free, open-source toy.

## Scope notes

Canonform generates fictional encyclopedia content with an LLM. **Generated text is
hallucinated and not factual** — that's the point of the toy, not a security issue.
Security reports should concern the software itself: for example secret/key exposure,
injection, auth or rate-limit/cost-control bypass, SSRF, or anything that lets one user
affect another user's worlds or the host's resources.
