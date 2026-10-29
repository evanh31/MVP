import { DataTable } from "@/components/data-table";
import { Panel } from "@/components/panel";
import { Shell } from "@/components/shell";
import { BotDot, StatusPill } from "@/components/status-pill";
import { ensureDemoData } from "@/lib/ensure-demo";
import { formatDate, formatPct } from "@/lib/format";
import { listBots } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default function BotsPage() {
  ensureDemoData();
  const { byBot } = listBots();

  return (
    <Shell
      title="Bots"
      subtitle="Secondary ops view — recent runs for Research, AE Assistant, Orchestrator, Matching & Strategy, and Outreach."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {byBot.map((bot) => (
            <div
              key={bot.bot}
              className="rounded-2xl border border-[var(--line)] bg-white/85 p-4"
            >
              <div className="flex items-center gap-2">
                <BotDot status={bot.latest?.status ?? "unknown"} />
                <div className="text-sm font-medium text-[var(--ink)]">
                  {bot.bot}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    Started
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-xl">
                    {bot.started}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    OK
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-xl">
                    {bot.completed}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    Fail
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-xl">
                    {bot.failed}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-[var(--muted)]">
                Error rate {formatPct(bot.errorRate)}
              </div>
            </div>
          ))}
        </div>

        {byBot.map((bot) => (
          <Panel
            key={bot.bot}
            title={bot.bot}
            subtitle="Recent runs"
          >
            <DataTable
              columns={[
                { key: "run", label: "Run" },
                { key: "stage", label: "Stage" },
                { key: "status", label: "Status" },
                { key: "started", label: "Started" },
                { key: "finished", label: "Finished" },
                { key: "error", label: "Error" },
              ]}
              rows={bot.recent.map((r) => ({
                run: (
                  <span className="font-mono text-xs text-[var(--muted)]">
                    {r.runId}
                  </span>
                ),
                stage: r.stage ?? "—",
                status: <StatusPill value={r.status} />,
                started: formatDate(r.startedAt),
                finished: formatDate(r.finishedAt),
                error: r.error ?? "—",
              }))}
              empty="No runs ingested yet."
            />
          </Panel>
        ))}
      </div>
    </Shell>
  );
}
