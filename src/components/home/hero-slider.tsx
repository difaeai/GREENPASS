"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { HomeBanner } from "@/types";

const AUTOPLAY_MS = 7000;

/**
 * Full-screen hero carousel.
 *
 * Accessibility notes: the region is labelled and marked `aria-roledescription
 * ="carousel"`, autoplay pauses on hover/focus and can be stopped outright,
 * and it never starts for visitors who prefer reduced motion.
 */
export function HeroSlider({ banners }: { banners: HomeBanner[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = banners.length;

  const goTo = useCallback(
    (target: number) => {
      if (count === 0) return;
      setIndex(((target % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const previous = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay. Restarts whenever the active slide changes, so a manual
  // navigation gives the visitor a full interval on the new slide.
  useEffect(() => {
    if (reduceMotion || !playing || paused || count <= 1) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, playing, paused, count, next, reduceMotion]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }
  };

  if (count === 0) return null;

  const slide = banners[index];
  const overlay = slide.overlayOpacity ?? 0.68;

  return (
    <section
      aria-label="Featured highlights"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="relative isolate -mt-17 flex min-h-[92svh] items-center overflow-hidden bg-brand-800 pt-17 text-white"
    >
      {/* Background */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.id}
          aria-hidden
          className="absolute inset-0 -z-2"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.9 }, scale: { duration: 8, ease: "linear" } }}
        >
          <SmartImage
            src={slide.backgroundImage}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            quality={85}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Legibility scrim — royal blue rather than near-black, so the hero
          reads as part of the blue-and-white palette instead of a dark slab.
          Still dense enough on the left for white text to clear WCAG AA. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          background: `linear-gradient(100deg, rgba(23,55,138,${overlay}) 0%, rgba(29,78,216,${Math.max(
            overlay - 0.20,
            0.24,
          )}) 55%, rgba(14,165,233,0.34) 100%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-1"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 45% at 12% 85%, rgba(2,132,199,0.32), transparent 65%)",
        }}
      />

      {/* Content */}
      <div className="container-page relative w-full py-20 sm:py-24">
        <div
          className="max-w-3xl"
          aria-live="polite"
          aria-atomic="true"
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${count}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -18 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.smallHeading && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-white/85 uppercase backdrop-blur-sm">
                  <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />
                  {slide.smallHeading}
                </span>
              )}

              <h1 className="mt-6 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl xl:text-[4.2rem]">
                {slide.mainHeading}
              </h1>

              {slide.description && (
                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/72 sm:text-lg">
                  {slide.description}
                </p>
              )}

              {(slide.buttonLabel || slide.secondaryButtonLabel) && (
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  {slide.buttonLabel && slide.buttonLink && (
                    <ButtonLink href={slide.buttonLink} size="lg">
                      {slide.buttonLabel}
                      <ArrowRight aria-hidden className="size-4" />
                    </ButtonLink>
                  )}
                  {slide.secondaryButtonLabel && slide.secondaryButtonLink && (
                    <ButtonLink href={slide.secondaryButtonLink} variant="glass" size="lg">
                      {slide.secondaryButtonLabel}
                    </ButtonLink>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        {count > 1 && (
          <div className="mt-14 flex items-center justify-between gap-6">
            <ol className="flex items-center gap-2.5" aria-label="Choose a slide">
              {banners.map((banner, i) => (
                <li key={banner.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}: ${banner.mainHeading}`}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "h-1 rounded-full transition-all duration-400",
                      i === index
                        ? "w-10 bg-white"
                        : "w-5 bg-white/30 hover:bg-white/55",
                    )}
                  />
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-2">
              <span className="mr-2 hidden text-sm tabular-nums text-white/50 sm:block">
                {String(index + 1).padStart(2, "0")}
                <span className="mx-1 text-white/25">/</span>
                {String(count).padStart(2, "0")}
              </span>

              {!reduceMotion && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
                  className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/45 hover:bg-white/10 hover:text-white"
                >
                  {playing ? (
                    <Pause aria-hidden className="size-4" />
                  ) : (
                    <Play aria-hidden className="size-4" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={previous}
                aria-label="Previous slide"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/45 hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/45 hover:bg-white/10 hover:text-white"
              >
                <ChevronRight aria-hidden className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
