"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-16 pb-12 transition-colors">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          Where ambition <span className="text-indigo-600 dark:text-indigo-400">meets education.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Studico is a community-driven learning platform where knowledge is shared freely. Discover new skills or create your own courses.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/courses" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition active:scale-95">
            Explore Courses
          </Link>
          {!user ? (
            <Link href="/auth/register" className="px-8 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 rounded-lg font-semibold hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition active:scale-95">
              Join the Community
            </Link>
          ) : (
            <Link href="/profile" className="px-8 py-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 rounded-lg font-semibold hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition active:scale-95">
              My Profile
            </Link>
          )}
        </div>
      </section>


    </div>
  );
}
