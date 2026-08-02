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
 * Shared masthead for every interior page — keeps About, Services, Portfolio
 * and Contact visually consistent and puts breadcrumbs in one place.
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
        "relative isolate overflow-hidden bg-navy-950 pt-14 pb-16 text-white sm:pt-20 sm:pb-24",
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
            className="object-cover opacity-25"
          />
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 20% 0%, rgba(37,99,235,0.30), transparent 62%), radial-gradient(ellipse 55% 45% at 88% 12%, rgba(14,165,233,0.20), transparent 60%)",
        }}
      />
      <div aria-hidden className="grid-backdrop absolute inset-0 -z-1 opacity-25" />

      <div className="container-page">
        <Breadcrumbs items={crumbs} className="text-white/65" />

        <div className="mt-7 max-w-3xl">
          {eyebrow && (
            <Eyebrow className="border-white/20 bg-white/10 text-white/85">{eyebrow}</Eyebrow>
          )}
          <h1 className="mt-5 text-4xl leading-[1.06] font-semibold sm:text-5xl lg:text-[3.4rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  );
}
