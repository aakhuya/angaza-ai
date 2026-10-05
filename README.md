# Angaza AI

**Illuminate Every Moment.**

Explainable football match intelligence built for the Microsoft Premier League Hackathon.

## Status

- Phase 1 — project foundation (complete)
- Phase 2 — synthetic event simulation (complete)
- Phase 3 — deterministic analytics (complete)
- Phase 4 — real-time pipeline (in progress)

See docs/architecture.md for the phase log.

## Local development

One-time setup:

    make api-install
    make web-install

Run in two terminals:

    make api-dev     # http://localhost:8000
    make web-dev     # http://localhost:3000

Lint and test:

    make api-lint
    make api-test
