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
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  const courseCount = user?.my_courses?.length ?? 0;
  const atLimit = courseCount >= 3;

  if (atLimit) {
    return (
      <div className="py-8 max-w-2xl mx-auto w-full px-4">
        <Link
          href="/courses"
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Courses
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Red gradient header */}
          <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 flex items-center justify-center mb-6">
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
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-600/20 text-center"
              >
                Manage My Courses
              </Link>
              <Link
                href="/courses"
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-center"
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
    <div className="py-8 max-w-2xl mx-auto w-full px-4">
      <Link 
        href="/courses" 
        className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Courses
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create New Course</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Fill in the details below to publish your new course.</p>

          {/* Lesson frequency notice */}
          <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50 rounded-xl px-4 py-3 mb-8">
            <Info size={18} className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
              <span className="font-semibold">Keep your students engaged!</span> Once your course is live, you are expected to publish{" "}
              <span className="font-semibold">at least 2 lessons per week</span> to maintain a consistent learning pace.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-6">
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
                className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950"
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
                className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 resize-none"
                placeholder="What will students learn in this course?"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed active:scale-[0.98]"
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
