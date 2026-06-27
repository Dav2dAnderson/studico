import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Studico — Where Ambition Meets Education",
  description:
    "Studico is a community-driven learning platform where knowledge is shared freely. Discover new skills or create your own courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (!theme && supportDarkMode) theme = 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            })();
          `,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.className} min-h-screen text-slate-900 dark:text-slate-50 transition-colors duration-300`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
              <div className="absolute top-[18rem] right-0 h-[24rem] w-[24rem] translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />
              <div className="absolute bottom-0 left-0 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />
              <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(99,102,241,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.55) 1px, transparent 1px)",
                  backgroundSize: "56px 56px",
                }}
              />
            </div>
            <Navbar />

            <main className="relative z-10 flex-1">
              <div className="page-shell">
                {children}
              </div>
            </main>

            <footer className="relative z-10 mt-auto border-t border-slate-200/70 bg-white/75 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/55">
              <div className="page-shell py-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-md space-y-3">
                    <Link
                      href="/"
                      className="inline-flex text-2xl font-black gradient-text-static"
                    >
                      Studico
                    </Link>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      A community-driven learning platform where knowledge is
                      shared freely and ambition thrives.
                    </p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="page-eyebrow text-[10px]">Platform</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: "Browse Courses", href: "/courses" },
                          { label: "Apply to Teach", href: "/applications" },
                          { label: "My Profile", href: "/profile" },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="page-eyebrow text-[10px]">Account</p>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: "Sign In", href: "/auth/login" },
                          { label: "Create Account", href: "/auth/register" },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 pt-6 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>© {new Date().getFullYear()} Studico. All rights reserved.</p>
                  <p>Where ambition meets education.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
