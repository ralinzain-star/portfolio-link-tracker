import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Portfolio Link Tracker
      </h1>
      <p className="max-w-md text-muted-foreground">
        為每家目標公司或 HR 生成專屬作品集連結，追蹤誰打開了你的作品集、什麼時候打開的。
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          進入管理後台
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          登入
        </Link>
      </div>
    </div>
  );
}
