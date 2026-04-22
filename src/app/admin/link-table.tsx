"use client";

import { deleteLink } from "./actions";
import { toast } from "sonner";

interface Link {
  id: string;
  slug: string;
  company: string;
  original_url: string;
  created_at: string;
  views: { count: number }[];
}

export function LinkTable({ links }: { links: Link[] }) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";

  if (links.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 py-16 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <svg
            className="h-6 w-6 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
        </div>
        <p className="text-sm text-white/50">No tracking links yet</p>
        <p className="mt-1 text-xs text-white/30">Create your first one above</p>
      </div>
    );
  }

  async function handleDelete(id: string, company: string) {
    if (!confirm(`Delete the link for ${company}?`)) return;
    const result = await deleteLink(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Deleted");
    }
  }

  return (
    <div className="space-y-3">
      {links.map((link) => {
        const viewCount = link.views?.[0]?.count ?? 0;
        const trackingUrl = `${baseUrl}/p/${link.slug}`;
        return (
          <div
            key={link.id}
            className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-2xl transition hover:bg-white/15"
          >
            {/* Company + slug */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{link.company}</p>
              <p
                className="mt-0.5 cursor-pointer truncate text-xs text-white/40 transition hover:text-white/70"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  toast.success("Copied");
                }}
                title="Click to copy"
              >
                {trackingUrl}
              </p>
            </div>

            {/* View count */}
            <div className="text-center">
              <span
                className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1 text-sm font-bold ${
                  viewCount > 0
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {viewCount}
              </span>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
                views
              </p>
            </div>

            {/* Date */}
            <div className="hidden text-right text-xs text-white/40 sm:block">
              {new Date(link.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(link.id, link.company)}
              className="rounded-lg p-2 text-white/20 transition hover:bg-white/10 hover:text-red-400"
              title="Delete"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
