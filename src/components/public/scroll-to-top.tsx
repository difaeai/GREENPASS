"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

/** Appears after the first viewport of scrolling; returns to the top on click. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth",
            })
          }
          aria-label="Scroll back to top"
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full bg-navy-950 text-white shadow-lift transition-colors hover:bg-brand-600 sm:right-8 sm:bottom-8 dark:bg-white dark:text-navy-950 dark:hover:bg-brand-500 dark:hover:text-white"
        >
          <ArrowUp aria-hidden className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
