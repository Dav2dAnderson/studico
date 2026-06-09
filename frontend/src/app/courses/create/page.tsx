"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Loader2, ArrowLeft, Info, LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user && !user.is_author) {
      router.push("/courses");
      return;
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/courses/", {
        name,
        description,
      });
      router.push(`/courses/${res.data.slug}`);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.message ||
        "Failed to create course. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  const courseCount = user?.my_courses?.length ?? 0;
  const atLimit = courseCount >= 3;

  if (atLimit) {
    return (
      <div className="w-full max-w-2xl">
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Courses
        </Link>

        <div className="surface-panel overflow-hidden">
          {/* Red gradient header */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="flex flex-col items-center px-8 py-12 text-center sm:px-12">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <LockKeyhole size={36} className="text-red-500 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Course Limit Reached
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-2">
              You have reached the maximum of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">3 courses</span>{" "}
              allowed per instructor.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">
              You currently have{" "}
              <span className="font-semibold text-red-500">{courseCount} / 3</span>{" "}
              courses.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/profile"
                className="rounded-2xl bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Manage My Courses
              </Link>
              <Link
                href="/courses"
                className="rounded-2xl bg-slate-100 px-6 py-3 text-center font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <Link 
        href="/courses" 
        className="mb-8 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Courses
      </Link>

      <div className="surface-panel overflow-hidden">
        <div className="px-8 py-12 sm:px-12">
          <h1 className="mb-2 text-3xl font-bold text-slate-950 dark:text-slate-100">Create New Course</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Fill in the details below to publish your new course.</p>

          {/* Lesson frequency notice */}
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 px-4 py-3 dark:border-indigo-700/50 dark:bg-indigo-900/20">
            <Info size={18} className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
              <span className="font-semibold">Keep your students engaged!</span> Once your course is live, you are expected to publish{" "}
              <span className="font-semibold">at least 2 lessons per week</span> to maintain a consistent learning pace.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base"
                placeholder="e.g. Advanced React Patterns"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="input-base min-h-40 resize-none"
                placeholder="What will students learn in this course?"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-2xl bg-indigo-600 px-4 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6 text-white" />
                ) : (
                  "Publish Course"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
