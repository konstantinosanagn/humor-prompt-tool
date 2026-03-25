"use client";

import { useTheme } from "./theme-provider";

const options = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "system" as const, label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex border-2 border-[var(--border)] shadow-[var(--shadow-xs)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer transition-all ${
            theme === opt.value
              ? "bg-[var(--primary)] text-[var(--secondary)]"
              : "bg-[var(--background)] text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
