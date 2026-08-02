import { ArrowLeft, Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="wash-blue relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-24 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(37,99,235,0.14), transparent 62%), radial-gradient(ellipse 45% 45% at 82% 90%, rgba(14,165,233,0.10), transparent 60%)",
        }}
      />
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-1 opacity-35" />

      <p
        aria-hidden
        className="font-display text-[7rem] leading-none font-bold tracking-tighter text-transparent sm:text-[11rem]"
        style={{
          backgroundImage: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 45%, #0284c7 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
        }}
      >
        404
      </p>

      <h1 className="mt-2 text-3xl font-semibold text-navy-950 sm:text-4xl dark:text-white">This page doesn&apos;t exist</h1>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-navy-600 dark:text-navy-300">
        The link may be out of date, or the page may have been moved. Here&apos;s the way back.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/" size="lg">
          <Home aria-hidden className="size-4" />
          Back to home
        </ButtonLink>
        <ButtonLink href="/portfolio" variant="outline" size="lg">
          <Search aria-hidden className="size-4" />
          Browse our work
        </ButtonLink>
      </div>

      <nav aria-label="Site sections" className="mt-14 w-full max-w-lg">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-navy-400 uppercase">
          Or jump to
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {PUBLIC_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-navy-600 shadow-xs transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-300"
              >
                <ArrowLeft aria-hidden className="size-3.5 opacity-50" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
