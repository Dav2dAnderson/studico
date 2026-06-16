import Link from "next/link";
import { MailCheck, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

type VerifyEmailPageProps = {
  // Use Promise<any> to satisfy Next.js generated PageProps constraint
  searchParams?: Promise<any>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email : undefined;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/65 shadow-2xl shadow-slate-900/5 backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/50 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] h-[340px] w-[340px] rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute bottom-[-10%] left-[-10%] h-[260px] w-[260px] rounded-full bg-cyan-400/20 blur-2xl animate-float-delayed" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              <ShieldCheck size={16} />
              Verify your account
            </div>
            <h1 className="text-4xl font-black leading-tight text-white">
              One last step before you can start learning.
            </h1>
            <p className="text-lg text-cyan-100">
              We&apos;ve sent a verification link to your inbox so we know it&apos;s really you.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Check your inbox and spam folder",
              "Click the activation link from Studico",
              "Come back and sign in once your account is active",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="font-medium text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-sm italic text-cyan-100">
            &ldquo;The confirmation email usually lands within a minute.&rdquo;
          </p>
          <p className="mt-1 text-xs text-cyan-200">
            If it doesn&apos;t, check spam or promotions.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <MailCheck size={30} />
            </div>
            <div>
              <p className="page-eyebrow mb-2 text-center">Email verification</p>
              <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                Check your email
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                We sent an activation link
                {email ? (
                  <>
                    {" "}
                    to{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {email}
                    </span>
                  </>
                ) : (
                  ""
                )}
                .
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            Open the email and click the verification button to activate your
            account. If you just verified your account, you can sign in right
            away.
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:opacity-90 active:scale-[0.98]"
            >
              Go to sign in
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-bold text-slate-700 transition-all hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
            >
              Register another account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
