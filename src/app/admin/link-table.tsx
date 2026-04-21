"use client";

import { deleteLink } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <p className="text-center text-muted-foreground py-8">
        還沒有建立任何追蹤連結。
      </p>
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>公司</TableHead>
            <TableHead>專屬連結</TableHead>
            <TableHead className="text-center">瀏覽次數</TableHead>
            <TableHead>建立時間</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => {
            const viewCount = link.views?.[0]?.count ?? 0;
            const trackingUrl = `${baseUrl}/p/${link.slug}`;
            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.company}</TableCell>
                <TableCell>
                  <code
                    className="cursor-pointer truncate text-xs hover:underline"
                    onClick={() => {
                      navigator.clipboard.writeText(trackingUrl);
                      toast.success("已複製");
                    }}
                    title="點擊複製"
                  >
                    /p/{link.slug}
                  </code>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={viewCount > 0 ? "default" : "secondary"}>
                    {viewCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(link.created_at).toLocaleDateString("zh-TW", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(link.id, link.company)}
                  >
                    刪除
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
