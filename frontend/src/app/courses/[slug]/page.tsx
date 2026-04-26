"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";

interface CourseDetail {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

export default function CourseDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchCourse = async () => {
      try {
        const res = await axiosInstance.get(`/courses/${slug}/`);
        setCourse(res.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Course not found.");
        } else {
          setError("Failed to load course details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-8 rounded-3xl text-center max-w-lg mx-auto">
          <h3 className="font-bold text-xl mb-2">Oops!</h3>
          <p>{error || "Course not found"}</p>
          <Link href="/courses" className="mt-6 inline-block bg-white text-red-600 px-6 py-2 rounded-xl font-semibold border border-red-200 hover:bg-red-50 transition">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(course.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="py-8 max-w-4xl mx-auto w-full">
      <Link 
        href="/courses" 
        className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Courses
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Header Hero */}
        <div className="h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 sm:p-12 flex flex-col justify-end relative">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <BookOpen size={120} className="text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-md">
              {course.name}
            </h1>
            <div className="flex flex-wrap items-center text-indigo-100 gap-4 sm:gap-8 font-medium">
              <div className="flex items-center bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <User size={18} className="mr-2" />
                {course.user?.first_name && course.user?.last_name 
                  ? `${course.user.first_name} ${course.user.last_name}`
                  : course.user?.username || 'Unknown'}
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                Published {formattedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 bg-white dark:bg-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">About this course</h2>
          <div className="prose prose-lg prose-indigo max-w-none text-slate-600 dark:text-slate-300">
            {course.description ? (
              <p className="whitespace-pre-line leading-relaxed">
                {course.description}
              </p>
            ) : (
              <p className="italic text-slate-400 dark:text-slate-500">
                No description provided for this course.
              </p>
            )}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-center">
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all text-lg w-full sm:w-auto">
              Enroll in Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
