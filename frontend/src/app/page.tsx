"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  BookOpen,
  ArrowRight,
  Shield,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Expert-led Courses",
    description:
      "Learn from passionate community members who share real-world knowledge and hands-on expertise.",
    color: "indigo",
    gradient: "from-indigo-500 to-indigo-700",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-100 dark:border-indigo-900/60",
  },
  {
    icon: Users,
    title: "Live Classrooms",
    description:
      "Join interactive classrooms, collaborate with peers, and get support from instructors in real time.",
    color: "purple",
    gradient: "from-purple-500 to-purple-700",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-100 dark:border-purple-900/60",
  },
  {
    icon: Shield,
    title: "Open Community",
    description:
      "Every course is created by community members — no gatekeeping, just sharing knowledge openly.",
    color: "sky",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-100 dark:border-sky-900/60",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-16 sm:gap-24 overflow-hidden">
      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-5%] left-[-5%] w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[220px] h-[220px] sm:w-[400px] sm:h-[400px] bg-purple-400/20 dark:bg-purple-600/15 rounded-full blur-[100px] animate-float-delayed" />
          <div className="absolute top-[40%] left-[45%] w-[160px] h-[160px] sm:w-[300px] sm:h-[300px] bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-[80px] animate-float" />
          {/* grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl py-12 sm:py-16 lg:py-24 px-4">
          <div className="surface-panel px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 text-center">
            <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 backdrop-blur-sm dark:border-indigo-800/60 dark:bg-indigo-950/55 dark:text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                </span>
                Community-powered learning platform
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl">
                Where ambition{" "}
                <span className="gradient-text">meets education.</span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto max-w-3xl text-base font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl lg:text-2xl">
                Studico is a community-driven platform where knowledge is shared
                openly. Discover new skills or create your own courses without
                friction.
              </p>

              {/* CTAs */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-5 pt-4">
                <Link
                  href="/courses"
                  id="hero-explore-btn"
                  className="group btn-primary gap-2 rounded-2xl px-8 py-4 sm:px-10 sm:py-4.5 text-base sm:text-lg font-bold shadow-2xl shadow-indigo-700/40 hover:shadow-indigo-700/50 w-full sm:w-auto"
                >
                  Explore Courses
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                {!user ? (
                  <Link
                    href="/auth/register"
                    id="hero-join-btn"
                    className="btn-secondary rounded-2xl px-8 py-4 sm:px-10 sm:py-4.5 text-base sm:text-lg w-full sm:w-auto"
                  >
                    Join Now — It&apos;s Free
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    id="hero-profile-btn"
                    className="btn-secondary rounded-2xl px-8 py-4 sm:px-10 sm:py-4.5 text-base sm:text-lg w-full sm:w-auto"
                  >
                    My Dashboard
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section className="relative px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-12 space-y-4 text-center">
            <span className="page-eyebrow">
              Why Studico?
            </span>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Everything you need to{" "}
              <span className="gradient-text-static">learn & grow</span>
            </h2>
            <p className="page-subtitle mx-auto max-w-2xl">
              Built by learners, for learners. A platform that puts you first,
              every step of the way.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`group relative rounded-[1.75rem] border p-7 ${f.bg} ${f.border} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-black/30`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                >
                  <f.icon size={26} className="text-white" />
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {f.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA BANNER ─────────────────────── */}
      <section className="relative overflow-hidden px-4">
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="relative rounded-[1.25rem] sm:rounded-[2.25rem] overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 px-5 py-12 sm:py-20 text-center sm:px-10">
              <h2 className="text-3xl font-black leading-tight text-white sm:text-5xl">
                Ready to start your{" "}
                <span className="text-indigo-100">learning journey?</span>
              </h2>
              <p className="mx-auto max-w-2xl text-base sm:text-xl text-indigo-100">
                Join thousands of learners and educators on Studico and get
                started right away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? "/courses" : "/auth/register"}
                  id="cta-main-btn"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-4.5 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl shadow-black/20 hover:-translate-y-0.5 text-base sm:text-lg active:scale-[0.98] w-full sm:w-auto"
                >
                  {user ? "Go to Courses" : "Get Started — Free"}
                  <ArrowRight size={20} />
                </Link>
                {!user && (
                  <Link
                    href="/auth/login"
                  id="cta-login-btn"
                  className="inline-flex items-center justify-center px-8 py-4 sm:px-10 sm:py-4.5 border-2 border-white/40 text-white font-medium rounded-2xl hover:border-white/70 hover:bg-white/10 transition-all text-base sm:text-lg w-full sm:w-auto"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
