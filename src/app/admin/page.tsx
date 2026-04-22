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
    <div className="glass-page relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="fixed inset-0 bg-black/20" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/15">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-white">Link Tracker</span>
          <LogoutButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Tracking Links" value={totalLinks} />
          <StatCard label="Total Views" value={totalViews} />
          <StatCard
            label="Account"
            value={user.email?.split("@")[0] ?? "—"}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Generator */}
        <LinkGenerator defaultUrl={defaultUrl} />

        {/* Table */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Your Links</h2>
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
      className={`rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-2xl ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
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
        className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
      >
        Sign Out
      </button>
    </form>
  );
}
