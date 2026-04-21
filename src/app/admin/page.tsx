import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkGenerator } from "./link-generator";
import { LinkTable } from "./link-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Portfolio Link Tracker",
};

export default async function AdminPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: links } = await supabase
    .from("links")
    .select("*, views(count)")
    .order("created_at", { ascending: false });

  const defaultUrl =
    process.env.NEXT_PUBLIC_DEFAULT_PORTFOLIO_URL || "https://your-portfolio.com";

  const totalLinks = links?.length ?? 0;
  const totalViews =
    links?.reduce((sum, l) => sum + (l.views?.[0]?.count ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">
              Link Tracker
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="追蹤連結" value={totalLinks} />
          <StatCard label="總瀏覽次數" value={totalViews} />
          <StatCard
            label="登入帳號"
            value={user.email?.split("@")[0] ?? "—"}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Generator */}
        <LinkGenerator defaultUrl={defaultUrl} />

        {/* Table */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            已建立的連結
          </h2>
          <LinkTable links={links ?? []} />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/60 bg-white/70 px-5 py-4 backdrop-blur-sm ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

async function LogoutButton() {
  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
      >
        登出
      </button>
    </form>
  );
}
