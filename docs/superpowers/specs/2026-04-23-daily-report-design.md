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

Vercel calls this route once per day at UTC 01:00 (Taiwan 09:00).

### API Route: `src/app/api/daily-report/route.ts`

Runtime: `nodejs` (not Edge — needed for Supabase service client).

**Request flow:**

1. Verify `Authorization: Bearer <CRON_SECRET>` header → 403 if missing or invalid
2. Compute yesterday's date range in Taiwan timezone (UTC+8):
   - Start: yesterday 00:00:00 Asia/Taipei → UTC
   - End: yesterday 23:59:59 Asia/Taipei → UTC
3. Query via `createServiceClient()`:
   ```sql
   SELECT links.company, COUNT(views.id) as click_count
   FROM views
   JOIN links ON views.link_id = links.id
   WHERE views.created_at >= :start AND views.created_at < :end
   GROUP BY links.company
   ORDER BY click_count DESC
   ```
4. If total clicks = 0 → return 200, no email sent
5. Build and send email via Resend

### Email Format

- **From:** `Portfolio Tracker <onboarding@resend.dev>`
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
| `CRON_SECRET` | Bearer token to authenticate Vercel Cron calls |

Existing `RESEND_API_KEY` and `NOTIFICATION_EMAIL` are reused.

## Security

- Route rejects any request without a valid `Authorization: Bearer <CRON_SECRET>` header
- `CRON_SECRET` is set in Vercel environment variables (not committed to git)
- Uses `createServiceClient()` (service role) to read views — no RLS issues

## Error Handling

- DB query failure → return 500, log error
- Resend failure → return 500, log error
- Zero clicks → return 200, skip email silently

## Files Changed

- `vercel.json` — add crons config (create if not exists)
- `src/app/api/daily-report/route.ts` — new API route
- `.env.example` — document `CRON_SECRET`
