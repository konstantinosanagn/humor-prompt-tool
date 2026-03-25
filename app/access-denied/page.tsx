"use client";

import { createClient } from "@/app/lib/supabase/client";

export default function AccessDeniedPage() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6 border-3 border-[var(--accent-red)] p-10 shadow-[4px_4px_0_0_var(--accent-red)]">
        <h1 className="font-head text-3xl text-[var(--foreground)] tracking-tight uppercase">
          Access Denied
        </h1>
        <p className="text-[var(--foreground)]/60 text-sm font-sans max-w-md">
          Only superadmins and matrix admins can access this tool.
        </p>
        <button
          onClick={handleSignOut}
          className="px-6 py-3 bg-[var(--accent-red)] text-white border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
