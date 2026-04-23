# Daily Click Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send a daily email summary of yesterday's link clicks at 9 AM Taiwan time via Vercel Cron + Resend.

**Architecture:** A new API route `/api/daily-report` is triggered daily by Vercel Cron. It validates a Bearer token, queries yesterday's views grouped by company, and emails a summary via Resend. Zero-click days are silently skipped.

**Tech Stack:** Next.js 16 (nodejs runtime), Supabase JS client (service role), Resend v6, Vercel Cron Jobs

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `vercel.json` | Create | Cron schedule config |
| `src/app/api/daily-report/route.ts` | Create | Auth check, DB query, email send |
| `.env.example` | Modify | Document `CRON_SECRET` |
| `.env.local` | Modify | Add `CRON_SECRET` value for local testing |

> **Note:** No test runner is configured in this project. Testing is done via `curl` against the local dev server.

---

## Task 1: Add Vercel Cron Config

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

```json
{
  "crons": [
    {
      "path": "/api/daily-report",
      "schedule": "0 1 * * *"
    }
  ]
}
```

`0 1 * * *` = UTC 01:00 = Taiwan 09:00 every day.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add vercel cron for daily report"
```

---

## Task 2: Implement the API Route

**Files:**
- Create: `src/app/api/daily-report/route.ts`

- [ ] **Step 1: Create the route file**

```ts
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // 1. Auth check
  const auth = request.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 403 })
  }

  // 2. Compute yesterday's range in Taiwan timezone (UTC+8)
  // Use Intl to get the current Taiwan calendar date, then construct UTC instants
  const now = new Date()
  const taiwanDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' }) // "YYYY-MM-DD"
  const todayMidnightTaiwan = new Date(`${taiwanDateStr}T00:00:00+08:00`)
  const yesterdayMidnightTaiwan = new Date(todayMidnightTaiwan.getTime() - 24 * 60 * 60 * 1000)

  const startISO = yesterdayMidnightTaiwan.toISOString()
  const endISO = todayMidnightTaiwan.toISOString()

  // 3. Query views in range
  const supabase = createServiceClient()
  const { data: views, error } = await supabase
    .from('views')
    .select('link_id, links(company)')
    .gte('created_at', startISO)
    .lt('created_at', endISO)

  if (error) {
    console.error('[daily-report] DB error:', error)
    return new NextResponse('DB error', { status: 500 })
  }

  // 4. Aggregate by company
  const counts = new Map<string, number>()
  for (const view of views ?? []) {
    const company = (view.links as { company: string } | null)?.company ?? 'Unknown'
    counts.set(company, (counts.get(company) ?? 0) + 1)
  }

  const total = [...counts.values()].reduce((a, b) => a + b, 0)

  // 5. Skip if no clicks
  if (total === 0) {
    return NextResponse.json({ sent: false, reason: 'no clicks' })
  }

  // 6. Build email body
  const dateStr = yesterdayMidnightTaiwan.toLocaleDateString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Taipei',
  })

  const rows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([company, count]) => `${company.padEnd(16)} ${count} 次`)
    .join('\n')

  const body = `${rows}\n${'─'.repeat(22)}\n總計：${total} 次點擊`

  // 7. Send email
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFICATION_EMAIL) {
    return NextResponse.json({ sent: false, reason: 'missing env vars' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error: emailError } = await resend.emails.send({
    from: 'Portfolio Tracker <onboarding@resend.dev>',
    to: process.env.NOTIFICATION_EMAIL,
    subject: `昨日連結點擊摘要 (${dateStr})`,
    text: body,
  })

  if (emailError) {
    console.error('[daily-report] Resend error:', emailError)
    return new NextResponse('Email error', { status: 500 })
  }

  return NextResponse.json({ sent: true, total })
}
```

- [ ] **Step 2: Start the dev server (if not running)**

```bash
npm run dev
```

- [ ] **Step 3: Test auth rejection**

```bash
curl -s http://localhost:3000/api/daily-report
# Expected: Unauthorized (403)
```

- [ ] **Step 4: Test with correct secret**

```bash
# Replace <value> with the CRON_SECRET you set in .env.local
curl -s -H "Authorization: Bearer <value>" http://localhost:3000/api/daily-report
# Expected: {"sent":false,"reason":"no clicks"} or {"sent":true,"total":N}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/daily-report/route.ts
git commit -m "feat: add daily click report API route"
```

---

## Task 3: Update Environment Files

**Files:**
- Modify: `.env.example`
- Modify: `.env.local`

- [ ] **Step 1: Add CRON_SECRET to .env.example**

Append to the end of `.env.example`:

```
# Daily report cron — set in Vercel env vars; add locally for curl testing
CRON_SECRET=your-secret-here
```

- [ ] **Step 2: Add CRON_SECRET to .env.local**

Append to `.env.local` (any strong random string works locally):

```
CRON_SECRET=local-dev-secret
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: document CRON_SECRET env var"
```

> `.env.local` is gitignored — do not stage it.

---

## Task 4: Deploy and Configure Vercel

- [ ] **Step 1: Push to Vercel**

```bash
git push origin main
```

- [ ] **Step 2: Add CRON_SECRET in Vercel dashboard**

Go to: Vercel project → Settings → Environment Variables → Add:
- Name: `CRON_SECRET`
- Value: a strong random string (e.g. `openssl rand -base64 32`)
- Environment: Production

- [ ] **Step 3: Verify cron appears in Vercel dashboard**

Go to: Vercel project → Settings → Cron Jobs
Confirm `/api/daily-report` at `0 1 * * *` is listed.

- [ ] **Step 4: Manually trigger via Vercel dashboard (optional smoke test)**

Click "Run" next to the cron entry. Check Vercel function logs for `[daily-report]` output.
