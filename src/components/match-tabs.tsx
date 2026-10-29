"use client";

import { useState } from "react";
import { DataTable } from "./data-table";
import { ReasonChips } from "./reason-chips";
import { StatusPill } from "./status-pill";

type MatchedRow = {
  id: string;
  loName: string;
  company: string;
  aeName: string;
  scoreLabel: string;
  reasons: string[];
  status: string;
  createdLabel: string;
};

type UnmatchedRow = {
  externalKey: string;
  name: string;
  company: string;
  competitorName?: string;
  volumeLabel: string;
  firstSeenLabel: string;
};

export function MatchTabs({
  matched,
  unmatched,
}: {
  matched: MatchedRow[];
  unmatched: UnmatchedRow[];
}) {
  const [tab, setTab] = useState<"matched" | "unmatched">("matched");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(
          [
            ["matched", `Matched (${matched.length})`],
            ["unmatched", `Unmatched (${unmatched.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              tab === key
                ? "bg-[var(--brand)] text-white"
                : "bg-[rgba(15,23,42,0.04)] text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "matched" ? (
        <DataTable
          columns={[
            { key: "lo", label: "LO" },
            { key: "ae", label: "AE" },
            { key: "score", label: "Score", align: "right" },
            { key: "reasons", label: "Reasons" },
            { key: "status", label: "Status" },
            { key: "created", label: "Created" },
          ]}
          rows={matched.map((m) => ({
            lo: (
              <div>
                <div className="font-medium">{m.loName}</div>
                <div className="text-xs text-[var(--muted)]">{m.company}</div>
              </div>
            ),
            ae: m.aeName,
            score: m.scoreLabel,
            reasons: <ReasonChips reasons={m.reasons} />,
            status: <StatusPill value={m.status} />,
            created: m.createdLabel,
          }))}
        />
      ) : (
        <DataTable
          columns={[
            { key: "lo", label: "LO" },
            { key: "company", label: "Company" },
            { key: "competitor", label: "Engine competitor" },
            { key: "volume", label: "Volume", align: "right" },
            { key: "firstSeen", label: "First seen" },
          ]}
          rows={unmatched.map((lo) => ({
            lo: lo.name,
            company: lo.company,
            competitor: lo.competitorName ?? "—",
            volume: lo.volumeLabel,
            firstSeen: lo.firstSeenLabel,
          }))}
          empty="All discovered LOs have an AE match."
        />
      )}
    </div>
  );
}
