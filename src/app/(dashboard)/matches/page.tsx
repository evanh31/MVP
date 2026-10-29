import { MatchTabs } from "@/components/match-tabs";
import { Panel } from "@/components/panel";
import { Shell } from "@/components/shell";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatCurrency, formatScore, formatShortDate } from "@/lib/format";
import { listMatches } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function MatchesPage() {
  ensureDemoData();
  const { matched, unmatched } = listMatches();

  return (
    <Shell
      title="Matches"
      subtitle="LO↔AE pairs with score and reason chips, plus an unmatched queue."
    >
      <Panel title="Match board">
        <MatchTabs
          matched={matched.map((m) => ({
            id: m.id,
            loName: m.loName,
            company: m.company,
            aeName: m.aeName,
            scoreLabel: formatScore(m.score),
            reasons: m.reasons,
            status: m.status,
            createdLabel: formatShortDate(m.createdAt),
          }))}
          unmatched={unmatched.map((lo) => ({
            externalKey: lo.externalKey,
            name: lo.name,
            company: lo.company,
            competitorName: lo.competitorName,
            volumeLabel: formatCurrency(lo.volumeFunded),
            firstSeenLabel: formatShortDate(lo.firstSeenAt),
          }))}
        />
      </Panel>
    </Shell>
  );
}
