import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
      <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-lg px-4 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white">
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
            className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            進入管理後台
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
          >
            登入
          </Link>
        </div>
      </div>
    </div>
  );
}
