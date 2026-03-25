# Prompt Chain Tool — Design Spec

## Overview

A Next.js 16 application for managing humor flavors and their prompt pipelines. Authenticated users (superadmin or matrix_admin) can create, edit, delete, and reorder humor flavor steps, test flavors against image sets via the REST API, and view generated captions. Supports dark/light/system theme. **Neobrutalism aesthetic** via RetroUI component library.

## Tech Stack

- **Next.js 16.2.1** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **RetroUI** (`pixel-retroui`) — neobrutalism-styled React + Tailwind component library (shadcn-based)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`) — same instance as humor-admin/humor-proj
- **`@dnd-kit/core` + `@dnd-kit/sortable`** — drag-and-drop step reordering
- **`class-variance-authority`** — required by RetroUI for component variants

## UI Design: Neobrutalism

### Aesthetic
- **Bold black borders** (2-3px) on all interactive elements
- **Hard drop shadows** (offset solid black, no blur)
- **Flat, saturated colors** — minimal palette
- **Chunky typography** — Archivo Black (headings) + Space Grotesk (body)
- **No rounded corners** (radius: 0) or minimal rounding
- **High contrast** — black on white/color, white on black in dark mode

### Color Palette (Minimal)
```css
:root {
  --radius: 0;
  --background: #ffffff;
  --foreground: #000000;
  --primary: #ffdb33;        /* yellow — primary actions */
  --primary-hover: #ffcc00;
  --secondary: #000000;      /* black — secondary elements */
  --border: #000000;         /* hard black borders */
  --accent-red: #ff6b6b;     /* delete/error */
  --accent-green: #51cf66;   /* success */
  --accent-blue: #339af0;    /* info/links */
}

.dark {
  --background: #1a1a1a;
  --foreground: #f5f5f5;
  --primary: #ffdb33;
  --primary-hover: #ffcc00;
  --secondary: #3a3a3a;
  --border: #f5f5f5;         /* white borders in dark mode */
  --accent-red: #ff6b6b;
  --accent-green: #51cf66;
  --accent-blue: #74c0fc;
}
```

### RetroUI Setup
1. Initialize shadcn: `npx shadcn@latest init`
2. Add RetroUI utils: `npx shadcn@latest add https://retroui.dev/r/utils.json`
3. Install components via: `npx shadcn@latest add 'https://retroui.dev/r/{component}.json'`
4. Install CVA: `npm install class-variance-authority`
5. Fonts: Archivo Black (headings) + Space Grotesk (body) via `next/font/google`

### Component Mapping
| App Need | RetroUI Component |
|---|---|
| Action buttons | `Button` (primary/outline variants) |
| Form inputs | `Input`, `Textarea` |
| Step cards | `Accordion` with custom styling |
| Status indicators | `Badge` (solid/outlined variants) |
| User avatar | `Avatar` |
| Notifications | `Alert` |
| Modals/dialogs | Custom with neobrutalism border + shadow styling |
| Tables | Custom with hard borders and alternating row colors |

## Authentication & Authorization

### Flow
1. Google OAuth via Supabase `signInWithOAuth({ provider: "google" })`
2. Callback route exchanges code for session
3. Middleware (`middleware.ts`) on every request:
   - Public paths: `/login`, `/auth/callback`, `/access-denied` — skip check
   - No session → redirect `/login`
   - Query `profiles` table for authenticated user's `is_superadmin` and `is_matrix_admin` flags
   - If `is_superadmin == false AND is_matrix_admin == false` → redirect `/access-denied`
   - Fallback: `ADMIN_EMAILS` env var (comma-separated) grants access when DB check fails

### Supabase Clients
- **Browser client** (`lib/supabase/client.ts`) — for auth state, access token retrieval
- **Server client** (`lib/supabase/server.ts`) — for server components with cookie-based session
- **Admin client** (`lib/supabase/admin.ts`) — service role key, bypasses RLS for server actions

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAILS (fallback)
```

## Database Tables

### Primary Tables (CRUD via this app)

**`humor_flavors`**
| Column | Type | Notes |
|---|---|---|
| id | bigint | PK, auto-increment |
| slug | text | unique identifier |
| description | text | nullable |
| created_datetime_utc | timestamptz | auto |
| created_by_user_id | uuid | FK → profiles |
| modified_by_user_id | uuid | FK → profiles |
| modified_datetime_utc | timestamptz | auto |

**`humor_flavor_steps`**
| Column | Type | Notes |
|---|---|---|
| id | bigint | PK, auto-increment |
| humor_flavor_id | bigint | FK → humor_flavors |
| order_by | int | execution order (1-based) |
| humor_flavor_step_type_id | int | FK → humor_flavor_step_types |
| llm_model_id | int | FK → llm_models |
| llm_temperature | float | 0.0–2.0 |
| llm_input_type_id | int | FK → llm_input_types |
| llm_output_type_id | int | FK → llm_output_types |
| llm_system_prompt | text | system prompt content |
| llm_user_prompt | text | user prompt content |
| description | text | nullable, documents step intent |
| created_datetime_utc | timestamptz | |
| created_by_user_id | uuid | |
| modified_by_user_id | uuid | |
| modified_datetime_utc | timestamptz | |

### Lookup Tables (read-only)

| Table | Key Fields |
|---|---|
| `llm_models` | id, name, llm_provider_id, is_temperature_supported |
| `llm_providers` | id, name |
| `llm_input_types` | id, slug, description |
| `llm_output_types` | id, slug, description |
| `humor_flavor_step_types` | id, slug, description |
| `study_image_sets` | id, slug, description |
| `study_image_set_image_mappings` | study_image_set_id, image_id |
| `images` | id, url, image_description |
| `captions` | id, content, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id |

## Pages & Routes

### Layout Structure

```
app/
├── layout.tsx                    # Root: fonts, theme provider, metadata
├── globals.css                   # Tailwind + CSS variables (light/dark)
├── login/page.tsx                # Google sign-in
├── access-denied/page.tsx        # Unauthorized message + sign out
├── auth/callback/route.ts        # OAuth callback
├── (app)/                        # Protected route group
│   ├── layout.tsx                # Sidebar + header
│   ├── page.tsx                  # Humor flavors list (home)
│   ├── flavors/
│   │   └── [id]/page.tsx         # Flavor detail + steps
│   └── captions/page.tsx         # Captions viewer
├── components/                   # Shared components
└── lib/                          # Supabase clients, types
```

### `/` — Humor Flavors List

**Server component.** Fetches all `humor_flavors` with pagination (20/page) and search by slug.

**Table columns:** ID, Slug, Description, Step Count (subquery), Created Date

**Actions:**
- **Create** — modal form: slug (required), description (optional)
- **Edit** — modal form: same fields
- **Delete** — confirm dialog, cascade-deletes steps (DB constraint)
- **Duplicate** — creates new flavor with `{slug}-copy` and copies all steps (remapping `humor_flavor_id` to new flavor, setting `created_by_user_id`/`modified_by_user_id` to current user)

**Server actions** (`actions.ts`):
- `createFlavor(formData)` — insert into `humor_flavors`
- `updateFlavor(formData)` — update by id
- `deleteFlavor(formData)` — delete by id
- `duplicateFlavor(formData)` — insert new flavor + copy all steps

### `/flavors/[id]` — Flavor Detail + Steps

**Server component** that fetches the flavor and all its steps ordered by `order_by`. Also fetches all lookup tables (models, input/output types, step types) for dropdown options.

**Top section:** Editable flavor slug and description with inline save.

**Steps section:** Ordered list of step cards. Each card shows:
- Drag handle (left edge)
- Order number badge
- Step type, model name, temperature, input type, output type
- Description
- Expand/collapse toggle for prompts (system + user prompt textareas)

**Step actions:**
- **Create** — modal form with all step fields, `order_by` auto-set to max+1
- **Edit** — expand step card inline, edit any field, save button
- **Delete** — confirm, then re-number remaining steps
- **Reorder** — drag-and-drop via `@dnd-kit/sortable`, on drop: batch-update `order_by` for all affected steps

**Test panel** (bottom of page):
- Select a `study_image_set` from dropdown
- "Run Test" button
- Fetches images via `study_image_set_image_mappings` joined with `images`
- For each image, calls `POST https://api.almostcrackd.ai/pipeline/generate-captions` with `{ imageId }` and Bearer token (user's Supabase access token)
- Shows progress: image thumbnails with status indicators (pending/running/done/error)
- Results: generated captions displayed under each image

**Server actions** (`actions.ts`):
- `createStep(formData)` — insert step with next order_by
- `updateStep(formData)` — update step fields by id
- `deleteStep(formData)` — delete step, reorder remaining
- `reorderSteps(flavorId, orderedStepIds)` — batch update order_by

### `/captions` — Captions Viewer

**Server component.** Fetches `captions` with pagination, filterable by humor flavor.

**Display:** For each caption:
- Image thumbnail (from `images.url` via `image_id`)
- Caption text (`content`)
- Humor flavor slug (resolved via FK)
- Timestamps
- `caption_request_id`, `llm_prompt_chain_id`

## Shared Components

| Component | Purpose |
|---|---|
| `Sidebar` | Nav links (Flavors, Captions), theme toggle, sign out |
| `ThemeToggle` | Light/Dark/System switcher |
| `Pagination` | Page links preserving search params |
| `SearchInput` | Search bar with `q` query param |
| `ConfirmDeleteButton` | Two-click delete pattern |
| `Modal` | Backdrop blur overlay for create/edit forms |
| `StepCard` | Individual step display with expand/collapse |
| `DraggableStepList` | `@dnd-kit` sortable container for steps |

## Theme System

CSS variables are defined in the Color Palette section above (under UI Design: Neobrutalism).

### Theme Provider
- Client component reads localStorage `theme` preference
- Applies `dark` class to `<html>` element
- Three options: Light, Dark, System (uses `prefers-color-scheme` media query)
- Toggle in sidebar — styled as a neobrutalism pill with hard border + shadow
- Shadows use `--shadow-sm: 2px 2px 0 0 var(--border)` and `--shadow-xs: 1px 1px 0 0 var(--border)`

## REST API Integration

### Caption Generation (Client-Side)
The test panel on `/flavors/[id]` makes direct client-side fetch calls:

```
POST https://api.almostcrackd.ai/pipeline/generate-captions
Headers: { Authorization: "Bearer {supabase_access_token}", Content-Type: "application/json" }
Body: { imageId: number, humorFlavorId?: number }
Response: CaptionRecord[]
```

The access token is obtained from `supabase.auth.getSession()` on the client.

**Note:** The existing humor-proj app sends only `{ imageId }` (uses backend default flavor). This tool will also pass `humorFlavorId` set to the current flavor's id so the backend runs the specific flavor's pipeline. If the API ignores the parameter, it falls back to the default flavor — no harm done.

### Image Set Loading (Server-Side)
Study image sets and their images are fetched server-side via Supabase admin client, then passed to the client test panel component as props.

## Data Flow Summary

1. **Page load** → server component fetches flavor + steps + lookups via admin client
2. **CRUD operations** → server actions mutate via admin client, `revalidatePath()` refreshes
3. **Reorder** → client-side `@dnd-kit` drag, on drop calls server action with new order
4. **Test execution** → client-side: get access token → fetch image set images → call REST API per image → display results
5. **Captions view** → server component fetches captions with FK resolution
