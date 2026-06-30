"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, User, Users, Calendar, BookOpen, Check, MessageSquare } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

interface Classroom {
  id: number;
  name: string;
}

interface CourseDetail {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_enrolled: boolean;
  is_author: boolean;
  is_in_classroom: boolean;
  classroom: Classroom | null;
  lessons: Lesson[];
  user: {
    id: number;
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
  const [enrolling, setEnrolling] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joiningClassroom, setJoiningClassroom] = useState(false);

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

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await axiosInstance.post(`/courses/${slug}/enroll/`);
      // Refresh course data to get lessons and updated enrollment status
      const res = await axiosInstance.get(`/courses/${slug}/`);
      setCourse(res.data);
    } catch (_err) {
      alert("Failed to enroll in course.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this course?")) return;
    setLeaving(true);
    try {
      await axiosInstance.post(`/courses/${slug}/leave/`);
      const res = await axiosInstance.get(`/courses/${slug}/`);
      setCourse(res.data);
    } catch (_err) {
      alert("Failed to leave course.");
    } finally {
      setLeaving(false);
    }
  };

  const handleJoinClassroom = async () => {
    setJoiningClassroom(true);
    try {
      await axiosInstance.post(`/courses/${slug}/join_classroom/`);
      const res = await axiosInstance.get(`/courses/${slug}/`);
      setCourse(res.data);
    } catch (_err) {
      alert("Failed to join classroom.");
    } finally {
      setJoiningClassroom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="w-full max-w-4xl py-12">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <div className="surface-panel max-w-lg px-6 py-8 text-center text-red-600">
          <h3 className="font-bold text-xl mb-2">Oops!</h3>
          <p>{error || "Course not found"}</p>
          <Link href="/courses" className="mt-6 inline-block rounded-2xl border border-red-200 bg-white px-6 py-2 font-semibold text-red-600 transition hover:bg-red-50">
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
    <div className="w-full max-w-4xl">
      <Link 
        href="/courses" 
        className="mb-8 inline-flex items-center font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={20} className="mr-2" /> Back to Courses
      </Link>

      <div className="surface-panel overflow-hidden">
        {/* Header Hero */}
        <div className="relative flex h-64 flex-col justify-end overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 sm:p-12">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <BookOpen size={120} className="text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-5xl">
              {course.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 font-medium text-indigo-100 sm:gap-8">
              <div className="flex items-center rounded-full bg-black/20 px-4 py-2 backdrop-blur-sm">
                <User size={18} className="mr-2" />
                {course.user?.first_name && course.user?.last_name 
                  ? `${course.user.first_name} ${course.user.last_name}`
                  : course.user?.username || 'Unknown'}
              </div>
              <div className="flex items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Calendar size={18} className="mr-2" />
                Published {formattedDate}
              </div>
              {course.is_enrolled && (
                <div className="flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-emerald-300 backdrop-blur-sm">
                  <Check size={18} className="mr-2" />
                  Enrolled
                </div>
              )}
              {course.is_author && (
                <div className="flex items-center rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-amber-300 backdrop-blur-sm">
                  <User size={18} className="mr-2" />
                  Instructor
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 px-8 py-12 dark:bg-slate-950/55 sm:px-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-950 dark:text-slate-100">About this course</h2>
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
          
          {course.is_enrolled || course.is_author ? (
            <div className="mt-12 flex flex-col justify-center gap-4 border-t border-slate-100 pt-8 dark:border-slate-700 sm:flex-row">
              <button 
                onClick={() => {
                  const lessonsSection = document.getElementById('lessons-section');
                  lessonsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full rounded-2xl bg-indigo-600 px-8 py-4 text-center text-lg font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1 hover:bg-indigo-700 sm:w-auto"
              >
                Go to Lessons
              </button>
              {course.is_enrolled && !course.is_author && (
                <button 
                  onClick={handleLeave}
                  disabled={leaving}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 px-8 py-4 text-center text-lg font-bold text-red-600 transition-all hover:-translate-y-1 hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/50 sm:w-auto"
                >
                  {leaving ? "Leaving..." : "Leave Course"}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-12 flex justify-center border-t border-slate-100 pt-8 dark:border-slate-700">
              <button 
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1 hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
              >
                {enrolling ? "Enrolling..." : "Enroll in Course"}
              </button>
            </div>
          )}
        </div>

        {/* Classroom Banner - visible to enrolled users and the author */}
        {(course.is_enrolled || course.is_author) && course.classroom && (
          <div className="border-t border-slate-100 px-8 py-12 dark:border-slate-700 sm:px-12">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8">
              {/* Decorative blur circles */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare size={28} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-1">{course.classroom.name}</h3>
                  <p className="text-purple-200 text-sm leading-relaxed">
                    {course.is_in_classroom
                      ? "You're a member of this classroom. Jump in and connect with fellow learners!"
                      : "Join the course classroom to chat with your instructor and fellow students."}
                  </p>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  {course.is_in_classroom ? (
                    <Link
                      href={`/classrooms/${course.classroom.id}`}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 w-full sm:w-auto"
                    >
                      <Users size={18} />
                      Open Classroom
                    </Link>
                  ) : (
                    <button
                      onClick={handleJoinClassroom}
                      disabled={joiningClassroom}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 disabled:opacity-60 disabled:hover:translate-y-0 w-full sm:w-auto"
                    >
                      {joiningClassroom ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Users size={18} />
                      )}
                      {joiningClassroom ? "Joining..." : "Join Classroom"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lessons Section - Only visible if enrolled or author */}
        {(course.is_enrolled || course.is_author) && (
          <div id="lessons-section" className="p-8 sm:p-12 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
              <BookOpen size={28} className="text-indigo-600" />
              Course Lessons
            </h2>
            
            <div className="space-y-4">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson, idx) => (
                  <Link 
                    key={lesson.id}
                    href={`/courses/${slug}/lessons/${lesson.slug}`}
                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Lesson {idx + 1}</p>
                      </div>
                    </div>
                    <div className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Learning &rarr;
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 italic">
                  No lessons available for this course yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
