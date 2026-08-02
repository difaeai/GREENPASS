"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

/**
 * Footer subscription form. Posts to `/api/newsletter`, which owns the
 * validation and the Firestore write — the client never touches the
 * collection directly.
 */
export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "footer" }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Subscription failed. Please try again.");
      }

      setStatus("done");
      setEmail("");
      toast.success("You're subscribed — thanks for joining.");
    } catch (err) {
      setStatus("idle");
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3.5 text-sm text-emerald-200",
          className,
        )}
      >
        <CheckCircle2 aria-hidden className="size-4.5 shrink-0" />
        You&apos;re on the list. Watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 p-1.5 backdrop-blur-sm transition-colors focus-within:border-brand-400/60 focus-within:bg-white/12">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          disabled={status === "submitting"}
          className="min-w-0 flex-1 bg-transparent px-3.5 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-r from-brand-600 to-brand-400 text-white transition-transform duration-200 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          aria-label="Subscribe to the newsletter"
        >
          {status === "submitting" ? (
            <span
              aria-hidden
              className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            />
          ) : (
            <ArrowRight aria-hidden className="size-4" />
          )}
        </button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="mt-2 pl-4 text-xs text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
