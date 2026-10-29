import { randomUUID } from "crypto";
import { loadStore, saveStore } from "./store";
import type {
  AccountExecutive,
  BotRun,
  CompetitorTarget,
  HubStore,
  IngestEnvelope,
  LoanOriginator,
  MatchRecord,
  Opportunity,
  OutreachAttempt,
} from "./types";

function upsertBy<T>(
  items: T[],
  key: (item: T) => string,
  value: T,
): T[] {
  const k = key(value);
  const idx = items.findIndex((item) => key(item) === k);
  if (idx >= 0) {
    const next = [...items];
    next[idx] = { ...items[idx], ...value };
    return next;
  }
  return [...items, value];
}

function findLo(store: HubStore, loKey: string): LoanOriginator | undefined {
  return store.loanOriginators.find((lo) => lo.externalKey === loKey);
}

function findAe(store: HubStore, aeKey: string): AccountExecutive | undefined {
  return store.accountExecutives.find((ae) => ae.aeKey === aeKey);
}

function findCompetitor(
  store: HubStore,
  competitorKey: string,
): CompetitorTarget | undefined {
  return store.competitorTargets.find((c) => c.competitorKey === competitorKey);
}

function applyRunEvent(store: HubStore, event: IngestEnvelope): HubStore {
  const existing = store.botRuns.find((r) => r.runId === event.run_id);
  const stage =
    typeof event.payload.stage === "string" ? event.payload.stage : undefined;
  const error =
    typeof event.payload.error_message === "string"
      ? event.payload.error_message
      : typeof event.payload.error === "string"
        ? event.payload.error
        : undefined;

  if (event.type === "run.started") {
    const run: BotRun = {
      id: existing?.id ?? randomUUID(),
      botName: event.bot,
      runId: event.run_id,
      stage,
      startedAt: event.ts,
      status: "running",
      countsJson:
        typeof event.payload.counts === "object" && event.payload.counts
          ? (event.payload.counts as Record<string, number>)
          : undefined,
    };
    return {
      ...store,
      botRuns: upsertBy(store.botRuns, (r) => r.runId, run),
    };
  }

  const status = event.type === "run.failed" ? "failed" : "completed";
  const run: BotRun = {
    id: existing?.id ?? randomUUID(),
    botName: event.bot,
    runId: event.run_id,
    stage: stage ?? existing?.stage,
    startedAt: existing?.startedAt ?? event.ts,
    finishedAt: event.ts,
    status,
    error,
    countsJson:
      typeof event.payload.counts === "object" && event.payload.counts
        ? (event.payload.counts as Record<string, number>)
        : existing?.countsJson,
  };

  let sourceSites = store.sourceSites;
  const sourceSite =
    typeof event.payload.source_site === "string"
      ? event.payload.source_site
      : undefined;
  if (sourceSite && status === "completed") {
    sourceSites = upsertBy(
      store.sourceSites,
      (s) => s.name,
      {
        id:
          store.sourceSites.find((s) => s.name === sourceSite)?.id ??
          randomUUID(),
        name: sourceSite,
        status: "active",
        lastSuccessAt: event.ts,
      },
    );
  }

  return {
    ...store,
    botRuns: upsertBy(store.botRuns, (r) => r.runId, run),
    sourceSites,
  };
}

function applyLoDiscovered(store: HubStore, event: IngestEnvelope): HubStore {
  const p = event.payload;
  const loKey = String(p.lo_key ?? "");
  if (!loKey) return store;

  const existing = findLo(store, loKey);
  const lo: LoanOriginator = {
    id: existing?.id ?? randomUUID(),
    externalKey: loKey,
    name: String(p.name ?? existing?.name ?? loKey),
    company: String(p.company ?? existing?.company ?? "Unknown"),
    sourceSite:
      typeof p.source_site === "string" ? p.source_site : existing?.sourceSite,
    competitorKey:
      typeof p.competitor_key === "string"
        ? p.competitor_key
        : existing?.competitorKey,
    volumeFunded:
      typeof p.volume_funded === "number"
        ? p.volume_funded
        : existing?.volumeFunded,
    matchedAeKey: existing?.matchedAeKey,
    status: existing?.status ?? "new",
    firstSeenAt: existing?.firstSeenAt ?? event.ts,
    lastSeenAt: event.ts,
  };

  let next = {
    ...store,
    loanOriginators: upsertBy(
      store.loanOriginators,
      (x) => x.externalKey,
      lo,
    ),
  };

  if (lo.competitorKey && typeof p.volume_funded === "number") {
    next = {
      ...next,
      competitorFundings: upsertBy(
        next.competitorFundings,
        (f) => `${f.loKey}:${f.competitorKey}`,
        {
          id:
            next.competitorFundings.find(
              (f) =>
                f.loKey === lo.externalKey &&
                f.competitorKey === lo.competitorKey,
            )?.id ?? randomUUID(),
          loKey: lo.externalKey,
          competitorKey: lo.competitorKey,
          volumeSignal: p.volume_funded,
          amount: p.volume_funded,
          observedAt: event.ts,
        },
      ),
    };
  }

  return next;
}

function applyCompetitorTargeted(
  store: HubStore,
  event: IngestEnvelope,
): HubStore {
  const p = event.payload;
  const competitorKey = String(p.competitor_key ?? "");
  if (!competitorKey) return store;

  const existing = findCompetitor(store, competitorKey);
  const target: CompetitorTarget = {
    id: existing?.id ?? randomUUID(),
    competitorKey,
    name: String(p.name ?? existing?.name ?? competitorKey),
    source: "pricing_engine",
    scenarioRef:
      typeof p.scenario_ref === "string" ? p.scenario_ref : existing?.scenarioRef,
    edgeSummary:
      typeof p.edge_summary === "string"
        ? p.edge_summary
        : existing?.edgeSummary,
    engineRunId:
      typeof p.engine_run_id === "string"
        ? p.engine_run_id
        : existing?.engineRunId,
    activeFrom: existing?.activeFrom ?? event.ts,
    activeTo: existing?.activeTo,
  };

  return {
    ...store,
    competitorTargets: upsertBy(
      store.competitorTargets,
      (c) => c.competitorKey,
      target,
    ),
  };
}

function applyEdgeComputed(store: HubStore, event: IngestEnvelope): HubStore {
  const p = event.payload;
  const loKey = String(p.lo_key ?? "");
  const competitorKey = String(p.competitor_key ?? "");
  if (!loKey || !competitorKey) return store;

  const edgeLabel = String(p.edge_bps_or_label ?? p.edge_summary ?? "edge");
  const volumeFunded =
    typeof p.volume_funded === "number" ? p.volume_funded : undefined;

  let next: HubStore = {
    ...store,
    pricingEdges: [
      ...store.pricingEdges,
      {
        id: randomUUID(),
        loKey,
        competitorKey,
        edgeBpsOrLabel: edgeLabel,
        volumeFunded,
        computedAt: event.ts,
        engineRunId:
          typeof p.engine_run_id === "string" ? p.engine_run_id : undefined,
        scenarioRef:
          typeof p.scenario_ref === "string" ? p.scenario_ref : undefined,
      },
    ],
  };

  const lo = findLo(next, loKey);
  if (lo) {
    next = {
      ...next,
      loanOriginators: upsertBy(next.loanOriginators, (x) => x.externalKey, {
        ...lo,
        competitorKey,
        volumeFunded: volumeFunded ?? lo.volumeFunded,
        lastSeenAt: event.ts,
      }),
    };
  }

  const existingOpp = next.opportunities.find(
    (o) => o.loKey === loKey && o.competitorKey === competitorKey,
  );
  const opportunity: Opportunity = {
    id: existingOpp?.id ?? randomUUID(),
    loKey,
    competitorKey,
    matchId: existingOpp?.matchId,
    stage: existingOpp?.stage ?? "OPEN",
    valueEstimate: volumeFunded ?? existingOpp?.valueEstimate,
    edgeLabel,
    openedAt: existingOpp?.openedAt ?? event.ts,
    closedAt: existingOpp?.closedAt,
  };

  return {
    ...next,
    opportunities: upsertBy(
      next.opportunities,
      (o) => `${o.loKey}:${o.competitorKey}`,
      opportunity,
    ),
  };
}

function applyAeUpserted(store: HubStore, event: IngestEnvelope): HubStore {
  const p = event.payload;
  const aeKey = String(p.ae_key ?? "");
  if (!aeKey) return store;

  const existing = findAe(store, aeKey);
  const interests = Array.isArray(p.interests)
    ? p.interests.map(String)
    : existing?.interests ?? [];

  const ae: AccountExecutive = {
    id: existing?.id ?? randomUUID(),
    aeKey,
    name: String(p.name ?? existing?.name ?? aeKey),
    email: String(p.email ?? existing?.email ?? `${aeKey}@lendz.example`),
    interests,
    active: typeof p.active === "boolean" ? p.active : existing?.active ?? true,
    orchestratorRef:
      typeof p.orchestrator_ref === "string"
        ? p.orchestrator_ref
        : existing?.orchestratorRef,
    syncSource: existing?.syncSource ?? "orchestrator",
  };

  return {
    ...store,
    accountExecutives: upsertBy(
      store.accountExecutives,
      (a) => a.aeKey,
      ae,
    ),
  };
}

function applyMatchCreated(store: HubStore, event: IngestEnvelope): HubStore {
  const p = event.payload;
  const loKey = String(p.lo_key ?? "");
  const aeKey = String(p.ae_key ?? "");
  if (!loKey || !aeKey) return store;

  const existing = store.matches.find(
    (m) => m.loKey === loKey && m.aeKey === aeKey,
  );
  const match: MatchRecord = {
    id: existing?.id ?? randomUUID(),
    loKey,
    aeKey,
    score: typeof p.score === "number" ? p.score : existing?.score ?? 0,
    reasons: Array.isArray(p.reasons) ? p.reasons.map(String) : existing?.reasons ?? [],
    status: existing?.status ?? "OPEN",
    createdAt: existing?.createdAt ?? event.ts,
  };

  let next: HubStore = {
    ...store,
    matches: upsertBy(store.matches, (m) => `${m.loKey}:${m.aeKey}`, match),
  };

  const lo = findLo(next, loKey);
  if (lo) {
    next = {
      ...next,
      loanOriginators: upsertBy(next.loanOriginators, (x) => x.externalKey, {
        ...lo,
        matchedAeKey: aeKey,
        status: lo.status === "new" ? "matched" : lo.status,
        lastSeenAt: event.ts,
      }),
    };
  }

  const opp = next.opportunities.find((o) => o.loKey === loKey && !o.matchId);
  if (opp) {
    next = {
      ...next,
      opportunities: upsertBy(
        next.opportunities,
        (o) => `${o.loKey}:${o.competitorKey}`,
        { ...opp, matchId: match.id },
      ),
    };
  }

  return next;
}

function applyOutreach(store: HubStore, event: IngestEnvelope): HubStore {
  const p = event.payload;
  const attemptId = String(p.attempt_id ?? "");
  const loKey = String(p.lo_key ?? "");
  const aeKey = String(p.ae_key ?? "");
  if (!attemptId || !loKey || !aeKey) return store;

  const status = event.type.replace("outreach.", "") as OutreachAttempt["status"];
  const existing = store.outreachAttempts.find((a) => a.attemptId === attemptId);
  const match = store.matches.find((m) => m.loKey === loKey && m.aeKey === aeKey);

  const attempt: OutreachAttempt = {
    id: existing?.id ?? randomUUID(),
    attemptId,
    loKey,
    aeKey,
    matchId: existing?.matchId ?? match?.id,
    channel: "email",
    status,
    providerMsgId:
      typeof p.graph_message_id === "string"
        ? p.graph_message_id
        : existing?.providerMsgId,
    queuedAt: status === "queued" ? event.ts : existing?.queuedAt,
    sentAt: status === "sent" ? event.ts : existing?.sentAt,
    deliveredAt: status === "delivered" ? event.ts : existing?.deliveredAt,
    openedAt: status === "opened" ? event.ts : existing?.openedAt,
    repliedAt: status === "replied" ? event.ts : existing?.repliedAt,
    bouncedAt: status === "bounced" ? event.ts : existing?.bouncedAt,
    updatedAt: event.ts,
  };

  // Preserve earlier timestamps if later events arrive
  if (existing) {
    attempt.queuedAt = existing.queuedAt ?? attempt.queuedAt;
    attempt.sentAt = existing.sentAt ?? attempt.sentAt;
    attempt.deliveredAt = existing.deliveredAt ?? attempt.deliveredAt;
    attempt.openedAt = existing.openedAt ?? attempt.openedAt;
    attempt.repliedAt = existing.repliedAt ?? attempt.repliedAt;
    attempt.bouncedAt = existing.bouncedAt ?? attempt.bouncedAt;
    if (status === "queued") attempt.queuedAt = event.ts;
    if (status === "sent") attempt.sentAt = event.ts;
    if (status === "delivered") attempt.deliveredAt = event.ts;
    if (status === "opened") attempt.openedAt = event.ts;
    if (status === "replied") attempt.repliedAt = event.ts;
    if (status === "bounced") attempt.bouncedAt = event.ts;
  }

  let next: HubStore = {
    ...store,
    outreachAttempts: upsertBy(
      store.outreachAttempts,
      (a) => a.attemptId,
      attempt,
    ),
    outreachEvents: [
      ...store.outreachEvents,
      {
        id: randomUUID(),
        attemptId,
        type: status,
        at: event.ts,
        meta: {
          graph_message_id: p.graph_message_id,
          channel: "email",
        },
      },
    ],
  };

  if (match) {
    const matchStatus =
      status === "replied"
        ? "REPLIED"
        : status === "queued" || status === "sent"
          ? "OUTREACH"
          : match.status;
    next = {
      ...next,
      matches: upsertBy(next.matches, (m) => `${m.loKey}:${m.aeKey}`, {
        ...match,
        status: matchStatus,
      }),
    };
  }

  const lo = findLo(next, loKey);
  if (lo) {
    next = {
      ...next,
      loanOriginators: upsertBy(next.loanOriginators, (x) => x.externalKey, {
        ...lo,
        status:
          status === "replied"
            ? "replied"
            : status === "sent" || status === "queued"
              ? "outreach"
              : lo.status,
        lastSeenAt: event.ts,
      }),
    };
  }

  const opp = next.opportunities.find((o) => o.loKey === loKey);
  if (opp) {
    next = {
      ...next,
      opportunities: upsertBy(
        next.opportunities,
        (o) => `${o.loKey}:${o.competitorKey}`,
        {
          ...opp,
          stage:
            status === "replied"
              ? "REPLIED"
              : status === "sent" || status === "queued"
                ? "OUTREACH"
                : opp.stage,
        },
      ),
    };
  }

  return next;
}

export function applyEvent(store: HubStore, event: IngestEnvelope): HubStore {
  if (store.events.some((e) => e.event_id === event.event_id)) {
    return store;
  }

  let next: HubStore = {
    ...store,
    events: [...store.events, event],
  };

  switch (event.type) {
    case "run.started":
    case "run.completed":
    case "run.failed":
      next = applyRunEvent(next, event);
      break;
    case "lo.discovered":
      next = applyLoDiscovered(next, event);
      break;
    case "competitor.targeted":
      next = applyCompetitorTargeted(next, event);
      break;
    case "edge.computed":
      next = applyEdgeComputed(next, event);
      break;
    case "ae.upserted":
      next = applyAeUpserted(next, event);
      break;
    case "match.created":
      next = applyMatchCreated(next, event);
      break;
    case "outreach.queued":
    case "outreach.sent":
    case "outreach.delivered":
    case "outreach.bounced":
    case "outreach.opened":
    case "outreach.replied":
      next = applyOutreach(next, event);
      break;
    default:
      break;
  }

  return next;
}

export function ingestEvent(event: IngestEnvelope): {
  accepted: boolean;
  duplicate: boolean;
} {
  const store = loadStore();
  const duplicate = store.events.some((e) => e.event_id === event.event_id);
  if (duplicate) {
    return { accepted: true, duplicate: true };
  }
  const next = applyEvent(store, event);
  saveStore(next);
  return { accepted: true, duplicate: false };
}

export function ingestEvents(events: IngestEnvelope[]): {
  accepted: number;
  duplicates: number;
} {
  let store = loadStore();
  let accepted = 0;
  let duplicates = 0;

  for (const event of events) {
    if (store.events.some((e) => e.event_id === event.event_id)) {
      duplicates += 1;
      continue;
    }
    store = applyEvent(store, event);
    accepted += 1;
  }

  saveStore(store);
  return { accepted, duplicates };
}
