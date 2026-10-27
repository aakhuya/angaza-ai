**See the game beneath the game.**

AngazaBol is a football match intelligence platform that transforms synthetic match events into explainable, personalised insight. Where most football dashboards tell you *what* happened, AngazaBol explains **why it mattered** — and shows the evidence for every claim.

**Category:** Best Multi-Agent Orchestration
**Live demo:** https://angaza-ai.vercel.app
**Repository:** https://github.com/aakhuya/angaza-ai

---

## Quick start

Try the deployed app in one click: **[angaza-ai.vercel.app](https://angaza-ai.vercel.app)** → click **"Try it now — no signup"**.

A demo account is created automatically and you land on a live match. No forms.

---

## What it is

A five-stage intelligence pipeline over synthetic football events:
INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE

text

Each stage is a real, testable layer of the codebase:

| Stage | What it does | Where |
|---|---|---|
| **Ingest** | Receives synthetic events, validates against Pydantic discriminated-union schemas | `apps/api/app/schemas/events.py`, `apps/api/app/simulation/` |
| **Interpret** | Computes deterministic analytics — possession, progression, pressure, momentum, player involvement | `apps/api/app/analytics/compute.py` |
| **Explain** | Runs a four-agent pipeline over a validated `FactBundle` | `apps/api/app/agents/` |
| **Render** | Emits typed SSE envelopes to the browser | `apps/api/app/services/match_runner.py`, `apps/api/app/api/matches.py` |
| **Personalize** | Rewrites tone and depth per viewer mode — never the numbers | `apps/api/app/agents/personalization.py` |

---

## Agentic architecture

Four agents run per important event. Every output passes through a verification layer that rejects anything not grounded in the fact bundle.
Event received
↓
[Tactical Analysis] — identifies the tactical pattern in play
↓
[Match Intelligence] — explains why the moment matters
↓
[Narrative] — writes broadcast-style copy
↓
[Personalization] — rewrites for Casual / Analyst / Player Focus
↓
[Verification] — rejects unknown IDs, unverified numbers, unknown categories
↓
Insight published

text

**The verification layer is real.** `apps/api/app/agents/verification.py` runs pure-Python checks that reject any insight referencing a player ID not in the current roster, a number not present in the fact bundle, or an unknown category. Every rejection is recorded in `AgentExecutionStore` and visible at **`/agents`**.

**Try it:**

1. Open `https://angaza-ai.vercel.app` and click "Try it now"
2. Wait 15 seconds for insights to appear
3. Open `/agents?match_id=balanced-42-analyst`

Every row is written by the actual orchestrator, with real durations, providers, and rejection reasons. Nothing is mocked.

---

## How the same dataset appears across every tab

Every tab reads from the same deterministic simulation. Because the simulator is reproducible, replaying the same `(match_id, seed, scenario)` produces the exact state the live stream is producing — without any shared in-memory state.

| Tab | What it shows | Source |
|---|---|---|
| **Matches** | The eight fictional clubs, nicknames, and football identity. Two of them are paired by each scenario. | `GET /league/teams` → `apps/api/app/simulation/roster.py` |
| **Live** | The scenario's event stream, score, and per-tick statistics via SSE | `SimulationEngine(seed, scenario)` + `compute_state()` |
| **Analysis** | Team stats: possession, progressive passes, final-third entries, pressures, interceptions, top moments ranked by importance | `GET /live-data/snapshot` |
| **Recaps** | Story, turning point, standout players (real names, not IDs), statistics | `GET /live-data/recap` |
| **Players** | Every player with Kenyan first/last name, position, shirt number, club, and stats | `GET /live-data/players` |
| **Agents** | The four-agent pipeline plus rejection log | `GET /agents/executions?match_id=...` |

**What a judge can verify by clicking around:**

1. Start a match at `/matches/balanced`
2. Open `/analysis` — the numbers match the live page
3. Open `/recaps` — the story references the same final score
4. Open `/players` — the players generating events are the ones listed
5. Open `/agents?match_id=balanced-42-analyst` — every insight has a corresponding execution row

---

## Synthetic data architecture

The simulator is deterministic. `SimulationEngine(match_id, seed, scenario)` produces the same event stream on every run. This is what makes the analytics testable and the verification layer defensible.

**Five scenarios:** `balanced`, `high_press`, `dominant_possession`, `counter_attack`, `late_comeback`.

**Eight fictional clubs** appear at `/league`. Two of them — Angaza FC and Mwangaza United — play each scenario, because the simulator has one match at a time.

Player names are drawn from common Kenyan name components. Team nicknames and identities are invented. No real club or person is represented.

---

## Personalization

Three viewer modes, each producing visibly different copy for the same moment:

- **Casual** — short, plain, energetic
- **Analyst** — precise, tactical, metric-led
- **Player Focus** — centred on individual contribution

The Personalization agent is forbidden from changing any number or factual claim. Its input includes the validation-passed narrative; it only rewrites tone and emphasis.

---

## Technology

| Layer | Tool |
|---|---|
| Frontend | Next.js 16 (App Router), React, TypeScript, Tailwind v4 |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| Database | Postgres (Neon) in production; SQLite in dev |
| Real-time | Server-Sent Events (SSE) |
| Auth | Argon2id + JWT (HttpOnly cookies) + rotating refresh tokens |
| AI provider | `AIProvider` abstraction — Mock (default), DeepSeek (implemented), Microsoft Foundry (interface only) |

---

## What is implemented

- Deterministic seeded simulation with five scenarios
- Pure-Python analytics: possession, progression, pressure, momentum, player involvement
- Four-agent pipeline (Tactical → Match Intelligence → Narrative → Personalization)
- Verification layer with per-execution rejection logging
- `/agents` transparency page reading real executions
- SSE streaming of events, states, and insights
- Argon2id auth with rotating refresh tokens in HttpOnly cookies
- Onboarding wizard, profile, preferences, avatar upload (base64, persistent)
- Demo login (`POST /auth/demo`) with one-click "Try it now — no signup" on the landing page
- Eight-team league page
- Agent executions persisted to Postgres (`agent_executions` table) so `/agents` works reliably across serverless function instances
- Live matches tracked in Postgres (`live_matches` table) so `/analysis`, `/recaps`, `/players`, and `/agents` all show the same live match regardless of which tab or device opens them
- High-contrast onyx palette (`#020202` background, `#FAFAFA` text) with semantic gold / teal / red accents
- Responsive layout tested at 375 / 412 / 768 / 1024 / 1280 / 1440
- Accessibility: skip-to-content, focus rings, `aria-live`, reduced-motion support
- 68 backend tests including deterministic replay and verification rejection

---

## What is NOT implemented

The section above lists what's built. This lists what's not — because a submission that pretends is worse than one that is honest.

- **Microsoft Foundry transport** — the `AIProvider` interface is in place; the transport is not implemented. `apps/api/app/ai/foundry.py` raises `ProviderNotConfigured` until it is.
- **Google / Apple OAuth** — routes exist and return a clear 503 until credentials are provisioned.
- **Email delivery for password reset** — tokens are generated and stored; delivery is console-only in dev.
- **xG, heat maps, shot maps** — not collected by the simulator.
- **Push notifications** — not implemented.
- **Live news / transfer feeds / injury alerts** — not implemented.
- **League fixtures / standings with results** — the league page lists clubs; it does not simulate a season.
- **Azure deployment** — not used. Vercel (frontend + FastAPI) + Neon Postgres instead.

Everything listed as *implemented* is genuinely implemented and verifiable by clicking around the deployed app.

---

## Running locally

```bash
# Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../../.env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (in another terminal)
cd apps/web
pnpm install
cp .env.local.example .env.local
pnpm dev

---

## Judging criteria mapping

### 1. Technological Implementation (20%)

- Deterministic `SimulationEngine(seed, scenario)` — reproducibility is the point, not an accident
- Pydantic v2 discriminated-union event schemas
- SQLAlchemy 2.0 + Alembic migrations across dev (SQLite) and prod (Postgres)
- Argon2id password hashing; JWT with rotating refresh tokens in HttpOnly cookies
- 68 passing backend tests including hand-computed analytics fixtures
- Typed SSE envelope union — the frontend never sees raw AI responses
- Agent executions and live matches both persisted to Postgres — the pipeline survives serverless

### 2. Agentic Design & Innovation (20%)

- Four genuine agents in sequence: Tactical → Match Intelligence → Narrative → Personalization
- A verification layer that rejects unknown IDs, unverified numbers, unknown categories
- Per-agent execution records persisted to Postgres (`agent_executions` table), exposed at `/agents` — verifiable from any browser, tab, or device
- Live-match tracking persisted to Postgres (`live_matches` table) so the pipeline stays coherent across serverless function instances
- Provider abstraction with honest attribution (each `ChatResponse` carries the actual provider name)
- `/agents` shows real rows written by the actual orchestrator, with real durations, real providers, and real rejection reasons

**Category declared: Best Multi-Agent Orchestration.**

### 3. Real-World Impact & Applicability (20%)

- Real broadcaster / club / streaming-platform problem: turning event streams into audience-appropriate language
- Three viewer modes map to three real audiences (casual, analyst, player-focused)
- Architecture is designed so a real event provider (Opta, StatsBomb, in-venue) can replace the simulator behind the same interface
- Production deployment readiness: deployed on Vercel with Postgres, real auth, real persistence, real error handling
- Verification layer exists because broadcasters need to ship claims that survive audit

### 4. User Experience & Presentation (20%)

- High-contrast onyx-black theme (`#020202` background, `#FAFAFA` text) with gold, teal, and red used only for semantic meaning
- One-click "Try it now — no signup" on the landing page — a judge is inside a live match in under 3 seconds without a form
- Formation pitch rendered in SVG
- Live match page with insight feed, agent trace, momentum chart, and pause/resume controls
- Responsive across 375 / 412 / 768 / 1024 / 1280 / 1440
- Accessible: skip-to-content, focus rings, `aria-live` on feeds, reduced-motion support

### 5. Adherence to Hackathon Category (20%)

Every feature traces to the five-stage pipeline: INGEST → INTERPRET → EXPLAIN → RENDER → PERSONALIZE. Nothing was added that does not fit one of those stages.

