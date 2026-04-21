"use client";

import { useState } from "react";
import { createLink } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      toast.success(`已為 ${company} 建立追蹤連結`);
      setCompany("");
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>生成專屬連結</CardTitle>
        <CardDescription>
          輸入公司或 HR 名稱，一鍵生成可追蹤的專屬作品集連結。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">公司 / HR 名稱</Label>
              <Input
                id="company"
                placeholder="例如：Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalUrl">原始作品集連結</Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://your-portfolio.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "生成中..." : "生成追蹤連結"}
          </Button>
        </form>

        {generatedUrl && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
            <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">
              專屬連結已生成：
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-white px-3 py-2 text-sm dark:bg-black">
                {generatedUrl}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(generatedUrl);
                  toast.success("已複製到剪貼簿");
                }}
              >
                複製
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
