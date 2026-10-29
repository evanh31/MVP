# Lendz Executive Sales Outreach — Analytics Hub MVP

Leadership-first dashboard for Team Grok / Lendz bots that discover loan originators (LOs), match them to Account Executives (AEs), and run Outlook email outreach.

## What’s included

| Surface | Purpose |
|---|---|
| **Overview** | KPIs: discoveries, match coverage, email funnel, open opportunities, AE skew; five-bot health strip |
| **New LOs** | LO, company, engine target competitor, volume funded, matched AE, status, first_seen |
| **Opportunities** | Engine-driven target competitors + LO counts/volume + edge + aging |
| **Outreach** | Email funnel chart + attempt log (Graph message ids when present) |
| **Matches** | LO↔AE score/reasons + unmatched tab |
| **AEs** | Per-AE open matches / pending outreach / conversion |
| **Bots** | Recent runs for the five named Lendz bots |
| **`POST /api/ingest/events`** | Append-only event ingest with entity upserts |
| **Seed / demo data** | Realistic yesterday-shaped pipeline for local demos |
| **Postgres-ready schema** | `prisma/schema.prisma` + `docker-compose.yml` |

## Quick start

```bash
npm install
npm run seed    # writes demo data to .data/hub.json
npm run dev     # http://localhost:3000
```

If you skip `seed`, the hub auto-seeds on first page load when the store is empty.

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run seed` | Reset demo store from seed events |
| `npm run rollup` | Materialize Overview daily rollup metrics |
| `npm run lint` | ESLint |

## Ingest API

```http
POST /api/ingest/events
Content-Type: application/json
x-ingest-secret: <INGEST_SHARED_SECRET>
```

Single event or batch:

```json
{
  "event_id": "uuid",
  "ts": "2026-10-29T20:00:00Z",
  "bot": "Lendz Research",
  "run_id": "uuid",
  "type": "lo.discovered",
  "payload": {
    "lo_key": "lo-maya-chen",
    "name": "Maya Chen",
    "company": "Pacific Nest Realty",
    "source_site": "nmlsconsumeraccess.org",
    "competitor_key": "comp-harbor-home",
    "volume_funded": 4200000
  }
}
```

Or `{ "events": [ /* envelopes */ ] }`.

### Bot enum

`Lendz Research` · `Lendz AE Assistant` · `Lendz Orchestrator` · `Lendz Matching & Strategy` · `Lendz Outreach`

### Event types (MVP)

| Bot | Emits |
|---|---|
| All | `run.started`, `run.completed`, `run.failed` |
| Research | `lo.discovered` |
| Orchestrator | `ae.upserted` |
| Matching & Strategy | `match.created`, `competitor.targeted`, `edge.computed` |
| Outreach | `outreach.queued\|sent\|delivered\|bounced\|opened\|replied` |

`GET /api/ingest/events` returns the contract summary.

## Data architecture

- **Demo / local default:** append-only event log + derived entities in `.data/hub.json` (gitignored).
- **Postgres-ready:** `prisma/schema.prisma` mirrors the entity model (events, LOs, competitors, edges, AEs, matches, outreach, opportunities, daily rollups).
- Bring up Postgres with `docker compose up -d`, set `DATABASE_URL` from `.env.example`, then `npx prisma db push` when you wire the Prisma client for production.

AE roster path for MVP: Orchestrator `ae.upserted` events or `npm run seed` (manual CSV-equivalent).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Recharts
- Zod request validation
- Prisma schema targeting PostgreSQL
- File-backed demo store so the hub runs without infra

## Auth / Graph notes

Auth (Entra) and live Microsoft Graph mailbox wiring are intentionally deferred — open decisions in the project brief. Ingest shared secret is the only gate for MVP.

## Example curl

```bash
curl -s http://localhost:3000/api/ingest/events \
  -H 'content-type: application/json' \
  -d '{
    "event_id": "demo-1",
    "ts": "2026-10-29T21:00:00Z",
    "bot": "Lendz Research",
    "run_id": "demo-run",
    "type": "run.started",
    "payload": { "stage": "research" }
  }'
```
