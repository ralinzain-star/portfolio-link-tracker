"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjAzIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHYyaC0ydjRoLTJ2MmgtMnYyaDJ2LTJoMnYyaDJ2LTJoMnYtMmgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {/* Floating shapes */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
      <div className="absolute top-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/20 bg-white/90 px-8 py-10 shadow-2xl shadow-black/10 backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
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
              <h1 className="text-2xl font-bold text-gray-900">
                檢查你的信箱
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                我們已寄送登入連結到
                <br />
                <strong className="text-gray-900">{email}</strong>
              </p>
              <p className="mt-4 text-xs text-gray-400">
                點擊信件中的連結即可登入管理後台
              </p>

              {cooldown > 0 ? (
                <button
                  disabled
                  className="mt-6 w-full rounded-xl bg-gray-100 px-6 py-3 text-sm font-medium text-gray-400"
                >
                  {cooldown} 秒後可重新發送
                </button>
              ) : (
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 w-full rounded-xl bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
                >
                  重新發送
                </button>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-center text-2xl font-bold text-gray-900">
                Portfolio Link Tracker
              </h1>
              <p className="mt-2 text-center text-sm text-gray-500">
                輸入你的 Email 登入管理後台
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-gray-200 bg-gray-50/80 px-4 text-base transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-semibold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none"
                >
                  {loading
                    ? "寄送中..."
                    : cooldown > 0
                      ? `${cooldown} 秒後可重新發送`
                      : "寄送 Magic Link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          追蹤誰打開了你的作品集
        </p>
      </div>
    </div>
  );
}
