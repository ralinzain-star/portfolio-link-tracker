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
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/50 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-400"
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
        <p className="text-sm text-gray-500">還沒有建立任何追蹤連結</p>
        <p className="mt-1 text-xs text-gray-400">
          在上方輸入公司名稱來生成第一個
        </p>
      </div>
    );
  }

  async function handleDelete(id: string, company: string) {
    if (!confirm(`確定要刪除 ${company} 的連結嗎？`)) return;
    const result = await deleteLink(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("已刪除");
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
            className="flex items-center gap-4 rounded-2xl border border-gray-200/60 bg-white/70 px-5 py-4 backdrop-blur-sm transition hover:shadow-sm"
          >
            {/* Company + slug */}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{link.company}</p>
              <p
                className="mt-0.5 cursor-pointer truncate text-xs text-gray-400 transition hover:text-blue-500"
                onClick={() => {
                  navigator.clipboard.writeText(trackingUrl);
                  toast.success("已複製");
                }}
                title="點擊複製"
              >
                {trackingUrl}
              </p>
            </div>

            {/* View count */}
            <div className="text-center">
              <span
                className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1 text-sm font-bold ${
                  viewCount > 0
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {viewCount}
              </span>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                views
              </p>
            </div>

            {/* Date */}
            <div className="hidden text-right text-xs text-gray-400 sm:block">
              {new Date(link.created_at).toLocaleDateString("zh-TW", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(link.id, link.company)}
              className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
              title="刪除"
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
