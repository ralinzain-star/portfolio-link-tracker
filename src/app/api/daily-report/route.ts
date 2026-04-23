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
