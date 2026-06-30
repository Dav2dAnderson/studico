"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  Send,
  Users,
  MessageSquare,
  BookOpen,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Sender {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Message {
  id: number;
  sender: Sender | null;
  content: string;
  created_date: string;
}

interface CourseInfo {
  id: number;
  name: string;
  slug: string;
}

interface ClassroomDetail {
  id: number;
  name: string;
  description: string;
  course_info: CourseInfo;
  students: number[];
  messages: Message[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function displayName(sender: Sender | null): string {
  if (!sender) return "Deleted User";
  const full = `${sender.first_name} ${sender.last_name}`.trim();
  return full || sender.username;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

// Group messages by date for dividers
function groupByDate(messages: Message[]): { date: string; items: Message[] }[] {
  const groups: { date: string; items: Message[] }[] = [];
  messages.forEach((msg) => {
    const label = formatDate(msg.created_date);
    const last = groups[groups.length - 1];
    if (last && last.date === label) {
      last.items.push(msg);
    } else {
      groups.push({ date: label, items: [msg] });
    }
  });
  return groups;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClassroomPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [classroom, setClassroom] = useState<ClassroomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ── Fetch classroom ────────────────────────────────────────────────────────
  const fetchClassroom = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/classrooms/${id}/`);
      setClassroom(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 403 || error.response?.status === 404) {
        setError("You don't have access to this classroom.");
      } else {
        setError("Failed to load classroom.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  // ── Initial load + WebSocket ─────────────────────────────────────────────────
  useEffect(() => {
    fetchClassroom();

    if (id) {
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
      const ws = new WebSocket(`${wsBaseUrl}/ws/chat/${id}/`);
      
      ws.onmessage = (event) => {
        const newMsg = JSON.parse(event.data);
        setClassroom((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === newMsg.id)) return prev;
          return { ...prev, messages: [...prev.messages, newMsg] };
        });
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    }
  }, [fetchClassroom, id]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [classroom?.messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setSendError("");
    try {
      const token = localStorage.getItem("access");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ content, token }));
        setInput("");
        inputRef.current?.focus();
      } else {
        // Fallback to REST API if WS is not available
        const res = await axiosInstance.post(`/classrooms/${id}/send_message/`, { content });
        setClassroom((prev) =>
          prev ? { ...prev, messages: [...prev.messages, res.data] } : prev
        );
        setInput("");
        inputRef.current?.focus();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setSendError(error.response?.data?.detail || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (authLoading || (loading && !classroom)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
          <p className="text-slate-400 text-sm">Loading classroom…</p>
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="bg-slate-900 border border-red-800/50 rounded-3xl px-8 py-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">{error || "Classroom not found."}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const grouped = groupByDate(classroom.messages);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-950">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push(`/courses/${classroom.course_info.slug}`)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to course"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-white text-lg leading-tight truncate">
                  {classroom.name}
                </h1>
                <Link
                  href={`/courses/${classroom.course_info.slug}`}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  <BookOpen size={11} />
                  {classroom.course_info.name}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-sm flex-shrink-0">
            <Users size={15} />
            <span>{classroom.students.length} members</span>
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-1">
        <div className="max-w-4xl mx-auto w-full">
          {classroom.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-800/70 flex items-center justify-center">
                <MessageSquare size={36} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-center">
                No messages yet. Be the first to say something!
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.date}>
                {/* Date divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-900 rounded-full border border-slate-800">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {group.items.map((msg) => {
                  const isMe = msg.sender?.id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2.5 mb-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold mb-0.5">
                          {(msg.sender?.first_name?.[0] || msg.sender?.username?.[0] || "?").toUpperCase()}
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                        {/* Sender name + time */}
                        <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <span className="text-xs font-semibold text-slate-400">
                            {isMe ? "You" : displayName(msg.sender)}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {formatTime(msg.created_date)}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm shadow-indigo-900/30"
                              : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur border-t border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {sendError && (
            <p className="text-xs text-red-400 mb-2 text-center">{sendError}</p>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-expand up to 5 rows
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
                className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm resize-none outline-none transition-all leading-relaxed"
                style={{ minHeight: "48px" }}
              />
            </div>
            <button
              id="send-message-btn"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-900/40 hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              title="Send message"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Real-time chat enabled
          </p>
        </div>
      </div>
    </div>
  );
}
