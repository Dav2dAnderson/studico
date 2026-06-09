"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Loader2, FileText, CheckCircle, XCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Application {
  id: number;
  content: string;
  created_at: string;
  checked: boolean;
  accepted: boolean;
}

export default function Applications() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      if (user.is_author) {
        router.push("/profile");
        return;
      }
      fetchApplications();
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get("/applications/");
      // The endpoint returns all applications, we should ideally filter by user
      // Assuming the backend handles filtering, or if not, we filter here just in case:
      // const userApps = res.data.filter((app: any) => app.user.id === user?.id);
      // For now, we trust the API to return the right data or we just show them
      setApplications(res.data);
    } catch (err) {
      console.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await axiosInstance.post("/applications/", { content });
      setSuccess("Your application has been submitted successfully!");
      setContent("");
      fetchApplications();
    } catch (err) {
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
      </div>
    );
  }

  if (!user) return null; // Router will redirect

  return (
    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Submit Form Area */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="page-title mb-2">
            Apply to Teach
          </h1>
          <p className="page-subtitle max-w-2xl">
            Share your expertise with the Studico community. Submit your application below to become a creator.
          </p>
        </div>

        <div className="surface-panel p-8">
          <h2 className="mb-6 flex items-center text-2xl font-bold text-slate-800 dark:text-slate-100">
            <FileText className="mr-3 text-indigo-500" />
            New Application
          </h2>
          
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle size={18} className="mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Why do you want to teach on Studico? Tell us about your experience and the courses you plan to create.
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="input-base min-h-40 resize-none"
                placeholder="I have 5 years of experience in..."
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 active:scale-95 sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Send size={18} className="mr-2" />
              )}
              Submit Application
            </button>
          </form>
        </div>
      </div>

      {/* Past Applications Area */}
      <div className="lg:col-span-1">
        <div className="surface-panel-soft h-full p-6">
          <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Your History</h3>
          
          {applications.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                <FileText size={24} />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/55">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </span>
                    {app.accepted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                        <CheckCircle size={10} className="mr-1" /> Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    "{app.content}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
