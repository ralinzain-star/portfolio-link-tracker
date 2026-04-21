"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

const COOLDOWN_SECONDS = 20;

export function LoginForm({
  supabaseUrl,
  supabaseAnonKey,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (cooldown > 0) return;
      setLoading(true);
      setError("");

      const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
        setCooldown(COOLDOWN_SECONDS);
      }
      setLoading(false);
    },
    [email, cooldown, supabaseUrl, supabaseAnonKey]
  );

  return (
    <div className="glass-page relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/25 bg-white/10 px-8 py-10 shadow-2xl shadow-black/20 backdrop-blur-2xl">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-sm">
              <svg
                className="h-7 w-7 text-white"
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

          {sent ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                檢查你的信箱
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                我們已寄送登入連結到
                <br />
                <strong className="text-white">{email}</strong>
              </p>
              <p className="mt-4 text-xs text-white/40">
                點擊信件中的連結即可登入管理後台
              </p>

              {cooldown > 0 ? (
                <button
                  disabled
                  className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/40"
                >
                  {cooldown} 秒後可重新發送
                </button>
              ) : (
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 w-full rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/20"
                >
                  重新發送
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-center text-2xl font-bold text-white">
                Portfolio Link Tracker
              </h1>
              <p className="mt-2 text-center text-sm text-white/60">
                輸入你的 Email 登入管理後台
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-white/50"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-white/30 outline-none backdrop-blur-sm transition focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                  />
                </div>
                {error && (
                  <p className="rounded-lg border border-red-400/30 bg-red-500/20 px-3 py-2 text-sm text-red-200">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-base font-semibold text-white shadow-lg shadow-orange-900/30 backdrop-blur-sm transition-all hover:from-amber-400/90 hover:to-orange-400/90 hover:shadow-xl disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:shadow-none"
                >
                  {loading
                    ? "寄送中..."
                    : cooldown > 0
                      ? `${cooldown} 秒後可重新發送`
                      : "寄送 Magic Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
