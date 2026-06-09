"use client";

import { useState, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, BookOpen, Zap, Users } from "lucide-react";

const PERKS = [
  { icon: BookOpen, text: "Access 100+ community courses" },
  { icon: Users, text: "Join live classrooms with peers" },
  { icon: Zap, text: "Learn at your own pace, for free" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/token/", { username, password });
      await login(res.data.access, res.data.refresh);
      router.push("/courses");
    } catch (err: any) {
      if (err.rateLimitMessage) {
        setError(err.rateLimitMessage);
      } else {
        setError(
          err.response?.data?.detail ||
            (err.response ? JSON.stringify(err.response.data) : err.message) ||
            "Failed to login. Please check your credentials."
        );
      }
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/65 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/50 lg:grid-cols-[0.9fr_1.1fr]">
      {/* ── Left branding panel ── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 lg:flex lg:flex-col lg:justify-between">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[280px] h-[280px] bg-purple-400/20 rounded-full blur-2xl animate-float-delayed" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black text-white">
            Studico
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white leading-tight">
              Welcome back to
              <br />
              your learning hub.
            </h2>
            <p className="text-indigo-200 text-lg">
              Pick up right where you left off.
            </p>
          </div>

          <div className="space-y-4">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <p.icon size={18} className="text-white" />
                </div>
                <span className="text-white/90 font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-indigo-200 text-sm italic">
            &ldquo;The best investment you can make is in yourself.&rdquo;
          </p>
          <p className="text-indigo-300 text-xs mt-1">— Warren Buffett</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div>
            <div className="lg:hidden mb-6">
              <Link href="/" className="text-2xl font-black gradient-text-static">
                Studico
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
              Sign in to your account
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <span className="mt-0.5">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-base"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
