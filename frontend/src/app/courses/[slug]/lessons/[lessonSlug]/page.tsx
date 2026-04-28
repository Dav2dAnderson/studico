"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

interface LessonDetail {
  id: number;
  title: string;
  content: string;
  created_at: string;
  course: {
    name: string;
    slug: string;
  };
}

export default function LessonDetail() {
  const { slug, lessonSlug } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || !lessonSlug) return;

    const fetchLesson = async () => {
      try {
        const res = await axiosInstance.get(`/courses/${slug}/lessons/${lessonSlug}/`);
        setLesson(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("You must be enrolled in this course to view this lesson.");
        } else if (err.response?.status === 404) {
          setError("Lesson not found.");
        } else {
          setError("Failed to load lesson content.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [slug, lessonSlug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="py-12 max-w-lg mx-auto px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-8 rounded-3xl text-center">
          <h3 className="font-bold text-xl mb-2">Access Denied</h3>
          <p>{error || "Lesson not found"}</p>
          <Link href={`/courses/${slug}`} className="mt-6 inline-block bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 px-6 py-2 rounded-xl font-semibold border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-slate-700 transition">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto w-full px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <Link 
          href={`/courses/${slug}`}
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Curriculum
        </Link>
        <div className="text-sm text-slate-400 font-medium flex items-center">
          <Clock size={16} className="mr-2" />
          Lesson Published: {new Date(lesson.created_at).toLocaleDateString()}
        </div>
      </div>

      <article className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 sm:p-12 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-2">
            <BookOpen size={16} />
            {lesson.course.name}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            {lesson.title}
          </h1>
        </div>

        <div className="p-8 sm:p-12">
          <div 
            className="prose prose-lg prose-indigo dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: lesson.content || '<p class="italic text-slate-400">This lesson has no content yet.</p>' }}
          />
        </div>
      </article>
    </div>
  );
}
