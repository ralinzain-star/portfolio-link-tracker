# Daily Click Report — Design Spec

**Date:** 2026-04-23  
**Status:** Approved

## Overview

Send a daily email summary of yesterday's link clicks at 9:00 AM Taiwan time (UTC 01:00) via Resend. Uses Vercel Cron Jobs to trigger a protected API route.

## Architecture

### Cron Trigger

Add to `vercel.json`:

```json
{
  "crons": [{ "path": "/api/daily-report", "schedule": "0 1 * * *" }]
}
```

Vercel calls this route once per day at UTC 01:00 (Taiwan 09:00). Vercel automatically injects `Authorization: Bearer <CRON_SECRET>` on all cron invocations — the secret value comes from the `CRON_SECRET` environment variable set in Vercel project settings. Do NOT embed the secret in `vercel.json` (it is committed to git).

### API Route: `src/app/api/daily-report/route.ts`

Must include at top of file:

```ts
export const runtime = 'nodejs'
```

(Required: `createServiceClient()` uses Node.js APIs incompatible with Edge runtime.)

**Request flow:**

1. Read `Authorization` header, compare to `Bearer ${process.env.CRON_SECRET}` → 403 if missing or invalid
2. Compute yesterday's date range in Taiwan timezone (UTC+8):
   - Start: yesterday 00:00:00 Asia/Taipei → UTC ISO string
   - End: today 00:00:00 Asia/Taipei → UTC ISO string (exclusive upper bound)
3. Query via `createServiceClient()` using Supabase JS client:
   ```ts
   // Fetch all views in range with linked company name
   const { data: views } = await supabase
     .from('views')
     .select('link_id, links(company)')
     .gte('created_at', startISO)
     .lt('created_at', endISO)

   // Aggregate in JS — group by company, count clicks
   const counts: Map<string, number> = views.reduce(...)
   ```
4. If total clicks = 0 → return 200, no email sent
5. Build and send email via Resend

### Email Format

- **From:** `Portfolio Tracker <onboarding@resend.dev>` (Resend sandbox — only delivers to verified addresses; acceptable for personal use)
- **To:** `NOTIFICATION_EMAIL`
- **Subject:** `昨日連結點擊摘要 (M/DD)`
- **Body (text):** Company name + click count per link, total at bottom

Example:
```
Google       3 次
Meta         1 次
─────────────────
總計：4 次點擊
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `CRON_SECRET` | Bearer token Vercel injects on cron calls; also set in `.env.local` for local curl testing |

Add to Vercel project settings → Environment Variables. Existing `RESEND_API_KEY` and `NOTIFICATION_EMAIL` are reused.

## Security

- Route checks `Authorization: Bearer <CRON_SECRET>` header → 403 if mismatch
- Vercel automatically injects this header on cron calls (all plans)
- `CRON_SECRET` only exists in Vercel env vars and `.env.local` — never in `vercel.json` or committed to git
- Uses `createServiceClient()` (service role) to read views — bypasses RLS safely server-side

## Error Handling

- DB query failure → return 500, log error
- Resend failure → return 500, log error
- Zero clicks → return 200, skip email silently

## Files Changed

- `vercel.json` — add crons config (create if not exists); path is `/api/daily-report` with no secret
- `src/app/api/daily-report/route.ts` — new API route with `export const runtime = 'nodejs'`
- `.env.example` — document `CRON_SECRET`
- `.env.local` — add `CRON_SECRET` for local curl testing
