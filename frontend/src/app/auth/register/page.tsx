"use client";

import { useState, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Check,
} from "lucide-react";

const PERKS = [
  { icon: BookOpen, text: "Access all community courses instantly" },
  { icon: Users, text: "Connect with a global learner community" },
  { icon: Award, text: "Earn certificates as you progress" },
];

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitting = useRef(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/user_control/register/", formData);
      router.push("/auth/login");
    } catch (err: any) {
      if (err.rateLimitMessage) {
        setError(err.rateLimitMessage);
      } else if (err.response?.data) {
        const errorData = err.response.data;
        const messages = Object.values(errorData).flat().join(" ");
        setError(messages || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please check your connection.");
      }
    } finally {
      isSubmitting.current = false;
      setIsLoading(false);
    }
  };

  const inputClass = "input-base";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/65 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/50 lg:grid-cols-[0.95fr_1.05fr]">
      {/* ── Left branding panel ── */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-700 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[280px] h-[280px] bg-blue-400/20 rounded-full blur-2xl animate-float-delayed" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10">
          <Link href="/" className="text-3xl font-black text-white">
            Studico
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white leading-tight">
              Join thousands of
              <br />
              curious learners.
            </h2>
            <p className="text-indigo-200 text-lg">
              Create your free account and start today.
            </p>
          </div>

          <div className="space-y-4">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <p.icon size={18} className="text-white" />
                </div>
                <span className="text-white/90 font-medium">{p.text}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["100% Free", "No Credit Card", "Open Community"].map((b) => (
              <span
                key={b}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 rounded-xl text-white text-xs font-semibold border border-white/20"
              >
                <Check size={12} /> {b}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-indigo-200 text-sm italic">
            &ldquo;An investment in knowledge pays the best interest.&rdquo;
          </p>
          <p className="text-indigo-300 text-xs mt-1">— Benjamin Franklin</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-start justify-center overflow-y-auto px-6 py-12">
        <div className="w-full max-w-lg space-y-7">
          {/* Header */}
          <div>
            <div className="lg:hidden mb-6">
              <Link href="/" className="text-2xl font-black gradient-text-static">
                Studico
              </Link>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
              Create your account
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              <span className="mt-0.5">⚠</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form
            id="register-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  id="register-first-name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  id="register-last-name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className={labelClass}>Username</label>
              <input
                id="register-username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className={inputClass}
                placeholder="janedoe"
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email address</label>
              <input
                id="register-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="jane@example.com"
              />
            </div>

            {/* Phone + Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone Number</label>
                <input
                  id="register-phone"
                  name="phone_number"
                  type="text"
                  required
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  id="register-gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  id="register-password-confirm"
                  name="password_confirm"
                  type="password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Create Free Account <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-600">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
