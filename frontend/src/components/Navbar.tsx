"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, User, BookOpen, Sun, Moon } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Studico
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link href="/courses" className="text-slate-600 dark:text-slate-300 inline-flex items-center px-1 pt-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Courses
            </Link>
            <Link href="/applications" className="text-slate-600 dark:text-slate-300 inline-flex items-center px-1 pt-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Apply to Teach
            </Link>
            {user?.is_author && (
              <Link href="/courses/create" className="text-indigo-600 dark:text-indigo-400 inline-flex items-center px-1 pt-1 font-semibold hover:text-indigo-700 dark:hover:text-indigo-500 transition-colors">
                Create Course
              </Link>
            )}

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            {!loading && (
              user ? (
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-indigo-600 focus:outline-none transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.username}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 flex flex-col overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                        Signed in as <br/><strong className="text-slate-800 dark:text-slate-100">{user.username}</strong>
                      </div>
                      <Link 
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      {user.is_author && (
                        <Link 
                          href="/courses/create"
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 transition-colors font-medium"
                        >
                          <BookOpen size={16} />
                          Create Course
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/auth/login" className="text-slate-600 dark:text-slate-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Login
                  </Link>
                  <Link href="/auth/register" className="text-white bg-indigo-600 px-5 py-2.5 rounded-full hover:bg-indigo-700 font-medium shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
