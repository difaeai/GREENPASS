"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Route-level error boundary. Next.js strips the message in production
 * builds and gives us a `digest` to correlate against the server logs.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Unhandled render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-5 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400">
        <AlertTriangle aria-hidden className="size-7" />
      </span>

      <h1 className="mt-6 text-2xl font-semibold text-navy-950 sm:text-3xl dark:text-white">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-navy-600 dark:text-navy-300">
        We hit an unexpected error loading this page. Trying again usually clears it — if it
        doesn&apos;t, please get in touch and we&apos;ll take a look.
      </p>

      {error.digest && (
        <p className="mt-4 rounded-lg bg-navy-50 px-3 py-1.5 font-mono text-xs text-navy-500 dark:bg-navy-900 dark:text-navy-400">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} size="lg">
          <RotateCw aria-hidden className="size-4" />
          Try again
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </div>
  );
}
