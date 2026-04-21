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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Link Tracker
          </h1>
          <p className="mt-1 text-muted-foreground">
            為每家公司 / HR 生成專屬追蹤連結
          </p>
        </div>
        <LogoutButton />
      </div>

      <LinkGenerator defaultUrl={defaultUrl} />

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">已建立的連結</h2>
        <LinkTable links={links ?? []} />
      </div>
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
        className="rounded-md border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        登出
      </button>
    </form>
  );
}
