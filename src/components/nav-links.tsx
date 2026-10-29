"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/new-los", label: "New LOs" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/outreach", label: "Outreach" },
  { href: "/matches", label: "Matches" },
  { href: "/aes", label: "AEs" },
  { href: "/bots", label: "Bots" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:px-4 lg:px-6">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative whitespace-nowrap px-3 py-3 text-sm transition-colors ${
                active
                  ? "text-[var(--brand-ink)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {link.label}
              <span
                className={`absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-[var(--brand)] transition-transform duration-300 ${
                  active ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
