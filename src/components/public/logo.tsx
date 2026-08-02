import Link from "next/link";

import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { WebsiteSettings } from "@/types";

interface LogoProps {
  settings: WebsiteSettings;
  className?: string;
  /** Forces light-on-dark styling, e.g. over the hero or in the footer. */
  variant?: "auto" | "onDark";
  showTagline?: boolean;
}

/**
 * Wordmark with an uploaded-logo path and a typographic fallback, so the site
 * looks finished before anyone uploads a brand asset.
 */
export function Logo({ settings, className, variant = "auto", showTagline = false }: LogoProps) {
  const onDark = variant === "onDark";
  const hasLogo = Boolean(settings.logoLight || settings.logoDark);

  return (
    <Link
      href="/"
      aria-label={`${settings.companyName} — home`}
      className={cn("group flex shrink-0 items-center gap-2.5", className)}
    >
      {hasLogo ? (
        <span className="relative block h-9 w-auto min-w-9">
          {/* Light asset for light UI, dark asset for dark UI. */}
          <SmartImage
            src={settings.logoLight || settings.logoDark}
            alt={settings.companyName}
            width={160}
            height={36}
            priority
            className={cn("h-9 w-auto object-contain", !onDark && "dark:hidden")}
          />
          {!onDark && (settings.logoDark || settings.logoLight) && (
            <SmartImage
              src={settings.logoDark || settings.logoLight}
              alt={settings.companyName}
              width={160}
              height={36}
              priority
              className="hidden h-9 w-auto object-contain dark:block"
            />
          )}
        </span>
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-xl bg-linear-135 from-brand-600 to-accent-500 text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgba(37,99,235,0.75)] transition-transform duration-300 group-hover:scale-105"
        >
          {settings.companyName.slice(0, 1).toUpperCase()}
        </span>
      )}

      {!hasLogo && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[17px] font-semibold tracking-tight",
              onDark ? "text-white" : "text-navy-950 dark:text-white",
            )}
          >
            {settings.companyName}
          </span>
          {showTagline && (
            <span
              className={cn(
                "mt-1 text-[10px] font-medium tracking-[0.14em] uppercase",
                onDark ? "text-white/60" : "text-navy-400 dark:text-navy-400",
              )}
            >
              {settings.tagline}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
