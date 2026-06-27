"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import Link from "next/link";
import {
  Loader2,
  BookOpen,
  User,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
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

// Gradient palette for course cards
const CARD_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-purple-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-violet-500 to-purple-700",
];

export default function Courses() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
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
        } catch {
          setError("Failed to load courses.");
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [user, authLoading, router]);

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950" />
            <Loader2 className="absolute inset-0 m-auto animate-spin h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="surface-panel max-w-md px-8 py-6 text-center text-red-600 dark:text-red-400">
          <h3 className="font-bold text-lg mb-1">Oops!</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="page-eyebrow mb-2">
              Studico Library
            </p>
            <h1 className="page-title">
              Explore Courses
            </h1>
            <p className="page-subtitle mt-2">
              {courses.length} course{courses.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <Link
            href="/applications"
            id="become-instructor-btn"
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-indigo-100 dark:border-indigo-800/70 dark:bg-indigo-950/55 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            <Sparkles size={15} />
            Become an Instructor
          </Link>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            id="course-search"
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-11 rounded-2xl"
          />
        </div>
      </div>

      {/* Courses grid */}
      {filtered.length === 0 ? (
        <div className="surface-panel text-center py-24">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-400 dark:bg-indigo-950/40">
            <BookOpen size={36} />
          </div>
          <h3 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">
            {search ? "No courses found" : "No courses available yet"}
          </h3>
          <p className="mx-auto mb-8 max-w-sm text-base text-slate-400 dark:text-slate-500">
            {search
              ? `No courses match "${search}". Try a different search.`
              : "Be the first to share your knowledge with the community!"}
          </p>
          {!search && (
            <Link href="/applications" className="btn-primary inline-flex gap-2">
              <Sparkles size={16} /> Apply to Teach
            </Link>
          )}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="btn-secondary inline-flex"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((course, i) => {
            const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
            const authorName =
              course.user?.first_name && course.user?.last_name
                ? `${course.user.first_name} ${course.user.last_name}`
                : course.user?.username || "Unknown";

            return (
              <Link
                href={`/courses/${course.slug}`}
                key={course.id}
                id={`course-card-${course.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/80 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-950/65 dark:hover:shadow-black/30"
              >
                {/* Card visual header */}
                <div
                  className={`relative h-44 bg-gradient-to-br ${gradient} overflow-hidden flex items-center justify-center`}
                >
                  {/* Decorative orbs */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />

                  <BookOpen
                    size={52}
                    className="text-white/50 group-hover:text-white/80 group-hover:scale-110 transition-all duration-500 relative z-10"
                  />

                  {/* Shimmer overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Card body */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="mb-3 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 line-clamp-2">
                    {course.name}
                  </h3>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                          {authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px] font-medium">
                          {authorName}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:gap-2 transition-all">
                        View
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
