import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  // 1. Find link by slug
  const { data: link, error } = await supabase
    .from("links")
    .select("id, original_url, company")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    return new NextResponse("Link not found", { status: 404 });
  }

  // 2. Record the view
  const userAgent = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || "";
  const forwarded = request.headers.get("x-forwarded-for") || "unknown";
  const ipHash = await hashIP(forwarded);

  await supabase.from("views").insert({
    link_id: link.id,
    user_agent: userAgent,
    referrer,
    ip_hash: ipHash,
  });

  // 3. (Optional) Send email notification via Resend
  if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
    sendNotification(link.company, slug).catch(() => {
      // Fire-and-forget: don't block the redirect
    });
  }

  // 4. 302 redirect to original portfolio
  return NextResponse.redirect(link.original_url, 302);
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || "salt"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

async function sendNotification(company: string, slug: string) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Portfolio Tracker <onboarding@resend.dev>",
    to: process.env.NOTIFICATION_EMAIL!,
    subject: `🔔 ${company} 剛打開了你的作品集`,
    html: `
      <h2>${company} 剛剛打開了你的作品集！</h2>
      <p>追蹤連結：<code>/p/${slug}</code></p>
      <p>時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</p>
    `,
  });
}
