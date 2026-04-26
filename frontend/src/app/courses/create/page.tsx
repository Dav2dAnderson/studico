"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { Loader2, ArrowLeft } from "lucide-react";
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

  return (
    <div className="py-8 max-w-2xl mx-auto w-full">
      <Link 
        href="/courses" 
        className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Courses
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Course</h1>
          <p className="text-slate-500 mb-8">Fill in the details below to publish your new course.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Course Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                placeholder="e.g. Advanced React Patterns"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm bg-slate-50 focus:bg-white"
                placeholder="What will students learn in this course?"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/20 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
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
