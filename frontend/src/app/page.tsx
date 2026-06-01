"use client";

import Link from "next/link";
import { BookOpen, Users, Star } from "lucide-react";
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

      {/* Features Overview */}
      <section className="grid md:grid-cols-3 gap-8 pt-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all">
          <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
            <BookOpen size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Diverse Courses</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Explore hundreds of courses covering programming, design, business, and more, all created by passionate individuals.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-xl dark:hover:shadow-emerald-500/10 transition-all">
          <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <Users size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Become a Creator</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Submit an application to start teaching. Share your expertise and build an audience on Studico.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-xl dark:hover:shadow-amber-500/10 transition-all">
          <div className="h-14 w-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
            <Star size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-3">Learn at your Pace</h3>
          <p className="text-slate-600 dark:text-slate-400">
            Access materials, lessons, and assignments anytime. Study exactly when and how you want.
          </p>
        </div>
      </section>
    </div>
  );
}
