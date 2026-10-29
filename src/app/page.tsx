import { FunnelChart } from "@/components/funnel-chart";
import { KpiGrid } from "@/components/kpi-grid";
import { Panel } from "@/components/panel";
import { Shell } from "@/components/shell";
import { BotDot, StatusPill } from "@/components/status-pill";
import { WorkloadChart } from "@/components/workload-chart";
import { DataTable } from "@/components/data-table";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatCurrency, formatDate, formatPct } from "@/lib/format";
import { overviewMetrics } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  ensureDemoData();
  const data = overviewMetrics(30);

  return (
    <Shell
      title="Overview"
      subtitle="Yesterday-shaped leadership view of discoveries, match coverage, email funnel, open opportunities, and AE workload skew."
    >
      <div className="space-y-6">
        <Panel
          title="Bot health"
          subtitle="Thin strip for the five Lendz bots — ops secondary."
        >
          <div className="flex flex-wrap gap-4">
            {data.botHealth.map((bot) => (
              <div
                key={bot.bot}
                className="flex min-w-[160px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[rgba(248,250,252,0.8)] px-3 py-2.5"
              >
                <BotDot status={bot.status} />
                <div>
                  <div className="text-sm font-medium text-[var(--ink)]">
                    {bot.bot.replace("Lendz ", "")}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {bot.status}
                    {bot.lastAt ? ` · ${formatDate(bot.lastAt)}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <KpiGrid
          items={[
            {
              label: "LO discoveries",
              value: String(data.kpis.losDiscovered),
              hint: "Unique LOs in window",
            },
            {
              label: "Match coverage",
              value: formatPct(data.kpis.matchCoveragePct),
              hint: "Discovered LOs with ≥1 AE",
            },
            {
              label: "Emails sent",
              value: String(data.kpis.emailsSent),
              hint: "Graph-backed send events",
            },
            {
              label: "Emails replied",
              value: String(data.kpis.emailsReplied),
              hint: "Reply stage conversions",
            },
            {
              label: "Open opportunities",
              value: String(data.kpis.openOpportunities),
              hint: "Engine-driven edges open",
            },
            {
              label: "AE workload skew",
              value: `${data.kpis.aeSkewRatio}×`,
              hint: "Top/bottom load ratio",
            },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel
            title="Email funnel"
            subtitle="Discovered → matched → emailed → opened → replied"
          >
            <FunnelChart
              data={[
                { stage: "Discovered", count: data.funnel.discovered },
                { stage: "Matched", count: data.funnel.matched },
                { stage: "Emailed", count: data.funnel.emailed },
                { stage: "Opened", count: data.funnel.opened },
                { stage: "Replied", count: data.funnel.replied },
              ]}
            />
          </Panel>

          <Panel
            title="AE workload"
            subtitle="Open matches and pending outreach by AE"
          >
            <WorkloadChart data={data.aeWorkload} />
          </Panel>
        </div>

        <Panel
          title="Top engine opportunities"
          subtitle="Pricing-engine target competitors with LO volume — not a static catalog"
        >
          <DataTable
            columns={[
              { key: "lo", label: "LO" },
              { key: "competitor", label: "Target competitor" },
              { key: "edge", label: "Edge" },
              { key: "volume", label: "Volume", align: "right" },
              { key: "aging", label: "Aging", align: "right" },
              { key: "stage", label: "Stage" },
            ]}
            rows={data.topOpportunities.map((o) => ({
              lo: (
                <div>
                  <div className="font-medium">{o.loName}</div>
                  <div className="text-xs text-[var(--muted)]">{o.company}</div>
                </div>
              ),
              competitor: o.competitorName,
              edge: o.edgeLabel ?? "—",
              volume: formatCurrency(o.valueEstimate),
              aging: `${o.agingDays}d`,
              stage: <StatusPill value={o.stage} />,
            }))}
          />
        </Panel>
      </div>
    </Shell>
  );
}
