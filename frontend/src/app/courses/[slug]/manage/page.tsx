"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axios";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit2, 
  FileText, 
  ArrowLeft, 
  Check, 
  X,
  FileUp
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />
});

interface LessonFile {
  id: number;
  file: string;
  uploaded_at: string;
}

interface Lesson {
  id: number;
  title: string;
  slug: string;
  content: string;
  file: string | null;
  files: LessonFile[];
  created_at: string;
}

interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  user: {
    id: number;
    username: string;
  };
}

export default function ManageCourse() {
  const { slug } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // New lesson form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<{title: string, content: string, file: File | null, extraFiles: FileList | null}>({ 
    title: "", 
    content: "", 
    file: null,
    extraFiles: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit lesson state
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{title: string, content: string, file: File | null, extraFiles: FileList | null}>({ 
    title: "", 
    content: "", 
    file: null,
    extraFiles: null
  });

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        axiosInstance.get(`/courses/${slug}/`),
        axiosInstance.get(`/courses/${slug}/lessons/`)
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      
      // Authorization check: only author can manage
      if (user && courseRes.data.user.id !== user.id) {
        router.push("/courses");
      }
    } catch (err: any) {
      setError("Failed to load course management data.");
    } finally {
      setLoading(false);
    }
  }, [slug, user, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, fetchData, router]);

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone and will delete all associated lessons and files.")) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/courses/${slug}/`);
      router.push("/profile");
    } catch (err) {
      alert("Failed to delete course.");
      setIsDeleting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", newLesson.title);
    formData.append("content", newLesson.content);
    if (newLesson.file) {
      formData.append("file", newLesson.file);
    }
    if (newLesson.extraFiles) {
      Array.from(newLesson.extraFiles).forEach((file) => {
        formData.append("uploaded_files", file);
      });
    }

    try {
      await axiosInstance.post(`/courses/${slug}/lessons/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setNewLesson({ title: "", content: "", file: null, extraFiles: null });
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      alert("Failed to add lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonSlug: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await axiosInstance.delete(`/courses/${slug}/lessons/${lessonSlug}/`);
      fetchData();
    } catch (err: any) {
      alert("Failed to delete lesson.");
    }
  };

  const handleStartEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditFormData({ title: lesson.title, content: lesson.content, file: null, extraFiles: null });
  };

  const handleUpdateLesson = async (lessonSlug: string) => {
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", editFormData.title);
    formData.append("content", editFormData.content);
    if (editFormData.file) {
      formData.append("file", editFormData.file);
    }
    if (editFormData.extraFiles) {
      Array.from(editFormData.extraFiles).forEach((file) => {
        formData.append("uploaded_files", file);
      });
    }

    try {
      await axiosInstance.patch(`/courses/${slug}/lessons/${lessonSlug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setEditingLessonId(null);
      fetchData();
    } catch (err: any) {
      alert("Failed to update lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Link href="/profile" className="text-indigo-600 hover:underline mt-4 inline-block">
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Manage Course</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{course.name}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDeleteCourse}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-5 py-2.5 rounded-xl font-semibold hover:bg-red-100 dark:hover:bg-red-950/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={20} />
            {isDeleting ? "Deleting..." : "Delete Course"}
          </button>
          
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? "Cancel" : "Add Lesson"}
          </button>
        </div>
      </div>

      {/* Add Lesson Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">New Lesson</h2>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input 
                type="text" 
                required
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Lesson title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
              <RichTextEditor 
                value={newLesson.content}
                onChange={(data) => setNewLesson({...newLesson, content: data})}
                placeholder="Lesson content (Rich text and Code supported)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Main File / Video</label>
                <input 
                  type="file" 
                  onChange={(e) => setNewLesson({...newLesson, file: e.target.files?.[0] || null})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Additional Resources (Multiple)</label>
                <input 
                  type="file" 
                  multiple
                  onChange={(e) => setNewLesson({...newLesson, extraFiles: e.target.files})}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "Create Lesson"}
            </button>
          </form>
        </div>
      )}

      {/* Lessons List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course Lessons</h2>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {lessons.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No lessons added yet. Start by adding your first lesson!</p>
            </div>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                {editingLessonId === lesson.id ? (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <RichTextEditor 
                      value={editFormData.content}
                      onChange={(data) => setEditFormData({...editFormData, content: data})}
                      placeholder="Update lesson content..."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Change Main File</label>
                        <input 
                          type="file" 
                          onChange={(e) => setEditFormData({...editFormData, file: e.target.files?.[0] || null})}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Add More Resources</label>
                        <input 
                          type="file" 
                          multiple
                          onChange={(e) => setEditFormData({...editFormData, extraFiles: e.target.files})}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateLesson(lesson.slug)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition-colors"
                      >
                        <Check size={16} /> Save
                      </button>
                      <button 
                        onClick={() => setEditingLessonId(null)}
                        className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {lesson.file || (lesson.files && lesson.files.length > 0) ? <FileUp size={20} /> : <FileText size={20} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{lesson.title}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Created on {new Date(lesson.created_at).toLocaleDateString()}</p>
                          {(lesson.file || (lesson.files && lesson.files.length > 0)) && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {lesson.files?.length + (lesson.file ? 1 : 0)} Files
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleStartEdit(lesson)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                        title="Edit Lesson"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.slug)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                        title="Delete Lesson"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
