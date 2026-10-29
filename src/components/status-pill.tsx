const STYLES: Record<string, string> = {
  new: "bg-sky-50 text-sky-800 ring-sky-200",
  matched: "bg-teal-50 text-teal-800 ring-teal-200",
  outreach: "bg-amber-50 text-amber-900 ring-amber-200",
  replied: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  OPEN: "bg-sky-50 text-sky-800 ring-sky-200",
  OUTREACH: "bg-amber-50 text-amber-900 ring-amber-200",
  REPLIED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 ring-slate-200",
  WON: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  LOST: "bg-rose-50 text-rose-800 ring-rose-200",
  queued: "bg-slate-100 text-slate-700 ring-slate-200",
  sent: "bg-sky-50 text-sky-800 ring-sky-200",
  delivered: "bg-teal-50 text-teal-800 ring-teal-200",
  opened: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  bounced: "bg-rose-50 text-rose-800 ring-rose-200",
  running: "bg-amber-50 text-amber-900 ring-amber-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-rose-50 text-rose-800 ring-rose-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusPill({ value }: { value: string }) {
  const style = STYLES[value] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {value}
    </span>
  );
}

export function BotDot({ status }: { status: string }) {
  const color =
    status === "completed"
      ? "bg-emerald-500"
      : status === "failed"
        ? "bg-rose-500"
        : status === "running"
          ? "bg-amber-400"
          : "bg-slate-300";
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${color}`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}
