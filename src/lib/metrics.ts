import { differenceInCalendarDays, parseISO, subDays } from "date-fns";
import { loadStore, saveStore } from "./store";
import { BOTS } from "./types";

export type DateWindow = 7 | 30 | 90;

function inWindow(iso: string, days: DateWindow, now = new Date()): boolean {
  const t = parseISO(iso).getTime();
  return t >= subDays(now, days).getTime() && t <= now.getTime();
}

export function overviewMetrics(days: DateWindow = 30) {
  const store = loadStore();
  const now = new Date();

  const discoveries = store.loanOriginators.filter((lo) =>
    inWindow(lo.firstSeenAt, days, now),
  );
  const matches = store.matches.filter((m) => inWindow(m.createdAt, days, now));
  const matchedLoKeys = new Set(matches.map((m) => m.loKey));
  const matchCoverage =
    discoveries.length === 0
      ? 0
      : Math.round(
          (discoveries.filter((lo) => matchedLoKeys.has(lo.externalKey)).length /
            discoveries.length) *
            100,
        );

  const attempts = store.outreachAttempts.filter((a) =>
    inWindow(a.updatedAt, days, now),
  );
  const sent = attempts.filter((a) => a.sentAt).length;
  const opened = attempts.filter((a) => a.openedAt).length;
  const replied = attempts.filter((a) => a.repliedAt).length;
  const openOpps = store.opportunities.filter(
    (o) => o.stage === "OPEN" || o.stage === "OUTREACH",
  );

  const aeWorkload = store.accountExecutives
    .filter((ae) => ae.active)
    .map((ae) => {
      const openMatches = store.matches.filter(
        (m) => m.aeKey === ae.aeKey && (m.status === "OPEN" || m.status === "OUTREACH"),
      ).length;
      const pendingOutreach = store.outreachAttempts.filter(
        (a) =>
          a.aeKey === ae.aeKey &&
          ["queued", "sent", "delivered", "opened"].includes(a.status),
      ).length;
      return {
        aeKey: ae.aeKey,
        name: ae.name,
        openMatches,
        pendingOutreach,
        load: openMatches + pendingOutreach,
      };
    })
    .sort((a, b) => b.load - a.load);

  const loads = aeWorkload.map((a) => a.load);
  const maxLoad = Math.max(...loads, 0);
  const minLoad = Math.min(...loads, 0);
  const skewRatio = minLoad === 0 ? maxLoad : Number((maxLoad / minLoad).toFixed(2));

  const botHealth = BOTS.map((bot) => {
    const runs = store.botRuns
      .filter((r) => r.botName === bot)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
    const latest = runs[0];
    return {
      bot,
      status: latest?.status ?? "unknown",
      lastAt: latest?.finishedAt ?? latest?.startedAt,
      error: latest?.error,
    };
  });

  const topOpportunities = store.opportunities
    .map((o) => {
      const lo = store.loanOriginators.find((l) => l.externalKey === o.loKey);
      const competitor = store.competitorTargets.find(
        (c) => c.competitorKey === o.competitorKey,
      );
      return {
        ...o,
        loName: lo?.name ?? o.loKey,
        company: lo?.company ?? "—",
        competitorName: competitor?.name ?? o.competitorKey,
        agingDays: differenceInCalendarDays(now, parseISO(o.openedAt)),
      };
    })
    .sort((a, b) => (b.valueEstimate ?? 0) - (a.valueEstimate ?? 0))
    .slice(0, 5);

  const funnel = {
    discovered: discoveries.length,
    matched: matches.length,
    emailed: sent,
    opened,
    replied,
  };

  return {
    kpis: {
      losDiscovered: discoveries.length,
      matchCoveragePct: matchCoverage,
      emailsSent: sent,
      emailsReplied: replied,
      openOpportunities: openOpps.length,
      aeSkewRatio: skewRatio,
    },
    funnel,
    topOpportunities,
    aeWorkload,
    botHealth,
  };
}

export function listNewLos() {
  const store = loadStore();
  return store.loanOriginators
    .map((lo) => {
      const competitor = store.competitorTargets.find(
        (c) => c.competitorKey === lo.competitorKey,
      );
      const ae = store.accountExecutives.find((a) => a.aeKey === lo.matchedAeKey);
      const match = store.matches.find((m) => m.loKey === lo.externalKey);
      return {
        ...lo,
        competitorName: competitor?.name ?? lo.competitorKey ?? "—",
        matchedAeName: ae?.name ?? "Unmatched",
        matchScore: match?.score,
        reasons: match?.reasons ?? [],
      };
    })
    .sort(
      (a, b) =>
        new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime(),
    );
}

export function listOpportunities() {
  const store = loadStore();
  const now = new Date();

  const byCompetitor = store.competitorTargets.map((c) => {
    const opps = store.opportunities.filter(
      (o) => o.competitorKey === c.competitorKey,
    );
    const volume = opps.reduce((sum, o) => sum + (o.valueEstimate ?? 0), 0);
    const aging = opps.map((o) =>
      differenceInCalendarDays(now, parseISO(o.openedAt)),
    );
    return {
      competitorKey: c.competitorKey,
      name: c.name,
      edgeSummary: c.edgeSummary,
      scenarioRef: c.scenarioRef,
      loCount: opps.length,
      volume,
      avgAgingDays:
        aging.length === 0
          ? 0
          : Math.round(aging.reduce((a, b) => a + b, 0) / aging.length),
      maxAgingDays: aging.length === 0 ? 0 : Math.max(...aging),
    };
  });

  const rows = store.opportunities
    .map((o) => {
      const lo = store.loanOriginators.find((l) => l.externalKey === o.loKey);
      const competitor = store.competitorTargets.find(
        (c) => c.competitorKey === o.competitorKey,
      );
      return {
        ...o,
        loName: lo?.name ?? o.loKey,
        company: lo?.company ?? "—",
        competitorName: competitor?.name ?? o.competitorKey,
        edgeSummary: competitor?.edgeSummary ?? o.edgeLabel,
        agingDays: differenceInCalendarDays(now, parseISO(o.openedAt)),
      };
    })
    .sort((a, b) => b.agingDays - a.agingDays);

  return { byCompetitor, rows };
}

export function listOutreach() {
  const store = loadStore();
  const attempts = store.outreachAttempts
    .map((a) => {
      const lo = store.loanOriginators.find((l) => l.externalKey === a.loKey);
      const ae = store.accountExecutives.find((x) => x.aeKey === a.aeKey);
      return {
        ...a,
        loName: lo?.name ?? a.loKey,
        company: lo?.company ?? "—",
        aeName: ae?.name ?? a.aeKey,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const funnel = [
    { stage: "Queued", count: attempts.filter((a) => a.queuedAt).length },
    { stage: "Sent", count: attempts.filter((a) => a.sentAt).length },
    { stage: "Delivered", count: attempts.filter((a) => a.deliveredAt).length },
    { stage: "Opened", count: attempts.filter((a) => a.openedAt).length },
    { stage: "Replied", count: attempts.filter((a) => a.repliedAt).length },
  ];

  const byAe = store.accountExecutives.map((ae) => {
    const aeAttempts = attempts.filter((a) => a.aeKey === ae.aeKey);
    const sent = aeAttempts.filter((a) => a.sentAt).length;
    const replied = aeAttempts.filter((a) => a.repliedAt).length;
    return {
      aeKey: ae.aeKey,
      name: ae.name,
      sent,
      replied,
      replyRate: sent === 0 ? 0 : Math.round((replied / sent) * 100),
    };
  });

  return { attempts, funnel, byAe };
}

export function listMatches() {
  const store = loadStore();
  const matched = store.matches
    .map((m) => {
      const lo = store.loanOriginators.find((l) => l.externalKey === m.loKey);
      const ae = store.accountExecutives.find((a) => a.aeKey === m.aeKey);
      return {
        ...m,
        loName: lo?.name ?? m.loKey,
        company: lo?.company ?? "—",
        aeName: ae?.name ?? m.aeKey,
      };
    })
    .sort((a, b) => b.score - a.score);

  const matchedKeys = new Set(store.matches.map((m) => m.loKey));
  const unmatched = store.loanOriginators
    .filter((lo) => !matchedKeys.has(lo.externalKey))
    .map((lo) => ({
      ...lo,
      competitorName:
        store.competitorTargets.find((c) => c.competitorKey === lo.competitorKey)
          ?.name ?? lo.competitorKey,
    }));

  return { matched, unmatched };
}

export function listAes() {
  const store = loadStore();
  return store.accountExecutives
    .filter((ae) => ae.active)
    .map((ae) => {
      const matches = store.matches.filter((m) => m.aeKey === ae.aeKey);
      const openMatches = matches.filter(
        (m) => m.status === "OPEN" || m.status === "OUTREACH",
      ).length;
      const attempts = store.outreachAttempts.filter((a) => a.aeKey === ae.aeKey);
      const pending = attempts.filter((a) =>
        ["queued", "sent", "delivered", "opened"].includes(a.status),
      ).length;
      const sent = attempts.filter((a) => a.sentAt).length;
      const replied = attempts.filter((a) => a.repliedAt).length;
      return {
        ...ae,
        openMatches,
        pendingOutreach: pending,
        assignedLos: matches.length,
        conversionPct: sent === 0 ? 0 : Math.round((replied / sent) * 100),
        sent,
        replied,
      };
    })
    .sort((a, b) => b.openMatches + b.pendingOutreach - (a.openMatches + a.pendingOutreach));
}

export function listBots() {
  const store = loadStore();
  const byBot = BOTS.map((bot) => {
    const runs = store.botRuns
      .filter((r) => r.botName === bot)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );
    const started = runs.length;
    const completed = runs.filter((r) => r.status === "completed").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    return {
      bot,
      started,
      completed,
      failed,
      errorRate: started === 0 ? 0 : Math.round((failed / started) * 100),
      latest: runs[0] ?? null,
      recent: runs.slice(0, 8),
    };
  });

  return { byBot, allRuns: store.botRuns };
}

export function materializeDailyRollup(dayIso = new Date().toISOString().slice(0, 10)) {
  const overview = overviewMetrics(30);
  const store = loadStore();
  const rollup = {
    day: dayIso,
    metrics: {
      los_discovered: overview.kpis.losDiscovered,
      match_coverage_pct: overview.kpis.matchCoveragePct,
      emails_sent: overview.kpis.emailsSent,
      emails_replied: overview.kpis.emailsReplied,
      opp_open: overview.kpis.openOpportunities,
      ae_skew_ratio: overview.kpis.aeSkewRatio,
    },
  };
  const others = store.dailyRollups.filter((r) => r.day !== dayIso);
  saveStore({ ...store, dailyRollups: [...others, rollup] });
  return rollup;
}
