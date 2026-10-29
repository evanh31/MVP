import { DataTable } from "@/components/data-table";
import { Panel } from "@/components/panel";
import { Shell } from "@/components/shell";
import { StatusPill } from "@/components/status-pill";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatCurrency } from "@/lib/format";
import { listOpportunities } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function OpportunitiesPage() {
  ensureDemoData();
  const { byCompetitor, rows } = listOpportunities();

  return (
    <Shell
      title="Opportunities"
      subtitle="Engine-driven target competitors with LO counts, volume, pricing edge, and aging — no static competitor admin."
    >
      <div className="space-y-6">
        <Panel
          title="Target competitors"
          subtitle="Emitted by the pricing engine via bot events"
        >
          <DataTable
            columns={[
              { key: "name", label: "Competitor" },
              { key: "edge", label: "Edge" },
              { key: "los", label: "LO count", align: "right" },
              { key: "volume", label: "Volume", align: "right" },
              { key: "aging", label: "Avg aging", align: "right" },
            ]}
            rows={byCompetitor.map((c) => ({
              name: (
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {c.scenarioRef ?? c.competitorKey}
                  </div>
                </div>
              ),
              edge: c.edgeSummary ?? "—",
              los: String(c.loCount),
              volume: formatCurrency(c.volume),
              aging: `${c.avgAgingDays}d`,
            }))}
          />
        </Panel>

        <Panel title="Opportunity aging" subtitle="Oldest open edges first">
          <DataTable
            columns={[
              { key: "lo", label: "LO" },
              { key: "competitor", label: "Target competitor" },
              { key: "edge", label: "Edge" },
              { key: "volume", label: "Volume", align: "right" },
              { key: "aging", label: "Aging", align: "right" },
              { key: "stage", label: "Stage" },
            ]}
            rows={rows.map((o) => ({
              lo: (
                <div>
                  <div className="font-medium">{o.loName}</div>
                  <div className="text-xs text-[var(--muted)]">{o.company}</div>
                </div>
              ),
              competitor: o.competitorName,
              edge: o.edgeSummary ?? "—",
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
