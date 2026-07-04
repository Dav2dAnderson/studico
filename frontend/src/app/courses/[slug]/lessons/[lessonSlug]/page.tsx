"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BookOpen, Clock, FileUp, PlayCircle, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface Lesson {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

interface LessonDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  file: string | null;
  created_at: string;
  course: {
    name: string;
    slug: string;
  };
}

export default function LessonDetail() {
  const { slug, lessonSlug } = useParams();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>("");

  const isVideo = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split('?')[0];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    return videoExtensions.some(ext => cleanUrl.toLowerCase().endsWith(ext));
  };

  const getMediaUrl = (path: string | null) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://studico.onrender.com/api/';
    const baseUrl = apiUrl.replace(/\/api\/$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const getPreviousAndNextLesson = () => {
    if (!lesson || courseLessons.length === 0) return { previous: null, next: null };

    const currentIndex = courseLessons.findIndex(l => l.id === lesson.id);
    const previous = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
    const next = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

    return { previous, next };
  };

  const sanitizeContent = (html: string) => {
    const sanitized = html
      .replace(/&nbsp;/g, ' ')     // Replace non-breaking spaces with regular spaces
      .replace(/\u00A0/g, ' ')     // Replace non-breaking space character with regular space
      .replace(/\u00AD/g, '')      // soft hyphen
      .replace(/\u200B/g, '')      // zero-width space
      .replace(/\u200C/g, '')      // zero-width non-joiner
      .replace(/\u200D/g, '')      // zero-width joiner
      .replace(/\u2060/g, '')      // word joiner
      .replace(/\uFEFF/g, '')      // zero-width no-break space (BOM)
      .replace(/&shy;/g, '')       // HTML soft hyphen
      .replace(/&zwj;/g, '')       // HTML zero-width joiner
      .replace(/&zwnj;/g, '')      // HTML zero-width non-joiner
      .trim();
    
    return sanitized;
  };

  useEffect(() => {
    if (!slug || !lessonSlug) return;

    const fetchLessonData = async () => {
      try {
        // Fetch both lesson and course lessons in parallel
        const [lessonRes, courseRes] = await Promise.all([
          axiosInstance.get(`/courses/${slug}/lessons/${lessonSlug}/`),
          axiosInstance.get(`/courses/${slug}/`)
        ]);

        setLesson(lessonRes.data);
        setCourseLessons(courseRes.data.lessons || []);

        if (lessonRes.data.file && isVideo(lessonRes.data.file)) {
          setActiveVideoUrl(lessonRes.data.file);
        }
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 403) {
          setError("You must be enrolled in this course to view this lesson.");
        } else if (error.response?.status === 404) {
          setError("Lesson not found.");
        } else {
          setError("Failed to load lesson content.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [slug, lessonSlug]);

  useEffect(() => {
    if (lesson?.content) {
      hljs.highlightAll();
    }
  }, [lesson]);

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

  const { previous, next } = getPreviousAndNextLesson();

  return (
    <div className="py-8 max-w-4xl mx-auto w-full px-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Curriculum
        </Link>
        <div className="text-sm text-slate-600 dark:text-slate-300 font-medium flex items-center">
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

        {/* Video Player Section */}
        {activeVideoUrl && (
          <div className="aspect-video bg-black border-b border-slate-200 dark:border-slate-700">
            <video
              key={activeVideoUrl}
              src={getMediaUrl(activeVideoUrl)}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="p-8 sm:p-12">
          <div
            className="prose sm:prose-lg prose-indigo dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 mb-12 min-w-0 [&_*]:break-normal"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(sanitizeContent(lesson.content || '<p class="italic text-slate-600 dark:text-slate-400">This lesson has no content yet.</p>'))
            }}
          />

          {/* Downloadable Files Section */}
          {lesson.file && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileUp size={20} className="text-indigo-600" />
                Lesson Resources
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {(() => {
                  const fileName = lesson.file.split('/').pop() || 'resource';
                  const fileIsVideo = isVideo(lesson.file);

                  return (
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                          <FileUp size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {fileName}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-widest font-black mt-0.5">
                            {fileIsVideo ? 'Video Lesson' : 'Resource File'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {fileIsVideo && (
                          <button
                            onClick={() => {
                              setActiveVideoUrl(lesson.file!);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all shadow-sm text-sm ${activeVideoUrl === lesson.file
                              ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                              : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-slate-700'
                              }`}
                          >
                            <PlayCircle size={16} />
                            {activeVideoUrl === lesson.file ? 'Playing' : 'Play'}
                          </button>
                        )}

                        <a
                          href={getMediaUrl(lesson.file)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Lesson Navigation */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {previous ? (
                <Link
                  href={`/courses/${slug}/lessons/${previous.slug}`}
                  className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronLeft size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">Previous Lesson</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {previous.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div /> // Spacer for layout balance
              )}

              {next ? (
                <Link
                  href={`/courses/${slug}/lessons/${next.slug}`}
                  className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group sm:ml-auto"
                >
                  <div className="text-right">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">Next Lesson</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {next.title}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </Link>
              ) : (
                <div /> // Spacer for layout balance
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
