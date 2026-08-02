"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { ChatWidget } from "@/components/public/chat-widget";
import { WhatsAppIcon } from "@/components/ui/social-icons";
import { whatsappLink } from "@/lib/utils";

/**
 * The fixed bottom-right action stack: scroll-to-top, WhatsApp, and the
 * assistant.
 *
 * One container owns all three so they can never overlap each other, and the
 * whole stack is `position: fixed` — it stays put through every scroll and on
 * every page. The assistant panel is positioned relative to this container, so
 * it opens directly above its own launcher.
 */
export function FloatingActions({
  whatsapp,
  companyName,
}: {
  whatsapp: string;
  companyName: string;
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6">
      {/* Scroll to top — only once there's somewhere to scroll back to. */}
      <AnimatePresence>
        {showScrollTop && (
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
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.18 }}
            className="group flex size-10 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-700 shadow-soft transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-navy-700 dark:bg-navy-900 dark:text-brand-300"
          >
            <ArrowUp aria-hidden className="size-4.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* WhatsApp */}
      {whatsapp && (
        <a
          href={whatsappLink(whatsapp, `Hi ${companyName}, I'd like to request a briefing.`)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="group relative flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_26px_-10px_rgb(37_211_102_/_0.8)] transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <WhatsAppIcon className="size-6" />
          <span
            aria-hidden
            className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-navy-950 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block"
          >
            WhatsApp us
          </span>
        </a>
      )}

      {/* Assistant — owns its own panel, anchored to this stack. */}
      <div className="relative">
        <ChatWidget companyName={companyName} />
      </div>
    </div>
  );
}
