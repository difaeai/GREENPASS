import { MessageCircle } from "lucide-react";

import { whatsappLink } from "@/lib/utils";

/** Floating WhatsApp shortcut, opposite the scroll-to-top control. */
export function WhatsAppButton({ number, company }: { number: string; company: string }) {
  if (!number) return null;

  return (
    <a
      href={whatsappLink(number, `Hi ${company}, I'd like to talk about a project.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 left-5 z-40 flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform duration-200 hover:scale-105 sm:bottom-8 sm:left-8"
    >
      <MessageCircle aria-hidden className="size-5.5" />
      <span
        aria-hidden
        className="pointer-events-none absolute left-full ml-3 hidden rounded-full bg-navy-950 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block dark:bg-white dark:text-navy-950"
      >
        Chat on WhatsApp
      </span>
    </a>
  );
}
