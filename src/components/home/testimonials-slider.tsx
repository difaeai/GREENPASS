"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TestimonialCard } from "@/components/public/cards";
import { SectionHeading } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { HomeSectionHeading, Testimonial } from "@/types";

const AUTOPLAY_MS = 8000;

/**
 * Testimonial carousel showing one card on mobile and two on large screens.
 * Autoplay pauses on hover/focus and never runs under reduced motion.
 */
export function TestimonialsSlider({
  heading,
  testimonials,
}: {
  heading: HomeSectionHeading;
  testimonials: Testimonial[];
}) {
  const reduceMotion = useReducedMotion();
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(1);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setPerPage(query.matches ? 2 : 1);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const pageCount = Math.max(1, Math.ceil(testimonials.length / perPage));

  // Derived rather than corrected in an effect: when the viewport changes the
  // page size, a now-out-of-range `page` simply clamps on the next render.
  const currentPage = Math.min(page, pageCount - 1);

  const next = useCallback(
    () => setPage((p) => (Math.min(p, pageCount - 1) + 1) % pageCount),
    [pageCount],
  );
  const previous = useCallback(
    () => setPage((p) => (Math.min(p, pageCount - 1) - 1 + pageCount) % pageCount),
    [pageCount],
  );

  useEffect(() => {
    if (reduceMotion || paused || pageCount <= 1) return;
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [currentPage, paused, pageCount, next, reduceMotion]);

  if (testimonials.length === 0) return null;

  const visible = testimonials.slice(currentPage * perPage, currentPage * perPage + perPage);

  return (
    <section
      className="bg-navy-50/70 py-18 sm:py-24 dark:bg-navy-900/40"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="container-page">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={heading.eyebrow}
            heading={heading.heading}
            description={heading.description}
            align="left"
          />

          {pageCount > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previous}
                aria-label="Previous testimonials"
                className="flex size-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-200 dark:hover:border-brand-500"
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonials"
                className="flex size-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-200 dark:hover:border-brand-500"
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-12" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentPage}-${perPage}`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {visible.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {pageCount > 1 && (
          <div className="mt-9 flex justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={`Go to testimonial page ${i + 1}`}
                aria-current={i === currentPage ? "true" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentPage
                    ? "w-8 bg-brand-600 dark:bg-brand-400"
                    : "w-4 bg-navy-300 hover:bg-navy-400 dark:bg-navy-700 dark:hover:bg-navy-600",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
