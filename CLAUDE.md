# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Environment Variables

Required in `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `NEXT_PUBLIC_BASE_URL` | Base URL for generating `/p/` tracking links |
| `NEXT_PUBLIC_DEFAULT_PORTFOLIO_URL` | Default value pre-filled in the link generator form |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — used server-side only to record views (bypasses RLS) |
| `RESEND_API_KEY` | (Optional) Resend email API key for view notifications |
| `NOTIFICATION_EMAIL` | (Optional) Recipient for view notification emails |

## Architecture

This is a portfolio tracking app. It generates short `/p/[slug]` links tied to specific companies. When a recruiter clicks one, the app records the visit and redirects them to the real portfolio URL. The owner can monitor views per link in an admin dashboard.

### Supabase clients — three variants, use the right one

- `lib/supabase/client.ts` — browser-side (use in Client Components)
- `lib/supabase/server.ts` → `createClient()` — SSR-aware server-side (use in Server Components and Server Actions)
- `lib/supabase/server.ts` → `createServiceClient()` — service role, bypasses RLS; **server-only**, used exclusively in `/p/[slug]/route.ts` to write views as an anonymous visitor

### Auth flow

Magic link OTP via Supabase. Login at `/login` → Supabase sends email → browser lands on `/auth/callback` → code exchanged for session → redirect to `/admin`.

`src/middleware.ts` protects `/admin/*` (unauthenticated → `/login`) and redirects authenticated users away from `/login`. Admin page also calls `getUser()` server-side as a second guard.

### View tracking — `/p/[slug]/route.ts`

Runs as `nodejs` runtime (not Edge). Sequence:
1. Fetch link record via anon client (RLS allows anon SELECT on `links`)
2. Record view via **service client** (hashed IP, user-agent, referrer) into `views` table
3. Fire-and-forget email via Resend (conditional on `RESEND_API_KEY`)
4. 302 redirect to `original_url`

### Database schema (`supabase/schema.sql`)

Two tables with RLS enabled:
- `links` — `slug` (unique), `company`, `original_url`, `created_by` (FK to auth.users)
- `views` — `link_id` (FK cascade), `user_agent`, `referrer`, `ip_hash`

Anon role can SELECT links and INSERT views (required for the public tracking route). Authenticated users manage only their own links.

### Admin dashboard — `/admin`

Server Component that eager-loads view counts via `select("*, views(count)")`. Child client components (`link-generator.tsx`, `link-table.tsx`) handle interactivity. Server Actions in `actions.ts` (`createLink`, `deleteLink`) use `nanoid(8)` for slug generation and call `revalidatePath` after mutations.

### UI stack

shadcn/ui (base-nova style) + Tailwind CSS v4 (`@tailwindcss/postcss`). Use `cn()` from `lib/utils.ts` for class merging. Toast notifications via Sonner (configured in root layout). Path alias `@/*` maps to `src/*`.
