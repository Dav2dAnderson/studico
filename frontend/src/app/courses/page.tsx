"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import { Loader2, BookOpen, User, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Course {
  id: number;
  name: string;
  slug: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

export default function Courses() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      const fetchCourses = async () => {
        try {
          const res = await axiosInstance.get("/courses/");
          setCourses(res.data);
        } catch (err) {
          setError("Failed to load courses.");
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-center">
          <h3 className="font-semibold text-lg mb-1">Oops!</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight mb-2">
            Explore Courses
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Discover a variety of courses created by our community members.
          </p>
        </div>
        
        <Link 
          href="/applications" 
          className="px-6 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors shadow-sm"
        >
          Create a Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 text-indigo-400">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">No courses available</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            There are currently no courses published on Studico. Be the first to share your knowledge!
          </p>
          <Link 
            href="/applications" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md shadow-indigo-600/20 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
          >
            Apply to Teach
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link 
              href={`/courses/${course.slug}`} 
              key={course.id}
              className="group flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                <BookOpen size={64} className="text-white/80 group-hover:scale-110 group-hover:text-white transition-all duration-500 z-20" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {course.name}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <User size={16} className="mr-1.5" />
                    <span className="truncate max-w-[120px]">
                      {course.user?.first_name && course.user?.last_name 
                        ? `${course.user.first_name} ${course.user.last_name}`
                        : course.user?.username || 'Unknown'}
                    </span>
                  </div>
                  
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold group-hover:underline">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
