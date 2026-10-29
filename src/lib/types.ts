export const BOTS = [
  "Lendz Research",
  "Lendz AE Assistant",
  "Lendz Orchestrator",
  "Lendz Matching & Strategy",
  "Lendz Outreach",
] as const;

export type BotName = (typeof BOTS)[number];

export type EventType =
  | "run.started"
  | "run.completed"
  | "run.failed"
  | "lo.discovered"
  | "competitor.targeted"
  | "edge.computed"
  | "ae.upserted"
  | "match.created"
  | "outreach.queued"
  | "outreach.sent"
  | "outreach.delivered"
  | "outreach.bounced"
  | "outreach.opened"
  | "outreach.replied";

export interface IngestEnvelope {
  event_id: string;
  ts: string;
  bot: BotName | string;
  run_id: string;
  type: EventType | string;
  payload: Record<string, unknown>;
}

export interface SourceSite {
  id: string;
  name: string;
  url?: string;
  status: string;
  lastSuccessAt?: string;
}

export interface BotRun {
  id: string;
  botName: string;
  runId: string;
  stage?: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed";
  error?: string;
  countsJson?: Record<string, number>;
}

export interface LoanOriginator {
  id: string;
  externalKey: string;
  name: string;
  company: string;
  sourceSite?: string;
  competitorKey?: string;
  volumeFunded?: number;
  matchedAeKey?: string;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export interface CompetitorTarget {
  id: string;
  competitorKey: string;
  name: string;
  source: "pricing_engine";
  scenarioRef?: string;
  edgeSummary?: string;
  engineRunId?: string;
  activeFrom: string;
  activeTo?: string;
}

export interface CompetitorFunding {
  id: string;
  loKey: string;
  competitorKey: string;
  amount?: number;
  volumeSignal?: number;
  observedAt: string;
}

export interface PricingEdge {
  id: string;
  loKey: string;
  competitorKey: string;
  edgeBpsOrLabel: string;
  volumeFunded?: number;
  computedAt: string;
  engineRunId?: string;
  scenarioRef?: string;
}

export interface AccountExecutive {
  id: string;
  aeKey: string;
  name: string;
  email: string;
  interests: string[];
  active: boolean;
  orchestratorRef?: string;
  syncSource: "orchestrator" | "manual" | "hub_db";
}

export interface MatchRecord {
  id: string;
  loKey: string;
  aeKey: string;
  score: number;
  reasons: string[];
  status: "OPEN" | "OUTREACH" | "REPLIED" | "CLOSED" | "DISMISSED";
  createdAt: string;
}

export interface OutreachAttempt {
  id: string;
  attemptId: string;
  loKey: string;
  aeKey: string;
  matchId?: string;
  channel: "email";
  status: "queued" | "sent" | "delivered" | "bounced" | "opened" | "replied";
  providerMsgId?: string;
  queuedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  repliedAt?: string;
  bouncedAt?: string;
  updatedAt: string;
}

export interface OutreachEvent {
  id: string;
  attemptId: string;
  type: string;
  at: string;
  meta?: Record<string, unknown>;
}

export interface Opportunity {
  id: string;
  loKey: string;
  competitorKey: string;
  matchId?: string;
  stage: "OPEN" | "OUTREACH" | "REPLIED" | "WON" | "LOST";
  valueEstimate?: number;
  edgeLabel?: string;
  openedAt: string;
  closedAt?: string;
}

export interface DailyRollup {
  day: string;
  metrics: Record<string, number>;
}

export interface HubStore {
  events: IngestEnvelope[];
  sourceSites: SourceSite[];
  botRuns: BotRun[];
  loanOriginators: LoanOriginator[];
  competitorTargets: CompetitorTarget[];
  competitorFundings: CompetitorFunding[];
  pricingEdges: PricingEdge[];
  accountExecutives: AccountExecutive[];
  matches: MatchRecord[];
  outreachAttempts: OutreachAttempt[];
  outreachEvents: OutreachEvent[];
  opportunities: Opportunity[];
  dailyRollups: DailyRollup[];
}

export function emptyStore(): HubStore {
  return {
    events: [],
    sourceSites: [],
    botRuns: [],
    loanOriginators: [],
    competitorTargets: [],
    competitorFundings: [],
    pricingEdges: [],
    accountExecutives: [],
    matches: [],
    outreachAttempts: [],
    outreachEvents: [],
    opportunities: [],
    dailyRollups: [],
  };
}
