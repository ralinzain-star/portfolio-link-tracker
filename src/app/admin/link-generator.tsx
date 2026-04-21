"use client";

import { useState } from "react";
import { createLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="rounded-2xl border border-gray-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-gray-900">Generate Link</h2>
      <p className="mt-1 text-sm text-gray-500">
        Enter a company or recruiter name to create a trackable portfolio link.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="company"
              className="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Company / Recruiter
            </Label>
            <Input
              id="company"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-200 bg-gray-50/80 px-4 transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="originalUrl"
              className="text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Portfolio URL
            </Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://your-portfolio.com"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-200 bg-gray-50/80 px-4 transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 font-semibold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
        >
          {loading ? "Generating..." : "Generate Tracking Link"}
        </Button>
      </form>

      {generatedUrl && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-700">
            Your tracking link is ready:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm">
              {generatedUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedUrl);
                toast.success("Copied to clipboard");
              }}
              className="shrink-0 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
