export function ReasonChips({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return <span className="text-[var(--muted)]">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.map((reason) => (
        <span
          key={reason}
          className="rounded-md bg-[rgba(15,118,110,0.08)] px-2 py-0.5 text-xs text-[var(--brand-ink)]"
        >
          {reason}
        </span>
      ))}
    </div>
  );
}
