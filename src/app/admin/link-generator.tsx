"use client";

import { useState } from "react";
import { createLink } from "./actions";
import { toast } from "sonner";

export function LinkGenerator({ defaultUrl }: { defaultUrl: string }) {
  const [company, setCompany] = useState("");
  const [originalUrl, setOriginalUrl] = useState(defaultUrl);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGeneratedUrl("");

    const fd = new FormData();
    fd.append("company", company);
    fd.append("originalUrl", originalUrl);

    const result = await createLink(fd);

    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setGeneratedUrl(result.url);
      toast.success(`Tracking link created for ${company}`);
      setCompany("");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/10 backdrop-blur-2xl">
      <h2 className="text-lg font-semibold text-white">Generate Link</h2>
      <p className="mt-1 text-sm text-white/50">
        Enter a company or recruiter name to create a trackable portfolio link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="company"
              className="text-xs font-semibold uppercase tracking-wider text-white/50"
            >
              Company / Recruiter
            </label>
            <input
              id="company"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/30 backdrop-blur-md transition focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="originalUrl"
              className="text-xs font-semibold uppercase tracking-wider text-white/50"
            >
              Portfolio URL
            </label>
            <input
              id="originalUrl"
              type="url"
              placeholder="https://your-portfolio.com"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder-white/30 backdrop-blur-md transition focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl border border-white/30 bg-white/25 px-6 font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:bg-white/35 hover:shadow-xl disabled:opacity-40 disabled:hover:bg-white/25"
        >
          {loading ? "Generating..." : "Generate Tracking Link"}
        </button>
      </form>

      {generatedUrl && (
        <div className="mt-6 rounded-xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
          <p className="mb-2 text-sm font-medium text-white/80">
            Your tracking link is ready:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-black/20 px-4 py-2.5 text-sm text-white">
              {generatedUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl);
                toast.success("Copied to clipboard");
              }}
              className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
