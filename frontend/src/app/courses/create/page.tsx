"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  Loader2,
  ArrowLeft,
  Info,
  LockKeyhole,
  BookOpen,
  Sparkles,
  Users,
  Clock,
  Tag,
  FileText,
  Check,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { id: "programming", label: "Programming", icon: "💻" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "data", label: "Data & AI", icon: "🤖" },
  { id: "business", label: "Business", icon: "📈" },
  { id: "language", label: "Language", icon: "🌐" },
  { id: "math", label: "Math & Science", icon: "🔬" },
  { id: "other", label: "Other", icon: "✨" },
];

export default function CreateCoursePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setError(
        error.response?.data?.detail ||
          error.message ||
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
      <div className="w-full max-w-2xl animate-fade-up">
        <Link
          href="/courses"
          className="mb-8 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Courses
        </Link>

        <div className="surface-panel overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="flex flex-col items-center px-8 py-12 text-center sm:px-12">
            <div className="mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <LockKeyhole size={36} className="text-red-500 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Course Limit Reached
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-2">
              You have reached the maximum of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                3 courses
              </span>{" "}
              allowed per instructor.
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">
              You currently have{" "}
              <span className="font-semibold text-red-500">
                {courseCount} / 3
              </span>{" "}
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

  const selectedCategory = CATEGORIES.find((c) => c.id === category);
  const nameLen = name.length;
  const descLen = description.length;
  const isFormValid = name.trim().length > 0 && description.trim().length > 0;

  return (
    <div
      className={`w-full max-w-6xl transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Back link */}
      <Link
        href="/courses"
        className="mb-8 inline-flex items-center gap-2 font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 group"
      >
        <ArrowLeft
          size={18}
          className="transition-transform group-hover:-translate-x-1"
        />
        Back to Courses
      </Link>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
        {/* ── LEFT: Form Panel ── */}
        <div className="surface-panel overflow-hidden">
          {/* Gradient header bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="px-8 py-8 sm:px-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="page-eyebrow text-xs">New Course</p>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                  Create Your Course
                </h1>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 ml-[52px]">
              Share your knowledge with learners around the world.
            </p>

            {/* Info banner */}
            <div className="mb-7 flex items-start gap-3 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 px-4 py-3.5 dark:border-indigo-700/50 dark:bg-indigo-900/20">
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400"
              />
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                <span className="font-semibold">Keep students engaged!</span>{" "}
                You are expected to publish{" "}
                <span className="font-semibold">at least 2 lessons per week</span>{" "}
                after publishing your course.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 animate-fade-up">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <FileText size={14} className="text-indigo-500" />
                    Course Name
                    <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-medium tabular-nums ${nameLen > 80 ? "text-red-500" : nameLen > 60 ? "text-amber-500" : "text-slate-400"}`}
                  >
                    {nameLen} / 100
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-base text-base font-medium"
                  placeholder="e.g. Advanced React Patterns"
                />
                {name.trim().length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Check size={11} className="text-green-500" />
                    Looks good!
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Tag size={14} className="text-indigo-500" />
                  Category
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setCategory(category === cat.id ? "" : cat.id)
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 active:scale-95 ${
                        category === cat.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/25"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <BookOpen size={14} className="text-indigo-500" />
                    Description
                    <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-medium tabular-nums ${descLen > 450 ? "text-red-500" : descLen > 350 ? "text-amber-500" : "text-slate-400"}`}
                  >
                    {descLen} / 500
                  </span>
                </div>
                <textarea
                  required
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="input-base resize-none"
                  placeholder="What will students learn? What topics are covered? Who is this course for?"
                />
                {/* Char progress bar */}
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      descLen > 450
                        ? "bg-red-500"
                        : descLen > 350
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min((descLen / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 active:scale-[0.98] overflow-hidden group"
              >
                {/* shimmer on hover */}
                <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Publish Course
                    <ChevronRight size={16} className="ml-auto opacity-60" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Live Preview Panel ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
          {/* Preview card */}
          <div className="surface-panel overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
            <div className="px-6 py-5">
              <p className="page-eyebrow text-xs mb-4">Live Preview</p>

              {/* Course card preview */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/40 overflow-hidden">
                {/* Header gradient */}
                <div className="h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative flex items-end p-4">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
                      {selectedCategory.icon} {selectedCategory.label}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mb-1 min-h-[1.5rem]">
                    {name || (
                      <span className="text-slate-300 dark:text-slate-600 font-normal italic">
                        Your course name...
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 min-h-[2.5rem]">
                    {description || (
                      <span className="italic text-slate-300 dark:text-slate-600">
                        Your course description will appear here...
                      </span>
                    )}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> 0 students
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> 0 lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Just now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="surface-panel px-6 py-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Before you publish
            </p>
            <ul className="space-y-2.5">
              {[
                { label: "Course name added", done: name.trim().length > 0 },
                {
                  label: "Description written",
                  done: description.trim().length >= 20,
                },
                {
                  label: "Category selected",
                  done: category.length > 0,
                  optional: true,
                },
                { label: "Ready to add lessons", done: isFormValid },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      item.done
                        ? "border-green-500 bg-green-500"
                        : "border-slate-300 dark:border-slate-600 bg-transparent"
                    }`}
                  >
                    {item.done && <Check size={11} className="text-white" />}
                  </span>
                  <span
                    className={`${item.done ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"} transition-colors`}
                  >
                    {item.label}
                    {item.optional && (
                      <span className="ml-1 text-xs opacity-60">(optional)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Slot counter */}
          <div className="surface-panel px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Course Slots Used
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {courseCount}{" "}
                <span className="text-slate-300 dark:text-slate-600 font-normal text-lg">
                  / 3
                </span>
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-8 w-2.5 rounded-full transition-all ${
                    i < courseCount
                      ? "bg-indigo-500"
                      : i === courseCount
                        ? "bg-indigo-200 dark:bg-indigo-900/40 animate-pulse"
                        : "bg-slate-100 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
