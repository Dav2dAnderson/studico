"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

type FormState = {
  current_password: string;
  new_password: string;
  password_confirm: string;
};

function extractErrorMessage(error: any) {
  if (error.rateLimitMessage) return error.rateLimitMessage;

  const responseData = error.response?.data;
  if (!responseData) {
    return error.message || "We could not update your password. Please try again.";
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData.detail) {
    return responseData.detail;
  }

  const messages = Object.values(responseData)
    .flat()
    .map((item) => {
      if (typeof item === "string") return item;
      if (Array.isArray(item)) return item.join(" ");
      if (item && typeof item === "object") return Object.values(item).flat().join(" ");
      return "";
    })
    .filter(Boolean);

  return messages.length > 0
    ? messages.join(" ")
    : "We could not update your password. Please try again.";
}

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isSubmitting = useRef(false);
  const [formData, setFormData] = useState<FormState>({
    current_password: "",
    new_password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    isSubmitting.current = true;
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/user_control/change_password/", formData);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "profile_notification",
          "Your password has been updated successfully."
        );
      }
      router.replace("/profile");
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/65 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/50 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-900 to-purple-800 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-8%] right-[-8%] h-[340px] w-[340px] rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-[-10%] left-[-8%] h-[260px] w-[260px] rounded-full bg-indigo-400/20 blur-3xl animate-float-delayed" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black text-white">
            Studico
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p className="page-eyebrow text-white/70">Account security</p>
            <h1 className="text-4xl font-black leading-tight text-white">
              Keep your account secure with a fresh password.
            </h1>
            <p className="text-lg text-indigo-100">
              Update your password anytime without losing your progress.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Your current password is required",
              "Choose a strong new password",
              "Confirm the new password before saving",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <span className="font-medium text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-sm italic text-indigo-100">
            &ldquo;Security is a process, not a product.&rdquo;
          </p>
          <p className="mt-1 text-xs text-indigo-200">- Unknown</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <ArrowLeft size={16} />
              Back to profile
            </Link>
            <div>
              <p className="page-eyebrow mb-2">Security</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                Change password
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Use this form to update the password for @{user.username}.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <span className="mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Current password
              </label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="current_password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.current_password}
                  onChange={handleChange}
                  className="input-base pl-11"
                  placeholder="Enter your current password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                New password
              </label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="new_password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="input-base pl-11"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirm new password
              </label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password_confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="input-base pl-11"
                  placeholder="Repeat the new password"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/profile"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
