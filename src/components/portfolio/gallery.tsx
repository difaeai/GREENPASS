"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { PortfolioImage } from "@/types";

/**
 * Project gallery with a full-screen lightbox.
 *
 * The dialog traps focus, closes on Escape or backdrop click, restores focus
 * to the thumbnail that opened it, and supports arrow-key navigation.
 */
export function ProjectGallery({
  images,
  title,
}: {
  images: PortfolioImage[];
  title: string;
}) {
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const isOpen = openIndex !== null;

  const close = useCallback(() => {
    setOpenIndex((current) => {
      if (current !== null) triggerRefs.current[current]?.focus();
      return null;
    });
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      });
    },
    [images.length],
  );

  // Escape / arrow keys, body scroll lock, and initial focus.
  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Tab") {
        // Only the dialog's own controls are focusable while it is open.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close, step]);

  if (images.length === 0) return null;

  const active = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <button
              type="button"
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              onClick={() => setOpenIndex(index)}
              aria-label={`Open image ${index + 1} of ${images.length} full screen`}
              className="group relative block aspect-4/3 w-full overflow-hidden rounded-2xl bg-navy-100 ring-1 ring-navy-200/70 transition-all duration-300 hover:ring-brand-400 dark:bg-navy-900 dark:ring-navy-800"
            >
              <SmartImage
                src={image.url}
                alt={image.alt || `${title} — screenshot ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-navy-950/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
              >
                <Expand className="size-6 text-white" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {isOpen && active && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/92 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${title} — image ${openIndex + 1} of ${images.length}`}
              tabIndex={-1}
              className="relative flex size-full max-w-6xl flex-col outline-none"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 pb-4 text-white">
                <p className="text-sm tabular-nums text-white/70">
                  {openIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close the image viewer"
                  className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                >
                  <X aria-hidden className="size-5" />
                </button>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={openIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SmartImage
                      src={active.url}
                      alt={active.alt || `${title} — screenshot ${openIndex + 1}`}
                      fill
                      priority
                      sizes="100vw"
                      quality={92}
                      className="object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {images.length > 1 && (
                <div className="flex shrink-0 items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                  >
                    <ChevronLeft aria-hidden className="size-5" />
                  </button>

                  <ol className="flex items-center gap-1.5">
                    {images.map((image, index) => (
                      <li key={`dot-${index}`}>
                        <button
                          type="button"
                          onClick={() => setOpenIndex(index)}
                          aria-label={`Show image ${index + 1}`}
                          aria-current={index === openIndex ? "true" : undefined}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            index === openIndex ? "w-7 bg-white" : "w-3 bg-white/30 hover:bg-white/60",
                          )}
                        />
                      </li>
                    ))}
                  </ol>

                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                  >
                    <ChevronRight aria-hidden className="size-5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
