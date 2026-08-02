import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/primitives";
import { Eyebrow } from "@/components/ui/section";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  backgroundImage?: string | null;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared masthead for every interior page.
 *
 * Light by design: a white-to-blue wash with royal-blue accents rather than a
 * dark slab, so interior pages read as an extension of the white page body.
 * Any supplied image sits behind at low opacity as texture, not as a backdrop
 * the text has to fight.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  backgroundImage,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "wash-blue relative isolate overflow-hidden border-b border-brand-100/70 pt-12 pb-14",
        "sm:pt-16 sm:pb-20 dark:border-navy-800",
        className,
      )}
    >
      {backgroundImage && (
        <div aria-hidden className="absolute inset-0 -z-2">
          <SmartImage
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-8 dark:opacity-15"
          />
        </div>
      )}

      {/* Faint grid, masked to the top edge. */}
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-1 opacity-30" />

      {/* Soft blue orb, purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 -z-1 size-80 rounded-full bg-brand-400/12 blur-3xl"
      />

      <div className="container-page">
        <Breadcrumbs items={crumbs} className="text-navy-500 dark:text-navy-400" />

        <div className="mt-7 max-w-3xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}

          <h1 className="mt-5 text-4xl leading-[1.06] font-semibold text-navy-950 sm:text-5xl lg:text-[3.4rem] dark:text-white">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-600 sm:text-lg dark:text-navy-300">
              {description}
            </p>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
