"use client";

import { AlertTriangle, ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, resetPassword, admin, loading, configured, error: authError } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectTo = searchParams.get("from") ?? "/admin";

  // Already signed in — bounce straight through.
  useEffect(() => {
    if (!loading && admin) router.replace(redirectTo);
  }, [admin, loading, redirectTo, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back.");
      router.replace(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      setFormError("Enter your email address first, then choose 'Forgot password'.");
      return;
    }

    try {
      await resetPassword(email);
      toast.success("Password reset email sent — check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the reset email.");
    }
  }

  const displayError = formError ?? authError;

  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-navy-950 px-5 py-16">
      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 50% at 20% 10%, rgba(37,99,235,0.28), transparent 60%), radial-gradient(ellipse 45% 45% at 85% 88%, rgba(14,165,233,0.18), transparent 60%)",
        }}
      />
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-1 opacity-20" />

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to the website
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl sm:p-9">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-2xl bg-linear-135 from-brand-600 to-accent-500 text-white shadow-[0_10px_28px_-10px_rgba(37,99,235,0.8)]"
          >
            <ShieldCheck className="size-6" />
          </span>

          <h1 className="mt-6 text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Access is limited to registered administrators. There is no public registration.
          </p>

          {!configured && (
            <p
              role="alert"
              className="mt-6 flex gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3.5 text-[13px] leading-relaxed text-amber-200"
            >
              <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
              Firebase isn&apos;t configured. Copy <code>.env.example</code> to{" "}
              <code>.env.local</code> and add your project keys.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <div className="relative">
              <Mail
                aria-hidden
                className="pointer-events-none absolute top-[2.35rem] left-3.5 z-1 size-4 text-white/35"
              />
              <Input
                label="Email address"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={!configured || submitting}
                className="border-white/12 bg-white/5 pl-10 text-white placeholder:text-white/30 focus:border-brand-400 dark:bg-white/5 dark:text-white"
                containerClassName="[&_label]:text-white/70"
              />
            </div>

            <div className="relative">
              <Lock
                aria-hidden
                className="pointer-events-none absolute top-[2.35rem] left-3.5 z-1 size-4 text-white/35"
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!configured || submitting}
                className="border-white/12 bg-white/5 px-10 text-white placeholder:text-white/30 focus:border-brand-400 dark:bg-white/5 dark:text-white"
                containerClassName="[&_label]:text-white/70"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-[2.15rem] right-3 z-1 p-1 text-white/40 transition-colors hover:text-white/80"
              >
                {showPassword ? (
                  <EyeOff aria-hidden className="size-4" />
                ) : (
                  <Eye aria-hidden className="size-4" />
                )}
              </button>
            </div>

            {displayError && (
              <p
                role="alert"
                className="flex gap-2.5 rounded-xl border border-red-400/25 bg-red-400/10 p-3.5 text-[13px] leading-relaxed text-red-200"
              >
                <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                {displayError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={submitting}
              disabled={!configured}
            >
              Sign in
            </Button>

            <button
              type="button"
              onClick={handleReset}
              disabled={!configured}
              className="w-full text-center text-[13px] text-white/45 transition-colors hover:text-white/80 disabled:opacity-50"
            >
              Forgot your password?
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-white/30">
          This area is monitored. Unauthorised access attempts are logged.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-navy-950" />}>
      <LoginForm />
    </Suspense>
  );
}
