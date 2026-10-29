import { DataTable } from "@/components/data-table";
import { Panel } from "@/components/panel";
import { ReasonChips } from "@/components/reason-chips";
import { Shell } from "@/components/shell";
import { StatusPill } from "@/components/status-pill";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatCurrency, formatScore, formatShortDate } from "@/lib/format";
import { listNewLos } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function NewLosPage() {
  ensureDemoData();
  const rows = listNewLos();

  return (
    <Shell
      title="New LOs"
      subtitle="Discovery feed with engine-selected target competitor, volume funded there, matched AE, and status."
    >
      <Panel title="Discoveries" subtitle={`${rows.length} loan originators`}>
        <DataTable
          columns={[
            { key: "lo", label: "LO" },
            { key: "company", label: "Company" },
            { key: "competitor", label: "Engine target competitor" },
            { key: "volume", label: "Volume funded", align: "right" },
            { key: "ae", label: "Matched AE" },
            { key: "status", label: "Status" },
            { key: "firstSeen", label: "First seen" },
          ]}
          rows={rows.map((lo) => ({
            lo: (
              <div>
                <div className="font-medium">{lo.name}</div>
                <div className="text-xs text-[var(--muted)]">{lo.externalKey}</div>
              </div>
            ),
            company: lo.company,
            competitor: lo.competitorName,
            volume: formatCurrency(lo.volumeFunded),
            ae: (
              <div>
                <div>{lo.matchedAeName}</div>
                {lo.matchScore != null ? (
                  <div className="text-xs text-[var(--muted)]">
                    score {formatScore(lo.matchScore)}
                  </div>
                ) : null}
                <div className="mt-1">
                  <ReasonChips reasons={lo.reasons} />
                </div>
              </div>
            ),
            status: <StatusPill value={lo.status} />,
            firstSeen: formatShortDate(lo.firstSeenAt),
          }))}
        />
      </Panel>
    </Shell>
  );
}
