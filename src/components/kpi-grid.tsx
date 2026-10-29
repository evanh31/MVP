export function KpiGrid({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-transform duration-300 hover:-translate-y-0.5"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {item.label}
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
            {item.value}
          </div>
          {item.hint ? (
            <div className="mt-1 text-xs text-[var(--ink-soft)]">{item.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
