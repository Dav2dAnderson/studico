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

interface Lesson {
  id: number;
  title: string;
  slug: string;
  content: string;
  file: string | null;
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
  const [pageError, setPageError] = useState("");
  
  // New lesson form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLesson, setNewLesson] = useState<{title: string, content: string, file: File | null}>({ 
    title: "", 
    content: "", 
    file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [addLessonError, setAddLessonError] = useState("");

  // Edit lesson state
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<{title: string, content: string, file: File | null}>({ 
    title: "", 
    content: "", 
    file: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editError, setEditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    } catch (err: unknown) {
      console.error("Failed to fetch course data:", err);
      setPageError("Failed to load course management data.");
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
    } catch (_err) {
      alert("Failed to delete course.");
      setIsDeleting(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddLessonError("");
    
    const formData = new FormData();
    formData.append("title", newLesson.title);
    formData.append("content", newLesson.content);
    if (newLesson.file) {
      formData.append("file", newLesson.file);
    }

    try {
      await axiosInstance.post(`/courses/${slug}/lessons/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setNewLesson({ title: "", content: "", file: null });
      setShowAddForm(false);
      // Fetch data in background without blocking
      fetchData().catch(err => {
        console.error("Failed to refresh data after adding lesson:", err);
      });
    } catch (err: unknown) {
      console.error("Failed to add lesson:", err);
      setAddLessonError("Failed to add lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonSlug: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await axiosInstance.delete(`/courses/${slug}/lessons/${lessonSlug}/`);
      // Fetch data in background without blocking
      fetchData().catch(err => {
        console.error("Failed to refresh data after deleting lesson:", err);
      });
    } catch (err: unknown) {
      console.error("Failed to delete lesson:", err);
      alert("Failed to delete lesson.");
    }
  };

  const handleStartEdit = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditFormData({ title: lesson.title, content: lesson.content, file: null });
    setHasUnsavedChanges(false);
    setEditError("");
    setSuccessMessage("");
  };

  const handleUpdateLesson = async (lessonSlug: string) => {
    setIsSaving(true);
    setEditError("");
    setSuccessMessage("");
    
    const formData = new FormData();
    formData.append("title", editFormData.title);
    formData.append("content", editFormData.content);
    if (editFormData.file) {
      formData.append("file", editFormData.file);
    }

    try {
      await axiosInstance.patch(`/courses/${slug}/lessons/${lessonSlug}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSuccessMessage("Lesson updated successfully!");
      setHasUnsavedChanges(false);
      setEditingLessonId(null);
      // Fetch data in background without blocking
      fetchData().catch(err => {
        console.error("Failed to refresh data after update:", err);
      });
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: unknown) {
      console.error("Failed to update lesson:", err);
      setEditError("Failed to update lesson. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    setEditingLessonId(null);
    setHasUnsavedChanges(false);
    setEditError("");
    setSuccessMessage("");
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (pageError || !course) {
    return (
      <div className="py-12 text-center">
        <p className="text-red-600 font-medium">{pageError}</p>
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
          
          {addLessonError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium mb-4">
              {addLessonError}
            </div>
          )}
          
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
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Lesson File / Video</label>
              <input 
                type="file" 
                onChange={(e) => setNewLesson({...newLesson, file: e.target.files?.[0] || null})}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
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
                {editingLessonId === lesson.id && isSaving ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Saving changes...</p>
                    </div>
                  </div>
                ) : editingLessonId === lesson.id ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Error/Success Messages */}
                    {editError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                        {editError}
                      </div>
                    )}
                    {successMessage && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm font-medium">
                        {successMessage}
                      </div>
                    )}

                    {/* Title Input */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lesson Title</label>
                      <input 
                        type="text" 
                        value={editFormData.title}
                        onChange={(e) => {
                          setEditFormData({...editFormData, title: e.target.value});
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Enter lesson title"
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lesson Content</label>
                      <RichTextEditor 
                        value={editFormData.content}
                        onChange={(data) => {
                          setEditFormData({...editFormData, content: data});
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Update lesson content..."
                      />
                    </div>

                    {/* File Section */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Lesson File / Video
                      </label>
                      
                      {/* Current File Status */}
                      {lesson.file && (
                        <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <FileUp size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                Current file: {lesson.file.split('/').pop()}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Uploading a new file will replace this one
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                          {lesson.file ? "Replace with new file" : "Upload file"}
                        </label>
                        <input 
                          type="file" 
                          onChange={(e) => {
                            setEditFormData({...editFormData, file: e.target.files?.[0] || null});
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {editFormData.file && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            New file selected: <span className="font-medium">{editFormData.file.name}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={() => handleUpdateLesson(lesson.slug)}
                        disabled={isSaving || !editFormData.title.trim()}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Check size={18} />} 
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={18} /> Cancel
                      </button>
                    </div>

                    {/* Unsaved Changes Indicator */}
                    {hasUnsavedChanges && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        You have unsaved changes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        {lesson.file ? <FileUp size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{lesson.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Created on {new Date(lesson.created_at).toLocaleDateString()}</p>
                          {lesson.file && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Has File
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleStartEdit(lesson)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                        title="Edit Lesson"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.slug)}
                        className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
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
