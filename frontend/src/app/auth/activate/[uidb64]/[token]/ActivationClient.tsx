"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import {
  CheckCircle2,
  Loader2,
  TriangleAlert,
  ArrowRight,
  MailOpen,
} from "lucide-react";

type ActivationState = "loading" | "success" | "error";

export default function ActivationClient({
  uidb64,
  token,
}: {
  uidb64: string;
  token: string;
}) {
  const [status, setStatus] = useState<ActivationState>("loading");
  const [message, setMessage] = useState("Activating your account...");

  useEffect(() => {
    let isMounted = true;

    const activate = async () => {
      try {
        const res = await axiosInstance.get(
          `/user_control/activate/${uidb64}/${token}/`
        );

        if (!isMounted) return;
        setStatus("success");
        setMessage(res.data?.message || "Your account has been activated.");
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "We could not verify this link. It may have expired."
        );
      }
    };

    if (uidb64 && token) {
      activate();
    }

    return () => {
      isMounted = false;
    };
  }, [uidb64, token]);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/65 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/50 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-900 to-purple-800 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] h-[340px] w-[340px] rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[260px] w-[260px] rounded-full bg-indigo-400/20 blur-2xl animate-float-delayed" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              <MailOpen size={16} />
              Account activation
            </div>
            <h1 className="text-4xl font-black leading-tight text-white">
              Your email link is being checked right now.
            </h1>
            <p className="text-lg text-indigo-100">
              We&apos;ll confirm your account and send you to sign in as soon as
              the link is valid.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-sm italic text-indigo-100">
            &ldquo;Verification keeps accounts secure and reliable.&rdquo;
          </p>
          <p className="mt-1 text-xs text-indigo-200">
            You only need to do this once.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {status === "loading" ? (
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            ) : (
              <TriangleAlert className="h-8 w-8 text-red-600" />
            )}
          </div>

          <div className="space-y-3">
            <p className="page-eyebrow text-center">Email verification</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
              {status === "success"
                ? "Account activated"
                : status === "error"
                ? "Activation failed"
                : "Verifying link"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">{message}</p>
          </div>

          <div
            className={`rounded-2xl px-4 py-4 text-sm ${
              status === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : status === "error"
                ? "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300"
            }`}
          >
            {status === "success"
              ? "You can now sign in with your username and password."
              : status === "error"
              ? "If the link expired, register again or contact support."
              : "Please wait while we validate the activation token."}
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98]"
            >
              Go to sign in
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-bold text-slate-700 transition-all hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
