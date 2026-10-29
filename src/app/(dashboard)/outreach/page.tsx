import { DataTable } from "@/components/data-table";
import { FunnelChart } from "@/components/funnel-chart";
import { Panel } from "@/components/panel";
import { Shell } from "@/components/shell";
import { StatusPill } from "@/components/status-pill";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatDate, formatPct } from "@/lib/format";
import { listOutreach } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function OutreachPage() {
  ensureDemoData();
  const { attempts, funnel, byAe } = listOutreach();

  return (
    <Shell
      title="Outreach"
      subtitle="Email funnel and attempt log. Graph-backed sent / open / reply when available."
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Email funnel" subtitle="Queued → replied">
            <FunnelChart data={funnel} />
          </Panel>
          <Panel title="Reply rate by AE" subtitle="Leadership conversion lens">
            <DataTable
              columns={[
                { key: "ae", label: "AE" },
                { key: "sent", label: "Sent", align: "right" },
                { key: "replied", label: "Replied", align: "right" },
                { key: "rate", label: "Reply rate", align: "right" },
              ]}
              rows={byAe.map((ae) => ({
                ae: ae.name,
                sent: String(ae.sent),
                replied: String(ae.replied),
                rate: formatPct(ae.replyRate),
              }))}
            />
          </Panel>
        </div>

        <Panel title="Attempt log" subtitle={`${attempts.length} outreach attempts`}>
          <DataTable
            columns={[
              { key: "lo", label: "LO" },
              { key: "ae", label: "AE" },
              { key: "status", label: "Status" },
              { key: "graph", label: "Graph message" },
              { key: "updated", label: "Updated" },
            ]}
            rows={attempts.map((a) => ({
              lo: (
                <div>
                  <div className="font-medium">{a.loName}</div>
                  <div className="text-xs text-[var(--muted)]">{a.company}</div>
                </div>
              ),
              ae: a.aeName,
              status: <StatusPill value={a.status} />,
              graph: (
                <span className="font-mono text-xs text-[var(--muted)]">
                  {a.providerMsgId ?? "—"}
                </span>
              ),
              updated: formatDate(a.updatedAt),
            }))}
          />
        </Panel>
      </div>
    </Shell>
  );
}
