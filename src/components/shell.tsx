import Link from "next/link";
import { NavLinks } from "./nav-links";

export function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-[var(--ink)]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(15,118,110,0.14),_transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(30,58,138,0.12),_transparent_40%),linear-gradient(180deg,#f4f7fb_0%,#eef3f8_55%,#e8eef5_100%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="border-b border-[var(--line)] bg-[rgba(255,255,255,0.72)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand)] text-sm font-semibold tracking-tight text-white shadow-[0_8px_24px_rgba(15,118,110,0.28)] transition-transform duration-300 group-hover:scale-[1.03]">
              Lz
            </span>
            <div>
              <div className="font-[family-name:var(--font-display)] text-lg leading-none tracking-tight text-[var(--ink)]">
                Lendz
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                Executive Sales Outreach
              </div>
            </div>
          </Link>
          <div className="hidden text-right text-xs text-[var(--muted)] sm:block">
            Leadership analytics hub
            <div className="mt-0.5 text-[var(--ink-soft)]">Team Grok · MVP</div>
          </div>
        </div>
        <NavLinks />
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 animate-[fadeRise_500ms_ease-out]">
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="animate-[fadeRise_700ms_ease-out]">{children}</div>
      </main>
    </div>
  );
}
