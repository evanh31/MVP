import { NextRequest, NextResponse } from "next/server";
import { ingestEnvelopeSchema, ingestBodySchema } from "@/lib/event-schema";
import { ingestEvent, ingestEvents } from "@/lib/ingest";
import type { IngestEnvelope } from "@/lib/types";

function authorized(req: NextRequest): boolean {
  const expected = process.env.INGEST_SHARED_SECRET;
  if (!expected) {
    // Dev-friendly default: allow when secret unset
    return true;
  }
  const header = req.headers.get("x-ingest-secret");
  const bearer = req.headers.get("authorization");
  const token = header ?? (bearer?.startsWith("Bearer ") ? bearer.slice(7) : null);
  return token === expected;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ingestBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid event envelope", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if ("events" in parsed.data) {
    const events = parsed.data.events as IngestEnvelope[];
    // Re-validate individually for clearer errors
    for (const e of events) {
      const one = ingestEnvelopeSchema.safeParse(e);
      if (!one.success) {
        return NextResponse.json(
          { error: "Invalid event in batch", details: one.error.flatten() },
          { status: 400 },
        );
      }
    }
    const result = ingestEvents(events);
    return NextResponse.json({
      ok: true,
      accepted: result.accepted,
      duplicates: result.duplicates,
    });
  }

  const result = ingestEvent(parsed.data as IngestEnvelope);
  return NextResponse.json({
    ok: true,
    accepted: result.accepted ? 1 : 0,
    duplicates: result.duplicate ? 1 : 0,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/ingest/events",
    auth: "Header x-ingest-secret or Authorization: Bearer <INGEST_SHARED_SECRET>",
    envelope: {
      event_id: "uuid",
      ts: "ISO-8601",
      bot: "Lendz Research|Lendz AE Assistant|Lendz Orchestrator|Lendz Matching & Strategy|Lendz Outreach",
      run_id: "uuid",
      type: "run.started|run.completed|run.failed|lo.discovered|competitor.targeted|edge.computed|ae.upserted|match.created|outreach.*",
      payload: {},
    },
  });
}
