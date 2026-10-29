import { randomUUID } from "crypto";
import type { IngestEnvelope } from "./types";

/** Deterministic-ish demo timeline ending ~"yesterday" relative to a fixed ref. */
const REF = new Date("2026-10-29T18:00:00Z");

function hoursAgo(h: number): string {
  return new Date(REF.getTime() - h * 60 * 60 * 1000).toISOString();
}

function event(
  partial: Omit<IngestEnvelope, "event_id"> & { event_id?: string },
): IngestEnvelope {
  return {
    event_id: partial.event_id ?? randomUUID(),
    ts: partial.ts,
    bot: partial.bot,
    run_id: partial.run_id,
    type: partial.type,
    payload: partial.payload,
  };
}

const RUN_RESEARCH = "run-research-001";
const RUN_MATCH = "run-match-001";
const RUN_OUTREACH = "run-outreach-001";
const RUN_ORCH = "run-orch-001";
const RUN_AE_ASSIST = "run-ae-assist-001";

export function buildSeedEvents(): IngestEnvelope[] {
  const events: IngestEnvelope[] = [];

  // Orchestrator AE roster sync
  events.push(
    event({
      ts: hoursAgo(30),
      bot: "Lendz Orchestrator",
      run_id: RUN_ORCH,
      type: "run.started",
      payload: { stage: "ae_sync" },
    }),
  );

  const aes = [
    {
      ae_key: "ae-jordan-lee",
      name: "Jordan Lee",
      email: "jordan.lee@lendz.com",
      interests: ["Michigan", "golf", "Spanish"],
    },
    {
      ae_key: "ae-samira-khan",
      name: "Samira Khan",
      email: "samira.khan@lendz.com",
      interests: ["UCLA", "soccer", "Mandarin"],
    },
    {
      ae_key: "ae-chris-nguyen",
      name: "Chris Nguyen",
      email: "chris.nguyen@lendz.com",
      interests: ["Texas A&M", "fishing", "Vietnamese"],
    },
    {
      ae_key: "ae-alex-rivera",
      name: "Alex Rivera",
      email: "alex.rivera@lendz.com",
      interests: ["Florida", "pickleball", "Portuguese"],
    },
  ];

  for (const ae of aes) {
    events.push(
      event({
        ts: hoursAgo(29.5),
        bot: "Lendz Orchestrator",
        run_id: RUN_ORCH,
        type: "ae.upserted",
        payload: {
          ...ae,
          active: true,
          orchestrator_ref: `orch://${ae.ae_key}`,
        },
      }),
    );
  }

  events.push(
    event({
      ts: hoursAgo(29),
      bot: "Lendz Orchestrator",
      run_id: RUN_ORCH,
      type: "run.completed",
      payload: { stage: "ae_sync", counts: { aes: aes.length } },
    }),
  );

  // Matching & Strategy receives engine targets
  events.push(
    event({
      ts: hoursAgo(26),
      bot: "Lendz Matching & Strategy",
      run_id: RUN_MATCH,
      type: "run.started",
      payload: { stage: "strategy" },
    }),
  );

  const competitors = [
    {
      competitor_key: "comp-harbor-home",
      name: "Harbor Home Lending",
      scenario_ref: "sc-harbor-q4",
      edge_summary: "+18 bps rate edge on 30yr conforming",
    },
    {
      competitor_key: "comp-summit-mtg",
      name: "Summit Mortgage Co",
      scenario_ref: "sc-summit-q4",
      edge_summary: "+12 bps + waived origination",
    },
    {
      competitor_key: "comp-cedar-capital",
      name: "Cedar Capital Mortgage",
      scenario_ref: "sc-cedar-q4",
      edge_summary: "+22 bps on jumbo",
    },
  ];

  for (const c of competitors) {
    events.push(
      event({
        ts: hoursAgo(25.5),
        bot: "Lendz Matching & Strategy",
        run_id: RUN_MATCH,
        type: "competitor.targeted",
        payload: {
          ...c,
          engine_run_id: "engine-2026-10-28",
        },
      }),
    );
  }

  // Research discoveries
  events.push(
    event({
      ts: hoursAgo(24),
      bot: "Lendz Research",
      run_id: RUN_RESEARCH,
      type: "run.started",
      payload: { stage: "research", source_site: "nmlsconsumeraccess.org" },
    }),
  );

  const los = [
    {
      lo_key: "lo-maya-chen",
      name: "Maya Chen",
      company: "Pacific Nest Realty",
      source_site: "nmlsconsumeraccess.org",
      competitor_key: "comp-harbor-home",
      volume_funded: 4200000,
      ae_key: "ae-samira-khan",
      score: 0.91,
      reasons: ["UCLA", "Mandarin", "geography"],
    },
    {
      lo_key: "lo-derek-holt",
      name: "Derek Holt",
      company: "Holt Family Lending",
      source_site: "nmlsconsumeraccess.org",
      competitor_key: "comp-summit-mtg",
      volume_funded: 2800000,
      ae_key: "ae-jordan-lee",
      score: 0.84,
      reasons: ["Michigan", "golf"],
    },
    {
      lo_key: "lo-priya-nair",
      name: "Priya Nair",
      company: "Southfork Mortgage Group",
      source_site: "lenderlist.demo",
      competitor_key: "comp-cedar-capital",
      volume_funded: 6100000,
      ae_key: "ae-chris-nguyen",
      score: 0.88,
      reasons: ["Texas A&M", "geography"],
    },
    {
      lo_key: "lo-evan-brooks",
      name: "Evan Brooks",
      company: "Brooks & Co Home Loans",
      source_site: "lenderlist.demo",
      competitor_key: "comp-harbor-home",
      volume_funded: 1500000,
      ae_key: "ae-alex-rivera",
      score: 0.76,
      reasons: ["pickleball", "Florida"],
    },
    {
      lo_key: "lo-nina-vasquez",
      name: "Nina Vasquez",
      company: "Coastal Originators LLC",
      source_site: "nmlsconsumeraccess.org",
      competitor_key: "comp-summit-mtg",
      volume_funded: 3900000,
      ae_key: "ae-jordan-lee",
      score: 0.82,
      reasons: ["Spanish", "geography"],
    },
    {
      lo_key: "lo-omar-farid",
      name: "Omar Farid",
      company: "Farid Capital Partners",
      source_site: "lenderlist.demo",
      competitor_key: "comp-cedar-capital",
      volume_funded: 2200000,
      // unmatched intentionally
    },
    {
      lo_key: "lo-taylor-kim",
      name: "Taylor Kim",
      company: "Kim & Partners Lending",
      source_site: "nmlsconsumeraccess.org",
      competitor_key: "comp-harbor-home",
      volume_funded: 5100000,
      ae_key: "ae-samira-khan",
      score: 0.79,
      reasons: ["Mandarin", "geography"],
    },
    {
      lo_key: "lo-riley-jones",
      name: "Riley Jones",
      company: "Jones Home Finance",
      source_site: "lenderlist.demo",
      competitor_key: "comp-summit-mtg",
      volume_funded: 980000,
      ae_key: "ae-alex-rivera",
      score: 0.71,
      reasons: ["Florida"],
    },
  ];

  los.forEach((lo, i) => {
    events.push(
      event({
        ts: hoursAgo(23 - i * 0.3),
        bot: "Lendz Research",
        run_id: RUN_RESEARCH,
        type: "lo.discovered",
        payload: {
          lo_key: lo.lo_key,
          name: lo.name,
          company: lo.company,
          source_site: lo.source_site,
          competitor_key: lo.competitor_key,
          volume_funded: lo.volume_funded,
        },
      }),
    );

    events.push(
      event({
        ts: hoursAgo(22.5 - i * 0.3),
        bot: "Lendz Matching & Strategy",
        run_id: RUN_MATCH,
        type: "edge.computed",
        payload: {
          lo_key: lo.lo_key,
          competitor_key: lo.competitor_key,
          edge_bps_or_label:
            competitors.find((c) => c.competitor_key === lo.competitor_key)
              ?.edge_summary ?? "+10 bps",
          volume_funded: lo.volume_funded,
          engine_run_id: "engine-2026-10-28",
        },
      }),
    );
  });

  events.push(
    event({
      ts: hoursAgo(20),
      bot: "Lendz Research",
      run_id: RUN_RESEARCH,
      type: "run.completed",
      payload: {
        stage: "research",
        source_site: "nmlsconsumeraccess.org",
        counts: { discovered: los.length },
      },
    }),
  );

  // Matches
  los.forEach((lo, i) => {
    if (!("ae_key" in lo) || !lo.ae_key) return;
    events.push(
      event({
        ts: hoursAgo(19 - i * 0.2),
        bot: "Lendz Matching & Strategy",
        run_id: RUN_MATCH,
        type: "match.created",
        payload: {
          lo_key: lo.lo_key,
          ae_key: lo.ae_key,
          score: lo.score,
          reasons: lo.reasons,
        },
      }),
    );
  });

  events.push(
    event({
      ts: hoursAgo(17),
      bot: "Lendz Matching & Strategy",
      run_id: RUN_MATCH,
      type: "run.completed",
      payload: { stage: "match", counts: { matches: 7, unmatched: 1 } },
    }),
  );

  // AE Assistant light run
  events.push(
    event({
      ts: hoursAgo(16),
      bot: "Lendz AE Assistant",
      run_id: RUN_AE_ASSIST,
      type: "run.started",
      payload: { stage: "assist" },
    }),
    event({
      ts: hoursAgo(15.8),
      bot: "Lendz AE Assistant",
      run_id: RUN_AE_ASSIST,
      type: "run.completed",
      payload: { stage: "assist", counts: { briefs: 4 } },
    }),
  );

  // Outreach funnel
  events.push(
    event({
      ts: hoursAgo(14),
      bot: "Lendz Outreach",
      run_id: RUN_OUTREACH,
      type: "run.started",
      payload: { stage: "email" },
    }),
  );

  const outreachTargets = los.filter((lo) => "ae_key" in lo && lo.ae_key);
  outreachTargets.forEach((lo, i) => {
    const attemptId = `att-${lo.lo_key}`;
    const base = 13 - i * 0.4;
    events.push(
      event({
        ts: hoursAgo(base),
        bot: "Lendz Outreach",
        run_id: RUN_OUTREACH,
        type: "outreach.queued",
        payload: {
          attempt_id: attemptId,
          lo_key: lo.lo_key,
          ae_key: lo.ae_key,
          channel: "email",
        },
      }),
      event({
        ts: hoursAgo(base - 0.1),
        bot: "Lendz Outreach",
        run_id: RUN_OUTREACH,
        type: "outreach.sent",
        payload: {
          attempt_id: attemptId,
          lo_key: lo.lo_key,
          ae_key: lo.ae_key,
          channel: "email",
          graph_message_id: `graph-msg-${i + 1}`,
        },
      }),
    );

    // Delivered / opened / replied for a subset
    if (i < 6) {
      events.push(
        event({
          ts: hoursAgo(base - 0.2),
          bot: "Lendz Outreach",
          run_id: RUN_OUTREACH,
          type: "outreach.delivered",
          payload: {
            attempt_id: attemptId,
            lo_key: lo.lo_key,
            ae_key: lo.ae_key,
            channel: "email",
            graph_message_id: `graph-msg-${i + 1}`,
          },
        }),
      );
    }
    if (i < 4) {
      events.push(
        event({
          ts: hoursAgo(base - 1),
          bot: "Lendz Outreach",
          run_id: RUN_OUTREACH,
          type: "outreach.opened",
          payload: {
            attempt_id: attemptId,
            lo_key: lo.lo_key,
            ae_key: lo.ae_key,
            channel: "email",
            graph_message_id: `graph-msg-${i + 1}`,
          },
        }),
      );
    }
    if (i < 2) {
      events.push(
        event({
          ts: hoursAgo(base - 2),
          bot: "Lendz Outreach",
          run_id: RUN_OUTREACH,
          type: "outreach.replied",
          payload: {
            attempt_id: attemptId,
            lo_key: lo.lo_key,
            ae_key: lo.ae_key,
            channel: "email",
            graph_message_id: `graph-msg-${i + 1}`,
          },
        }),
      );
    }
  });

  events.push(
    event({
      ts: hoursAgo(8),
      bot: "Lendz Outreach",
      run_id: RUN_OUTREACH,
      type: "run.completed",
      payload: {
        stage: "email",
        counts: { sent: outreachTargets.length, replied: 2 },
      },
    }),
  );

  // One failed research run for bot health strip
  events.push(
    event({
      ts: hoursAgo(6),
      bot: "Lendz Research",
      run_id: "run-research-fail",
      type: "run.started",
      payload: { stage: "research", source_site: "flaky-source.demo" },
    }),
    event({
      ts: hoursAgo(5.9),
      bot: "Lendz Research",
      run_id: "run-research-fail",
      type: "run.failed",
      payload: {
        stage: "research",
        source_site: "flaky-source.demo",
        error_message: "Timeout scraping listing page",
      },
    }),
  );

  return events.sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
  );
}
