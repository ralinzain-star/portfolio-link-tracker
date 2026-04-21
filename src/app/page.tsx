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

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/25 bg-white/10 px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Portfolio Link Tracker
          </h1>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-white/60">
            Generate unique tracking links for every company,
            <br />
            know exactly who viewed your portfolio.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-white/30 bg-white/25 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:bg-white/35 hover:shadow-xl"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
