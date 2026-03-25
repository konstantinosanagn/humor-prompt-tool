"use client";

import { createClient } from "@/app/lib/supabase/client";

export default function LoginPage() {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6 border-3 border-[var(--border)] p-10 shadow-[var(--shadow-md)]">
        <h1 className="font-head text-3xl text-[var(--foreground)] tracking-tight uppercase">
          Prompt Chain Tool
        </h1>
        <p className="text-[var(--foreground)]/60 text-sm font-sans">
          Sign in with your Google account to continue.
        </p>
        <button
          onClick={handleSignIn}
          className="px-6 py-3 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
