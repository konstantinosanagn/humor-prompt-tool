# Prompt Chain Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a neobrutalism-styled Next.js 16 app for managing humor flavor prompt pipelines with CRUD, drag-and-drop reorder, REST API testing, and dark mode.

**Architecture:** Next.js 16 App Router with `(app)` protected route group. Supabase for auth (Google OAuth) and data (admin client bypasses RLS). RetroUI components for neobrutalism aesthetic. Server actions for mutations, client-side fetch for REST API caption generation.

**Tech Stack:** Next.js 16.2.1, React 19, Tailwind CSS v4, RetroUI (pixel-retroui via shadcn), Supabase (@supabase/ssr + @supabase/supabase-js), @dnd-kit/core + @dnd-kit/sortable, class-variance-authority

**Spec:** `docs/superpowers/specs/2026-03-25-prompt-chain-tool-design.md`

---

## File Structure

```
app/
├── layout.tsx                         # Root layout: fonts (Archivo Black, Space Grotesk), ThemeProvider, metadata
├── globals.css                        # Tailwind v4 imports + CSS variables (light/dark neobrutalism palette)
├── login/page.tsx                     # Google sign-in (client component)
├── access-denied/page.tsx             # Unauthorized message + sign out
├── auth/callback/route.ts             # OAuth code→session exchange
├── (app)/
│   ├── layout.tsx                     # Sidebar + main content wrapper
│   ├── page.tsx                       # Humor flavors list (server component)
│   ├── actions.ts                     # Server actions: createFlavor, updateFlavor, deleteFlavor, duplicateFlavor
│   ├── flavors-table.tsx              # Client component: table + search + create/edit modal
│   ├── flavor-form.tsx                # Client component: modal form for create/edit flavor
│   ├── flavors/
│   │   └── [id]/
│   │       ├── page.tsx               # Flavor detail + steps (server component)
│   │       ├── actions.ts             # Server actions: createStep, updateStep, deleteStep, reorderSteps, updateFlavor
│   │       ├── flavor-header.tsx       # Client component: inline-edit slug + description
│   │       ├── step-card.tsx           # Client component: single step with expand/collapse
│   │       ├── step-form.tsx           # Client component: modal form for create/edit step
│   │       ├── draggable-step-list.tsx # Client component: @dnd-kit sortable wrapper
│   │       └── test-panel.tsx          # Client component: image set picker, API calls, results
│   └── captions/
│       └── page.tsx                   # Captions viewer (server component)
├── components/
│   ├── sidebar.tsx                    # Nav links, theme toggle, sign out
│   ├── theme-provider.tsx             # Client component: localStorage theme + dark class
│   ├── theme-toggle.tsx               # Light/Dark/System switcher
│   ├── pagination.tsx                 # Page links preserving search params
│   ├── confirm-delete-button.tsx      # Two-click delete pattern
│   └── modal.tsx                      # Neobrutalism modal wrapper
└── lib/
    ├── supabase/
    │   ├── admin.ts                   # Service role client (bypasses RLS)
    │   ├── client.ts                  # Browser client
    │   └── server.ts                  # Server client with cookie handling
    └── types.ts                       # Shared TypeScript interfaces

proxy.ts                               # Auth proxy (Next.js 16 convention, replaces middleware.ts)
```

---

### Task 1: Install Dependencies and Configure Project

**Files:**
- Modify: `package.json`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `.env.local`
- Modify: `next.config.ts`

- [ ] **Step 1: Install Supabase packages**

```bash
npm install @supabase/ssr @supabase/supabase-js
```

- [ ] **Step 2: Install dnd-kit for drag-and-drop**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 3: Initialize shadcn and add RetroUI components**

```bash
npx shadcn@latest init
npx shadcn@latest add https://retroui.dev/r/utils.json
npx shadcn@latest add 'https://retroui.dev/r/button.json'
npx shadcn@latest add 'https://retroui.dev/r/input.json'
npx shadcn@latest add 'https://retroui.dev/r/textarea.json'
npx shadcn@latest add 'https://retroui.dev/r/badge.json'
npx shadcn@latest add 'https://retroui.dev/r/accordion.json'
npx shadcn@latest add 'https://retroui.dev/r/alert.json'
npm install class-variance-authority
```

> **Note:** If `npx shadcn@latest init` asks questions, pick: TypeScript, app/ directory, default alias `@/`. If any RetroUI component URL fails, skip it and we'll build that component manually with neobrutalism styling.

- [ ] **Step 4: Create `.env.local`**

Copy `.env.local` from humor-admin project (same Supabase instance):

```bash
cp /Users/kanagn/Desktop/humor-admin/.env.local .env.local
```

Then verify it contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAILS`.

- [ ] **Step 5: Write `globals.css` with neobrutalism CSS variables**

```css
@import "tailwindcss";

@theme {
  --font-head: var(--font-head);
  --font-sans: var(--font-sans);
  --shadow-xs: 1px 1px 0 0 var(--border);
  --shadow-sm: 2px 2px 0 0 var(--border);
  --shadow-md: 4px 4px 0 0 var(--border);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-border: var(--border);
  --color-accent-red: var(--accent-red);
  --color-accent-green: var(--accent-green);
  --color-accent-blue: var(--accent-blue);
}

:root {
  --radius: 0;
  --background: #ffffff;
  --foreground: #000000;
  --primary: #ffdb33;
  --primary-hover: #ffcc00;
  --secondary: #000000;
  --border: #000000;
  --accent-red: #ff6b6b;
  --accent-green: #51cf66;
  --accent-blue: #339af0;
}

.dark {
  --background: #1a1a1a;
  --foreground: #f5f5f5;
  --primary: #ffdb33;
  --primary-hover: #ffcc00;
  --secondary: #3a3a3a;
  --border: #f5f5f5;
  --accent-red: #ff6b6b;
  --accent-green: #51cf66;
  --accent-blue: #74c0fc;
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

- [ ] **Step 6: Update `app/layout.tsx` with fonts and metadata**

```tsx
import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/theme-provider";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-head",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prompt Chain Tool",
  description: "Manage humor flavors and prompt pipelines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Update `next.config.ts` for image domains**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.almostcrackd.ai" },
      { protocol: "https", hostname: "presigned-url-uploads.almostcrackd.ai" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

Expected: Compiles successfully (ThemeProvider doesn't exist yet — create a stub first or add it in the next task).

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: install deps, configure env, fonts, CSS variables, image domains"
```

---

### Task 2: Supabase Clients + Types

**Files:**
- Create: `app/lib/supabase/admin.ts`
- Create: `app/lib/supabase/client.ts`
- Create: `app/lib/supabase/server.ts`
- Create: `app/lib/types.ts`

- [ ] **Step 1: Create `app/lib/supabase/admin.ts`**

```ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 2: Create `app/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create `app/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore when called from Server Component during session refresh
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create `app/lib/types.ts`**

```ts
export interface HumorFlavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
  modified_datetime_utc: string;
}

export interface HumorFlavorStep {
  id: number;
  humor_flavor_id: number;
  order_by: number;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_temperature: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  description: string | null;
  created_datetime_utc: string;
  created_by_user_id: string;
  modified_by_user_id: string;
  modified_datetime_utc: string;
}

export interface LlmModel {
  id: number;
  name: string;
  llm_provider_id: number;
  is_temperature_supported: boolean;
}

export interface LookupItem {
  id: number;
  slug: string;
  description: string;
}

export interface StudyImageSet {
  id: number;
  slug: string;
  description: string | null;
}

export interface ImageRecord {
  id: number;
  url: string;
  image_description: string | null;
}

export interface CaptionRecord {
  id: number;
  content: string;
  image_id: number;
  humor_flavor_id: number | null;
  caption_request_id: number | null;
  llm_prompt_chain_id: number | null;
  created_datetime_utc: string;
}
```

- [ ] **Step 5: Commit**

```bash
git add app/lib/ && git commit -m "feat: add Supabase clients and TypeScript interfaces"
```

---

### Task 3: Auth Proxy + Login + Access Denied + Callback

**Files:**
- Create: `proxy.ts` (project root)
- Create: `app/login/page.tsx`
- Create: `app/access-denied/page.tsx`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create `proxy.ts`**

> **Important:** Next.js 16 renamed middleware to proxy. File goes in project root (same level as `app/`).

```ts
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/access-denied"];

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").filter(Boolean);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (isPublicPath(request.nextUrl.pathname)) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Use service role client to bypass RLS for profile check
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_superadmin, is_matrix_admin")
    .eq("id", user.id)
    .single();

  const isAdminByEmail = ADMIN_EMAILS.includes(user.email ?? "");
  if (!profile?.is_superadmin && !profile?.is_matrix_admin && !isAdminByEmail) {
    const url = request.nextUrl.clone();
    url.pathname = "/access-denied";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Create `app/login/page.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `app/access-denied/page.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `app/auth/callback/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const loginUrl = `${origin}/login`;

  if (errorParam) return NextResponse.redirect(loginUrl);

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(`${origin}/`);
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: Compiles (ThemeProvider stub needed — will be created in next task).

- [ ] **Step 6: Commit**

```bash
git add proxy.ts app/login/ app/access-denied/ app/auth/ && git commit -m "feat: add auth proxy, login, access denied, and OAuth callback"
```

---

### Task 4: Theme System (Provider + Toggle)

**Files:**
- Create: `app/components/theme-provider.tsx`
- Create: `app/components/theme-toggle.tsx`

- [ ] **Step 1: Create `app/components/theme-provider.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) setThemeState(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Create `app/components/theme-toggle.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/components/theme-provider.tsx app/components/theme-toggle.tsx && git commit -m "feat: add theme provider and light/dark/system toggle"
```

---

### Task 5: Shared Components (Sidebar, Pagination, Modal, ConfirmDelete)

**Files:**
- Create: `app/components/sidebar.tsx`
- Create: `app/components/pagination.tsx`
- Create: `app/components/modal.tsx`
- Create: `app/components/confirm-delete-button.tsx`

- [ ] **Step 1: Create `app/components/sidebar.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `app/components/pagination.tsx`**

```tsx
import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
  q,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  q?: string;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="px-4 py-2 border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          Prev
        </Link>
      )}
      <span className="px-4 py-2 text-sm font-bold text-[var(--foreground)]/60">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          className="px-4 py-2 border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          Next
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `app/components/modal.tsx`**

```tsx
"use client";

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--background)] border-3 border-[var(--border)] shadow-[var(--shadow-md)] p-6 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/components/confirm-delete-button.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function ConfirmDeleteButton({
  id,
  onDelete,
}: {
  id: number;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-bold uppercase text-[var(--accent-red)] hover:underline cursor-pointer"
      >
        Delete
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await onDelete(formData);
        setConfirming(false);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-bold uppercase text-white bg-[var(--accent-red)] px-2 py-1 border-2 border-[var(--border)] cursor-pointer"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-bold uppercase text-[var(--foreground)]/60 ml-1 cursor-pointer"
      >
        Cancel
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add app/components/ && git commit -m "feat: add sidebar, pagination, modal, and confirm delete components"
```

---

### Task 6: App Layout (Protected Route Group)

**Files:**
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Create `app/(app)/layout.tsx`**

```tsx
import Sidebar from "@/app/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-8">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Delete default `app/page.tsx`** (the home page now lives at `app/(app)/page.tsx`)

```bash
rm app/page.tsx
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/layout.tsx && git rm app/page.tsx && git commit -m "feat: add protected app layout with sidebar"
```

---

### Task 7: Humor Flavors List Page (CRUD)

**Files:**
- Create: `app/(app)/page.tsx`
- Create: `app/(app)/actions.ts`
- Create: `app/(app)/flavors-table.tsx`
- Create: `app/(app)/flavor-form.tsx`

- [ ] **Step 1: Create `app/(app)/actions.ts`**

```ts
"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createFlavor(formData: FormData) {
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("humor_flavors")
    .insert({ slug, description });

  if (error) console.error("Failed to create flavor:", error.message);
  revalidatePath("/");
}

export async function updateFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  await supabase
    .from("humor_flavors")
    .update({ slug, description })
    .eq("id", id);
  revalidatePath("/");
}

export async function deleteFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();
  await supabase.from("humor_flavors").delete().eq("id", id);
  revalidatePath("/");
}

export async function duplicateFlavor(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = createAdminClient();

  // Fetch original flavor
  const { data: original } = await supabase
    .from("humor_flavors")
    .select("slug, description")
    .eq("id", id)
    .single();
  if (!original) return;

  // Insert copy
  const { data: newFlavor } = await supabase
    .from("humor_flavors")
    .insert({ slug: `${original.slug}-copy`, description: original.description })
    .select("id")
    .single();
  if (!newFlavor) return;

  // Copy all steps
  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("order_by, humor_flavor_step_type_id, llm_model_id, llm_temperature, llm_input_type_id, llm_output_type_id, llm_system_prompt, llm_user_prompt, description")
    .eq("humor_flavor_id", id)
    .order("order_by");

  if (steps && steps.length > 0) {
    const copies = steps.map((s) => ({
      ...s,
      humor_flavor_id: newFlavor.id,
    }));
    await supabase.from("humor_flavor_steps").insert(copies);
  }

  revalidatePath("/");
}
```

- [ ] **Step 2: Create `app/(app)/flavor-form.tsx`**

```tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/app/components/modal";
import { createFlavor, updateFlavor } from "./actions";

interface FlavorFormProps {
  flavor?: { id: number; slug: string; description: string | null };
  onClose: () => void;
}

export default function FlavorForm({ flavor, onClose }: FlavorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    if (flavor) {
      formData.set("id", String(flavor.id));
      await updateFlavor(formData);
    } else {
      await createFlavor(formData);
    }
    setPending(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <h2 className="font-head text-xl uppercase tracking-tight">
          {flavor ? "Edit Flavor" : "New Flavor"}
        </h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={flavor?.slug}
            required
            placeholder="e.g. dark-humor-v2"
            className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={flavor?.description ?? ""}
            rows={3}
            placeholder="Optional description..."
            className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans resize-y focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 3: Create `app/(app)/flavors-table.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import FlavorForm from "./flavor-form";
import ConfirmDeleteButton from "@/app/components/confirm-delete-button";
import Pagination from "@/app/components/pagination";
import { deleteFlavor, duplicateFlavor } from "./actions";

interface Flavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
  step_count: number;
}

export default function FlavorsTable({
  flavors,
  page,
  totalPages,
  q,
}: {
  flavors: Flavor[];
  page: number;
  totalPages: number;
  q?: string;
}) {
  const [editing, setEditing] = useState<Flavor | "new" | null>(null);

  return (
    <>
      {/* Search + Create */}
      <div className="flex items-center gap-3">
        <form action="/" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by slug..."
            className="px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans w-72 focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </form>
        <button
          onClick={() => setEditing("new")}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          + New Flavor
        </button>
      </div>

      {/* Table */}
      <div className="border-3 border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b-3 border-[var(--border)] bg-[var(--foreground)]/5">
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">ID</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Slug</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Description</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Steps</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Created</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flavors.map((f) => (
              <tr key={f.id} className="border-b-2 border-[var(--border)] hover:bg-[var(--primary)]/10 transition-colors">
                <td className="p-3 text-[var(--foreground)]/60">{f.id}</td>
                <td className="p-3 font-bold">
                  <Link href={`/flavors/${f.id}`} className="text-[var(--accent-blue)] hover:underline">
                    {f.slug}
                  </Link>
                </td>
                <td className="p-3 text-[var(--foreground)]/60 max-w-xs truncate">{f.description ?? "—"}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 bg-[var(--foreground)]/10 border border-[var(--border)] text-xs font-bold">
                    {f.step_count}
                  </span>
                </td>
                <td className="p-3 text-[var(--foreground)]/60">
                  {new Date(f.created_datetime_utc).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setEditing(f)}
                      className="text-xs font-bold uppercase text-[var(--accent-blue)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <form action={duplicateFlavor}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" className="text-xs font-bold uppercase text-[var(--accent-green)] hover:underline cursor-pointer">
                        Dupe
                      </button>
                    </form>
                    <ConfirmDeleteButton id={f.id} onDelete={deleteFlavor} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/" page={page} totalPages={totalPages} q={q} />

      {editing !== null && (
        <FlavorForm
          flavor={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: Create `app/(app)/page.tsx`**

```tsx
import { createAdminClient } from "@/app/lib/supabase/admin";
import FlavorsTable from "./flavors-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function FlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  // Get total count
  let countQuery = supabase
    .from("humor_flavors")
    .select("*", { count: "exact", head: true });
  if (q) countQuery = countQuery.ilike("slug", `%${q}%`);
  const { count } = await countQuery;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Get flavors
  let query = supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);
  if (q) query = query.ilike("slug", `%${q}%`);
  const { data: flavors } = await query;

  // Get step counts
  const flavorIds = (flavors ?? []).map((f) => f.id);
  let stepCounts: Record<number, number> = {};
  if (flavorIds.length > 0) {
    const { data: steps } = await supabase
      .from("humor_flavor_steps")
      .select("humor_flavor_id")
      .in("humor_flavor_id", flavorIds);
    if (steps) {
      for (const s of steps) {
        stepCounts[s.humor_flavor_id] = (stepCounts[s.humor_flavor_id] || 0) + 1;
      }
    }
  }

  const flavorsWithCounts = (flavors ?? []).map((f) => ({
    ...f,
    step_count: stepCounts[f.id] || 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-head text-3xl uppercase tracking-tight">Humor Flavors</h1>
      <FlavorsTable
        flavors={flavorsWithCounts}
        page={page}
        totalPages={totalPages}
        q={q || undefined}
      />
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add app/(app)/page.tsx app/(app)/actions.ts app/(app)/flavors-table.tsx app/(app)/flavor-form.tsx && git commit -m "feat: add humor flavors list with CRUD and duplicate"
```

---

### Task 8: Flavor Detail Page + Step CRUD

**Files:**
- Create: `app/(app)/flavors/[id]/page.tsx`
- Create: `app/(app)/flavors/[id]/actions.ts`
- Create: `app/(app)/flavors/[id]/flavor-header.tsx`
- Create: `app/(app)/flavors/[id]/step-card.tsx`
- Create: `app/(app)/flavors/[id]/step-form.tsx`

- [ ] **Step 1: Create `app/(app)/flavors/[id]/actions.ts`**

```ts
"use server";

import { createAdminClient } from "@/app/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateFlavorDetail(formData: FormData) {
  const id = Number(formData.get("id"));
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;

  const supabase = createAdminClient();
  await supabase.from("humor_flavors").update({ slug, description }).eq("id", id);
  revalidatePath(`/flavors/${id}`);
}

export async function createStep(formData: FormData) {
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();

  // Get next order_by
  const { data: maxStep } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: false })
    .limit(1)
    .single();

  const nextOrder = (maxStep?.order_by ?? 0) + 1;

  await supabase.from("humor_flavor_steps").insert({
    humor_flavor_id: flavorId,
    order_by: nextOrder,
    humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
    llm_model_id: Number(formData.get("llm_model_id")),
    llm_temperature: parseFloat(formData.get("llm_temperature") as string),
    llm_input_type_id: Number(formData.get("llm_input_type_id")),
    llm_output_type_id: Number(formData.get("llm_output_type_id")),
    llm_system_prompt: formData.get("llm_system_prompt") as string,
    llm_user_prompt: formData.get("llm_user_prompt") as string,
    description: (formData.get("description") as string) || null,
  });

  revalidatePath(`/flavors/${flavorId}`);
}

export async function updateStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();
  await supabase
    .from("humor_flavor_steps")
    .update({
      humor_flavor_step_type_id: Number(formData.get("humor_flavor_step_type_id")),
      llm_model_id: Number(formData.get("llm_model_id")),
      llm_temperature: parseFloat(formData.get("llm_temperature") as string),
      llm_input_type_id: Number(formData.get("llm_input_type_id")),
      llm_output_type_id: Number(formData.get("llm_output_type_id")),
      llm_system_prompt: formData.get("llm_system_prompt") as string,
      llm_user_prompt: formData.get("llm_user_prompt") as string,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  revalidatePath(`/flavors/${flavorId}`);
}

export async function deleteStep(formData: FormData) {
  const id = Number(formData.get("id"));
  const flavorId = Number(formData.get("humor_flavor_id"));

  const supabase = createAdminClient();
  await supabase.from("humor_flavor_steps").delete().eq("id", id);

  // Re-number remaining steps
  const { data: remaining } = await supabase
    .from("humor_flavor_steps")
    .select("id")
    .eq("humor_flavor_id", flavorId)
    .order("order_by");

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("humor_flavor_steps")
        .update({ order_by: i + 1 })
        .eq("id", remaining[i].id);
    }
  }

  revalidatePath(`/flavors/${flavorId}`);
}

export async function reorderSteps(flavorId: number, orderedStepIds: number[]) {
  const supabase = createAdminClient();

  for (let i = 0; i < orderedStepIds.length; i++) {
    await supabase
      .from("humor_flavor_steps")
      .update({ order_by: i + 1 })
      .eq("id", orderedStepIds[i]);
  }

  revalidatePath(`/flavors/${flavorId}`);
}
```

- [ ] **Step 2: Create `app/(app)/flavors/[id]/flavor-header.tsx`**

```tsx
"use client";

import { useState } from "react";
import { updateFlavorDetail } from "./actions";

export default function FlavorHeader({
  flavor,
}: {
  flavor: { id: number; slug: string; description: string | null };
}) {
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(flavor.slug);
  const [description, setDescription] = useState(flavor.description ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.set("id", String(flavor.id));
    fd.set("slug", slug);
    fd.set("description", description);
    await updateFlavorDetail(fd);
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl uppercase tracking-tight">{flavor.slug}</h1>
          <p className="text-[var(--foreground)]/60 text-sm mt-1">
            {flavor.description || "No description"}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 border-2 border-[var(--border)] text-xs font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-3 border-[var(--border)] p-4 shadow-[var(--shadow-sm)]">
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full px-3 py-2 border-2 border-[var(--border)] text-sm font-sans focus:outline-none focus:shadow-[var(--shadow-sm)]"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border-2 border-[var(--border)] text-sm font-sans resize-y focus:outline-none focus:shadow-[var(--shadow-sm)]"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setSlug(flavor.slug);
            setDescription(flavor.description ?? "");
            setEditing(false);
          }}
          className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/(app)/flavors/[id]/step-card.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { HumorFlavorStep, LlmModel, LookupItem } from "@/app/lib/types";
import ConfirmDeleteButton from "@/app/components/confirm-delete-button";
import { deleteStep, updateStep } from "./actions";

interface StepCardProps {
  step: HumorFlavorStep;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}

export default function StepCard({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const modelName = models.find((m) => m.id === step.llm_model_id)?.name ?? "Unknown";
  const inputSlug = inputTypes.find((t) => t.id === step.llm_input_type_id)?.slug ?? "?";
  const outputSlug = outputTypes.find((t) => t.id === step.llm_output_type_id)?.slug ?? "?";
  const stepTypeSlug = stepTypes.find((t) => t.id === step.humor_flavor_step_type_id)?.slug ?? "?";

  const handleDeleteStep = async (formData: FormData) => {
    formData.set("humor_flavor_id", String(flavorId));
    await deleteStep(formData);
  };

  const handleUpdateStep = async (formData: FormData) => {
    formData.set("id", String(step.id));
    formData.set("humor_flavor_id", String(flavorId));
    await updateStep(formData);
    setEditing(false);
  };

  return (
    <div className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] bg-[var(--background)]">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        {/* Drag handle placeholder — actual handle is rendered by DraggableStepList */}
        <span className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border-2 border-[var(--border)] text-xs font-bold font-head flex-shrink-0">
          {step.order_by}
        </span>

        <div className="flex-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase px-2 py-0.5 border border-[var(--border)] bg-[var(--foreground)]/5">
            {stepTypeSlug}
          </span>
          <span className="text-xs font-bold text-[var(--accent-blue)]">{modelName}</span>
          <span className="text-xs text-[var(--foreground)]/60">temp: {step.llm_temperature}</span>
          <span className="text-xs text-[var(--foreground)]/40">{inputSlug} → {outputSlug}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) setEditing(false); }}
            className="text-xs font-bold uppercase text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <ConfirmDeleteButton id={step.id} onDelete={handleDeleteStep} />
        </div>
      </div>

      {/* Description */}
      {step.description && (
        <div className="px-3 pb-2 text-xs text-[var(--foreground)]/60">{step.description}</div>
      )}

      {/* Expanded prompts */}
      {expanded && !editing && (
        <div className="border-t-2 border-[var(--border)] p-3 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/60">System Prompt</label>
            <pre className="mt-1 text-xs bg-[var(--foreground)]/5 border border-[var(--border)] p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {step.llm_system_prompt}
            </pre>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/60">User Prompt</label>
            <pre className="mt-1 text-xs bg-[var(--foreground)]/5 border border-[var(--border)] p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {step.llm_user_prompt}
            </pre>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            Edit Step
          </button>
        </div>
      )}

      {/* Inline edit form */}
      {expanded && editing && (
        <form action={handleUpdateStep} className="border-t-2 border-[var(--border)] p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase">Step Type</label>
              <select name="humor_flavor_step_type_id" defaultValue={step.humor_flavor_step_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Model</label>
              <select name="llm_model_id" defaultValue={step.llm_model_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Temperature</label>
              <input name="llm_temperature" type="number" step="0.1" min="0" max="2" defaultValue={step.llm_temperature} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Input Type</label>
              <select name="llm_input_type_id" defaultValue={step.llm_input_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Output Type</label>
              <select name="llm_output_type_id" defaultValue={step.llm_output_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Description</label>
              <input name="description" defaultValue={step.description ?? ""} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">System Prompt</label>
            <textarea name="llm_system_prompt" defaultValue={step.llm_system_prompt} rows={6} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">User Prompt</label>
            <textarea name="llm_user_prompt" defaultValue={step.llm_user_prompt} rows={6} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] cursor-pointer">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create `app/(app)/flavors/[id]/step-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import Modal from "@/app/components/modal";
import { createStep } from "./actions";
import type { LlmModel, LookupItem } from "@/app/lib/types";

interface StepFormProps {
  flavorId: number;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  onClose: () => void;
}

export default function StepForm({ flavorId, models, inputTypes, outputTypes, stepTypes, onClose }: StepFormProps) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    formData.set("humor_flavor_id", String(flavorId));
    await createStep(formData);
    setPending(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form action={handleSubmit} className="space-y-4">
        <h2 className="font-head text-xl uppercase tracking-tight">New Step</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase">Step Type</label>
            <select name="humor_flavor_step_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Model</label>
            <select name="llm_model_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Temperature</label>
            <input name="llm_temperature" type="number" step="0.1" min="0" max="2" defaultValue="1.0" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Input Type</label>
            <select name="llm_input_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Output Type</label>
            <select name="llm_output_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Description</label>
            <input name="description" placeholder="Step intent..." className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase">System Prompt</label>
          <textarea name="llm_system_prompt" rows={4} required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase">User Prompt</label>
          <textarea name="llm_user_prompt" rows={4} required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 cursor-pointer">Cancel</button>
          <button type="submit" disabled={pending} className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] cursor-pointer disabled:opacity-50">
            {pending ? "Creating..." : "Create Step"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
```

- [ ] **Step 5: Create `app/(app)/flavors/[id]/page.tsx`**

```tsx
import { createAdminClient } from "@/app/lib/supabase/admin";
import { notFound } from "next/navigation";
import FlavorHeader from "./flavor-header";
import DraggableStepList from "./draggable-step-list";
import TestPanel from "./test-panel";

export const dynamic = "force-dynamic";

export default async function FlavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const flavorId = Number(id);
  const supabase = createAdminClient();

  // Fetch flavor
  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .eq("id", flavorId)
    .single();

  if (!flavor) notFound();

  // Fetch steps + lookups in parallel
  const [stepsRes, modelsRes, inputTypesRes, outputTypesRes, stepTypesRes, imageSetsRes] =
    await Promise.all([
      supabase
        .from("humor_flavor_steps")
        .select("*")
        .eq("humor_flavor_id", flavorId)
        .order("order_by"),
      supabase.from("llm_models").select("id, name, llm_provider_id, is_temperature_supported"),
      supabase.from("llm_input_types").select("id, slug, description"),
      supabase.from("llm_output_types").select("id, slug, description"),
      supabase.from("humor_flavor_step_types").select("id, slug, description"),
      supabase.from("study_image_sets").select("id, slug, description"),
    ]);

  // Fetch images for all image sets server-side (avoids RLS issues on client)
  const setIds = (imageSetsRes.data ?? []).map((s) => s.id);
  const imageSetImages: Record<number, { id: number; url: string; image_description: string | null }[]> = {};
  if (setIds.length > 0) {
    const { data: mappings } = await supabase
      .from("study_image_set_image_mappings")
      .select("study_image_set_id, image_id")
      .in("study_image_set_id", setIds);

    if (mappings && mappings.length > 0) {
      const imageIds = [...new Set(mappings.map((m) => m.image_id))];
      const { data: imgs } = await supabase
        .from("images")
        .select("id, url, image_description")
        .in("id", imageIds);

      const imgMap = new Map((imgs ?? []).map((i) => [i.id, i]));
      for (const m of mappings) {
        if (!imageSetImages[m.study_image_set_id]) imageSetImages[m.study_image_set_id] = [];
        const img = imgMap.get(m.image_id);
        if (img) imageSetImages[m.study_image_set_id].push(img);
      }
    }
  }

  return (
    <div className="space-y-8">
      <FlavorHeader flavor={flavor} />

      <DraggableStepList
        steps={stepsRes.data ?? []}
        models={modelsRes.data ?? []}
        inputTypes={inputTypesRes.data ?? []}
        outputTypes={outputTypesRes.data ?? []}
        stepTypes={stepTypesRes.data ?? []}
        flavorId={flavorId}
      />

      <TestPanel
        flavorId={flavorId}
        imageSets={imageSetsRes.data ?? []}
        imageSetImages={imageSetImages}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: May fail because `draggable-step-list.tsx` and `test-panel.tsx` don't exist yet. Create stubs:

```tsx
// app/(app)/flavors/[id]/draggable-step-list.tsx
"use client";
export default function DraggableStepList(props: any) { return <div>Steps placeholder</div>; }

// app/(app)/flavors/[id]/test-panel.tsx
"use client";
export default function TestPanel(props: any) { return <div>Test panel placeholder</div>; }
```

- [ ] **Step 7: Commit**

```bash
git add app/(app)/flavors/ && git commit -m "feat: add flavor detail page with step CRUD and inline editing"
```

---

### Task 9: Drag-and-Drop Step Reorder

**Files:**
- Modify: `app/(app)/flavors/[id]/draggable-step-list.tsx` (replace stub)

- [ ] **Step 1: Write `app/(app)/flavors/[id]/draggable-step-list.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StepCard from "./step-card";
import StepForm from "./step-form";
import { reorderSteps } from "./actions";
import type { HumorFlavorStep, LlmModel, LookupItem } from "@/app/lib/types";

function SortableStep({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: {
  step: HumorFlavorStep;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex gap-2">
        <button
          {...attributes}
          {...listeners}
          className="w-8 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing text-[var(--foreground)]/40 hover:text-[var(--foreground)] border-2 border-[var(--border)] bg-[var(--foreground)]/5"
          title="Drag to reorder"
        >
          ⠿
        </button>
        <div className="flex-1">
          <StepCard
            step={step}
            models={models}
            inputTypes={inputTypes}
            outputTypes={outputTypes}
            stepTypes={stepTypes}
            flavorId={flavorId}
          />
        </div>
      </div>
    </div>
  );
}

export default function DraggableStepList({
  steps: initialSteps,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: {
  steps: HumorFlavorStep[];
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [showForm, setShowForm] = useState(false);

  // Sync with server re-renders (e.g., after step create/delete)
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    const newSteps = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order_by: i + 1,
    }));

    setSteps(newSteps);
    await reorderSteps(flavorId, newSteps.map((s) => s.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-xl uppercase tracking-tight">
          Steps ({steps.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          + Add Step
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {steps.map((step) => (
              <SortableStep
                key={step.id}
                step={step}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                stepTypes={stepTypes}
                flavorId={flavorId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="border-2 border-dashed border-[var(--border)] p-8 text-center text-[var(--foreground)]/40 text-sm font-bold uppercase">
          No steps yet. Add one to get started.
        </div>
      )}

      {showForm && (
        <StepForm
          flavorId={flavorId}
          models={models}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          stepTypes={stepTypes}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/flavors/[id]/draggable-step-list.tsx && git commit -m "feat: add drag-and-drop step reordering with dnd-kit"
```

---

### Task 10: Test Panel (REST API Caption Generation)

**Files:**
- Modify: `app/(app)/flavors/[id]/test-panel.tsx` (replace stub)

- [ ] **Step 1: Write `app/(app)/flavors/[id]/test-panel.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { StudyImageSet, ImageRecord } from "@/app/lib/types";

const API_BASE = "https://api.almostcrackd.ai";

type ImageStatus = "pending" | "running" | "done" | "error";

interface TestImage extends ImageRecord {
  status: ImageStatus;
  captions: string[];
  error?: string;
}

interface ImageSetImages {
  [setId: number]: ImageRecord[];
}

export default function TestPanel({
  flavorId,
  imageSets,
  imageSetImages,
}: {
  flavorId: number;
  imageSets: StudyImageSet[];
  imageSetImages: ImageSetImages;
}) {
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [images, setImages] = useState<TestImage[]>([]);
  const [running, setRunning] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get access token
  useEffect(() => {
    async function getToken() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setAccessToken(session.access_token);
    }
    getToken();
  }, []);

  // Load images from pre-fetched server data when set is selected
  const loadImages = useCallback((setId: number) => {
    setSelectedSetId(setId);
    const imgs = imageSetImages[setId] ?? [];
    setImages(
      imgs.map((img) => ({
        ...img,
        status: "pending" as ImageStatus,
        captions: [],
      }))
    );
  }, [imageSetImages]);

  const runTest = useCallback(async () => {
    if (!accessToken || images.length === 0) return;
    setRunning(true);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    for (let i = 0; i < images.length; i++) {
      setImages((prev) =>
        prev.map((img, j) =>
          j === i ? { ...img, status: "running" as ImageStatus } : img
        )
      );

      try {
        const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
          method: "POST",
          headers,
          body: JSON.stringify({ imageId: images[i].id, humorFlavorId: flavorId }),
        });

        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        const data = await res.json();
        const captions = Array.isArray(data)
          ? data.map((c: { content?: string }) => c.content ?? JSON.stringify(c))
          : [];

        setImages((prev) =>
          prev.map((img, j) =>
            j === i ? { ...img, status: "done" as ImageStatus, captions } : img
          )
        );
      } catch (err) {
        setImages((prev) =>
          prev.map((img, j) =>
            j === i
              ? {
                  ...img,
                  status: "error" as ImageStatus,
                  error: err instanceof Error ? err.message : "Unknown error",
                }
              : img
          )
        );
      }
    }

    setRunning(false);
  }, [accessToken, images, flavorId]);

  return (
    <div className="space-y-4">
      <h2 className="font-head text-xl uppercase tracking-tight">Test Flavor</h2>

      <div className="flex items-center gap-3">
        <select
          value={selectedSetId ?? ""}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val) loadImages(val);
          }}
          className="px-3 py-2 border-2 border-[var(--border)] text-sm bg-[var(--background)] font-sans"
        >
          <option value="">Select image set...</option>
          {imageSets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.slug} {s.description ? `— ${s.description}` : ""}
            </option>
          ))}
        </select>

        <button
          onClick={runTest}
          disabled={running || images.length === 0}
          className="px-4 py-2 bg-[var(--accent-green)] text-white border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
        >
          {running ? "Running..." : "Run Test"}
        </button>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((img) => (
            <div key={img.id} className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] p-4 flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 flex-shrink-0 border-2 border-[var(--border)] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.image_description ?? "Test image"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                {/* Status badge */}
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-bold uppercase border-2 border-[var(--border)] ${
                    img.status === "pending"
                      ? "bg-[var(--foreground)]/10"
                      : img.status === "running"
                      ? "bg-[var(--primary)] text-[var(--secondary)]"
                      : img.status === "done"
                      ? "bg-[var(--accent-green)] text-white"
                      : "bg-[var(--accent-red)] text-white"
                  }`}
                >
                  {img.status}
                </span>

                {/* Error */}
                {img.error && (
                  <p className="text-xs text-[var(--accent-red)]">{img.error}</p>
                )}

                {/* Captions */}
                {img.captions.length > 0 && (
                  <div className="space-y-1">
                    {img.captions.map((c, i) => (
                      <p key={i} className="text-sm border-l-3 border-[var(--primary)] pl-2">
                        {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/flavors/[id]/test-panel.tsx && git commit -m "feat: add test panel with image set selection and caption generation"
```

---

### Task 11: Captions Viewer Page

**Files:**
- Create: `app/(app)/captions/page.tsx`

- [ ] **Step 1: Create `app/(app)/captions/page.tsx`**

```tsx
import { createAdminClient } from "@/app/lib/supabase/admin";
import Image from "next/image";
import Pagination from "@/app/components/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ flavor?: string; page?: string }>;
}) {
  const params = await searchParams;
  const flavorFilter = params.flavor ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  // Get flavors for filter dropdown
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("id, slug")
    .order("slug");

  // Build query
  let countQuery = supabase
    .from("captions")
    .select("*", { count: "exact", head: true });
  let dataQuery = supabase
    .from("captions")
    .select("id, content, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (flavorFilter) {
    countQuery = countQuery.eq("humor_flavor_id", Number(flavorFilter));
    dataQuery = dataQuery.eq("humor_flavor_id", Number(flavorFilter));
  }

  const [{ count }, { data: captions }] = await Promise.all([countQuery, dataQuery]);
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  // Resolve image URLs
  const imageIds = [...new Set((captions ?? []).map((c) => c.image_id).filter(Boolean))];
  let imageMap: Record<number, string> = {};
  if (imageIds.length > 0) {
    const { data: images } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);
    if (images) {
      for (const img of images) imageMap[img.id] = img.url;
    }
  }

  // Resolve flavor slugs
  const flavorMap: Record<number, string> = {};
  if (flavors) {
    for (const f of flavors) flavorMap[f.id] = f.slug;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-head text-3xl uppercase tracking-tight">Captions</h1>

      {/* Filter */}
      <form action="/captions" method="get" className="flex items-center gap-3">
        <select
          name="flavor"
          defaultValue={flavorFilter}
          className="px-3 py-2 border-2 border-[var(--border)] text-sm bg-[var(--background)] font-sans"
        >
          <option value="">All Flavors</option>
          {(flavors ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.slug}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          Filter
        </button>
      </form>

      {/* Captions list */}
      <div className="space-y-3">
        {(captions ?? []).map((c) => (
          <div key={c.id} className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] p-4 flex gap-4">
            {/* Image thumbnail */}
            {imageMap[c.image_id] && (
              <div className="w-20 h-20 flex-shrink-0 border-2 border-[var(--border)] overflow-hidden relative">
                <Image
                  src={imageMap[c.image_id]}
                  alt="Caption image"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-bold">{c.content}</p>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--foreground)]/60">
                {c.humor_flavor_id && (
                  <span className="px-2 py-0.5 border border-[var(--border)] bg-[var(--foreground)]/5">
                    {flavorMap[c.humor_flavor_id] ?? `flavor:${c.humor_flavor_id}`}
                  </span>
                )}
                <span>req:{c.caption_request_id}</span>
                <span>chain:{c.llm_prompt_chain_id}</span>
                <span>{new Date(c.created_datetime_utc).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination basePath="/captions" page={page} totalPages={totalPages} q={flavorFilter ? `flavor=${flavorFilter}` : undefined} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/captions/ && git commit -m "feat: add captions viewer with flavor filter and pagination"
```

---

### Task 12: Final Build Verification + Cleanup

**Files:**
- Possibly modify any file with build errors

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected: All routes compile. Check for:
- `/ ` (flavors list) — dynamic (ƒ)
- `/flavors/[id]` — dynamic (ƒ)
- `/captions` — dynamic (ƒ)
- `/login` — static or dynamic
- `/access-denied` — static or dynamic
- `/auth/callback` — route handler

- [ ] **Step 2: Fix any build errors**

Address TypeScript errors, missing imports, or Tailwind class issues.

- [ ] **Step 3: Test locally**

```bash
npm run dev
```

Visit `http://localhost:3000` — should redirect to `/login`. After Google sign-in:
- Verify sidebar nav works
- Verify theme toggle (light/dark/system)
- Verify flavors CRUD (create, edit, delete, duplicate)
- Verify flavor detail page loads steps
- Verify step CRUD (create, edit inline, delete)
- Verify drag-and-drop reorder
- Verify test panel loads image sets
- Verify captions page loads and filters

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: address build errors and cleanup"
```

---

### Task 13: Deploy to Vercel

- [ ] **Step 1: Create GitHub repository**

```bash
gh repo create humor-prompt-tool --public --source=. --remote=origin --push
```

- [ ] **Step 2: Deploy to Vercel**

Go to https://vercel.com/new, import the `humor-prompt-tool` repo, and add environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

- [ ] **Step 3: Turn off Vercel deployment protection**

In Vercel project settings → General → Deployment Protection → set to "None" (so Incognito Mode works).

- [ ] **Step 4: Verify deployed app**

Visit the Vercel URL and test login flow.

- [ ] **Step 5: Get commit-specific Vercel URL for submission**

The assignment asks for the latest commit-specific URL (not the main deployment URL).
