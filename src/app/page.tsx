import Link from "next/link";

export default function Home() {
  return (
    <div className="glass-page relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 w-full max-w-lg px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
          Portfolio Link Tracker
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-white/70">
          為每家目標公司或 HR 生成專屬作品集連結，
          <br />
          追蹤誰打開了你的作品集。
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/admin"
            className="rounded-xl border border-white/30 bg-white/25 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/35 hover:shadow-xl"
          >
            進入管理後台
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
          >
            登入
          </Link>
        </div>
      </div>
    </div>
  );
}
