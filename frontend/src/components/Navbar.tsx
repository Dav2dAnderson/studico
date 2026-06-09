"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LogOut,
  User,
  BookOpen,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navLinkClass = (href: string) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive(href)
        ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/10 dark:bg-indigo-950/55 dark:text-indigo-300"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-2xl transition-all duration-300 dark:border-slate-800/70 dark:bg-slate-950/60 ${
          scrolled ? "shadow-lg shadow-slate-900/5 dark:shadow-black/25" : ""
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl sm:text-2xl font-black gradient-text-static hover:opacity-90 transition-opacity"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30">
                  <GraduationCap size={16} className="text-white" />
                </div>
                Studico
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 p-1.5 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/50">
              <Link href="/courses" className={navLinkClass("/courses")}>
                <BookOpen size={15} />
                Courses
              </Link>

              {!user?.is_author && (
                <Link
                  href="/applications"
                  className={navLinkClass("/applications")}
                >
                  <Sparkles size={15} />
                  Apply to Teach
                </Link>
              )}

              {user?.is_author && (
                <Link
                  href="/courses/create"
                  className={navLinkClass("/courses/create")}
                >
                  <BookOpen size={15} />
                  Create Course
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                id="theme-toggle"
                className="rounded-full border border-slate-200/70 bg-white/70 p-2.5 text-slate-500 shadow-sm shadow-slate-900/5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-slate-200"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {!loading && (
                user ? (
                  /* User dropdown */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="user-menu-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2.5 rounded-full border px-2 py-1.5 transition-all duration-200 ${
                        dropdownOpen
                          ? "border-indigo-200 bg-indigo-50/80 dark:border-indigo-900/70 dark:bg-indigo-950/55"
                          : "border-slate-200/70 bg-white/70 hover:border-indigo-300 hover:bg-white dark:border-slate-800/70 dark:bg-slate-900/60 dark:hover:border-indigo-700"
                      }`}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-black text-white shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="pr-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {user.username}
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/95 py-1.5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-black/40 animate-scale-in">
                        {/* Header */}
                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400 dark:text-slate-500">
                            Signed in as
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {user.username}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <LayoutDashboard size={15} className="text-slate-400" />
                            My Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <User size={15} className="text-slate-400" />
                            Profile
                          </Link>
                          {user.is_author && (
                            <Link
                              href="/courses/create"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                            >
                              <BookOpen size={15} />
                              Create Course
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                          <button
                            onClick={() => {
                              logout();
                              setDropdownOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Auth buttons */
                  <div className="flex items-center gap-2 ml-2">
                    <Link
                      href="/auth/login"
                      id="nav-login-btn"
                      className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-white/80 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-indigo-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      id="nav-register-btn"
                      className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:opacity-95 active:scale-[0.98]"
                    >
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              id="mobile-menu-btn"
              className="rounded-full border border-slate-200/70 bg-white/70 p-2 text-slate-500 shadow-sm shadow-slate-900/5 transition-all hover:border-indigo-300 hover:text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-slate-200 sm:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-fade-up border-t border-slate-200/70 bg-white/95 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/95 sm:hidden">
            <div className="px-4 py-4 space-y-1">
              <Link href="/courses" className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium ${navLinkClass("/courses")}`}>
                <BookOpen size={16} /> Courses
              </Link>
              {!user?.is_author && (
                <Link href="/applications" className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium ${navLinkClass("/applications")}`}>
                  <Sparkles size={16} /> Apply to Teach
                </Link>
              )}
              {user?.is_author && (
                <Link href="/courses/create" className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium ${navLinkClass("/courses/create")}`}>
                  <BookOpen size={16} /> Create Course
                </Link>
              )}
            </div>

            <div className="space-y-2 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>

              {!loading && (
                user ? (
                  <>
                    <Link href="/profile" className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      <User size={16} /> Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link href="/auth/login" className="flex-1 rounded-2xl border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition-all hover:border-indigo-300 dark:border-slate-700 dark:text-slate-200">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:opacity-90">
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
