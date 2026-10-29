import { DataTable } from "@/components/data-table";
import { Panel } from "@/components/panel";
import { ReasonChips } from "@/components/reason-chips";
import { Shell } from "@/components/shell";
import { WorkloadChart } from "@/components/workload-chart";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatPct } from "@/lib/format";
import { listAes } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function AesPage() {
  ensureDemoData();
  const aes = listAes();

  return (
    <Shell
      title="AEs"
      subtitle="Leadership coverage view — open matches, pending outreach, and conversion per Account Executive."
    >
      <div className="space-y-6">
        <Panel title="Workload distribution">
          <WorkloadChart
            data={aes.map((ae) => ({
              name: ae.name.split(" ")[0],
              openMatches: ae.openMatches,
              pendingOutreach: ae.pendingOutreach,
            }))}
          />
        </Panel>

        <Panel title="Account executives" subtitle="Synced from Orchestrator memory / seed">
          <DataTable
            columns={[
              { key: "ae", label: "AE" },
              { key: "interests", label: "Interests" },
              { key: "open", label: "Open matches", align: "right" },
              { key: "pending", label: "Pending outreach", align: "right" },
              { key: "assigned", label: "Assigned LOs", align: "right" },
              { key: "conversion", label: "Conversion", align: "right" },
            ]}
            rows={aes.map((ae) => ({
              ae: (
                <div>
                  <div className="font-medium">{ae.name}</div>
                  <div className="text-xs text-[var(--muted)]">{ae.email}</div>
                </div>
              ),
              interests: <ReasonChips reasons={ae.interests} />,
              open: String(ae.openMatches),
              pending: String(ae.pendingOutreach),
              assigned: String(ae.assignedLos),
              conversion: (
                <div>
                  <div>{formatPct(ae.conversionPct)}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {ae.replied}/{ae.sent} replied
                  </div>
                </div>
              ),
            }))}
          />
        </Panel>
      </div>
    </Shell>
  );
}
