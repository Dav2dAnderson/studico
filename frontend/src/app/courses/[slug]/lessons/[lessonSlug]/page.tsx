"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, BookOpen, Clock, FileUp, PlayCircle } from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Premium dark theme for code snippet
import { useEffect as useIsomorphicLayoutEffect } from 'react';

interface LessonFile {
  id: number;
  file: string;
  uploaded_at: string;
}

interface LessonDetail {
  id: number;
  title: string;
  content: string;
  file: string | null;
  files: LessonFile[];
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
    return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    if (!slug || !lessonSlug) return;

    const fetchLesson = async () => {
      try {
        const res = await axiosInstance.get(`/courses/${slug}/lessons/${lessonSlug}/`);
        setLesson(res.data);
        const allFiles = [
          ...(res.data.file ? [{ id: -1, file: res.data.file }] : []),
          ...(res.data.files || [])
        ];
        const firstVideo = allFiles.find(f => isVideo(f.file));
        if (firstVideo) {
          setActiveVideoUrl(firstVideo.file);
        }
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

  // Combine single file and multiple files into one array for display
  const allFiles = [
    ...(lesson.file ? [{ id: -1, file: lesson.file }] : []),
    ...lesson.files
  ];

  const handleDownload = async (fileId: number, fileName: string) => {
    if (fileId === -1) return; // Main file doesn't have a secure endpoint yet
    
    try {
      const response = await axiosInstance.get(
        `/courses/${slug}/lessons/${lessonSlug}/files/${fileId}/download/`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download file. Please make sure you are enrolled.");
    }
  };

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
            className="prose prose-lg prose-indigo dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 mb-12"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(lesson.content || '<p class="italic text-slate-400">This lesson has no content yet.</p>') 
            }}
          />

          {/* Downloadable Files Section */}
          {allFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileUp size={20} className="text-indigo-600" />
                Lesson Resources ({allFiles.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {allFiles.map((f) => {
                  const fileName = f.file.split('/').pop() || 'resource';
                  const isMainFile = f.id === -1;
                  const fileIsVideo = isVideo(f.file);

                  return (
                    <div key={f.id} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                          <FileUp size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {fileName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-black mt-0.5">
                            {fileIsVideo ? 'Video Lesson' : 'Resource File'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {fileIsVideo && (
                          <button 
                            onClick={() => {
                              setActiveVideoUrl(f.file);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold border transition-all shadow-sm text-sm ${
                              activeVideoUrl === f.file 
                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' 
                                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            <PlayCircle size={16} />
                            {activeVideoUrl === f.file ? 'Playing' : 'Play'}
                          </button>
                        )}

                        {isMainFile ? (
                          <a 
                            href={getMediaUrl(f.file)} 
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm"
                          >
                            Download
                          </a>
                        ) : (
                          <button 
                            onClick={() => handleDownload(f.id, fileName)}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
