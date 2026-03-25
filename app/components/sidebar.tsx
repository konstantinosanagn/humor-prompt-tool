"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/", label: "Flavors" },
  { href: "/captions", label: "Captions" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[var(--background)] border-r-3 border-[var(--border)] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 h-16 flex items-center gap-3 shrink-0 border-b-3 border-[var(--border)]">
        <div className="w-8 h-8 bg-[var(--primary)] border-2 border-[var(--border)] shadow-[var(--shadow-xs)] flex items-center justify-center">
          <span className="text-[var(--secondary)] text-xs font-bold font-head">P</span>
        </div>
        <span className="text-[var(--foreground)] text-sm font-bold font-head uppercase tracking-tight">
          Prompt Chain
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all border-2 ${
                active
                  ? "bg-[var(--primary)] text-[var(--secondary)] border-[var(--border)] shadow-[var(--shadow-xs)]"
                  : "border-transparent text-[var(--foreground)]/60 hover:border-[var(--border)] hover:bg-[var(--foreground)]/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-3 border-t-3 border-[var(--border)]">
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-[var(--accent-red)] border-2 border-[var(--accent-red)] hover:bg-[var(--accent-red)] hover:text-white transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
