"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Bot, Info, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What sectors do you work in?",
  "Tell me about your mandates",
  "Who leads the company?",
  "How do I request a briefing?",
];

/**
 * Website assistant.
 *
 * Streams answers from `/api/chat`, which grounds the model in this site's own
 * content. The panel traps focus while open, closes on Escape, and aborts the
 * in-flight request if the visitor closes it mid-answer.
 */
export function ChatWidget({ companyName }: { companyName: string }) {
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the transcript pinned to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // Escape to close, and focus the composer on open.
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => inputRef.current?.focus(), 220);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Abandon any in-flight answer when the panel closes.
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setStreaming(false);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || streaming) return;

      setError(null);
      setInput("");

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: question,
      };
      const assistantId = `a-${Date.now()}`;

      // Build the history from the state we have *now* — reading it inside the
      // updater would mean posting a list that already contains the empty
      // assistant placeholder.
      const history = [...messages, userMessage].map((message) => ({
        role: message.role,
        content: message.content,
      }));

      setMessages((current) => [
        ...current,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (response.headers.get("X-Assistant-Mode") === "fallback") {
          setFallbackMode(true);
        }

        if (!response.ok) {
          const detail = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(detail?.error ?? "The assistant is unavailable right now.");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("The assistant returned an empty response.");

        const decoder = new TextDecoder();
        let assembled = "";

        // Stream tokens straight into the placeholder message.
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          assembled += decoder.decode(value, { stream: true });
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: assembled } : message,
            ),
          );
        }

        if (!assembled.trim()) {
          throw new Error("The assistant didn't return an answer. Please try again.");
        }
      } catch (sendError) {
        if ((sendError as Error).name === "AbortError") return;

        const message =
          sendError instanceof Error
            ? sendError.message
            : "Something went wrong. Please try again.";
        setError(message);
        // Drop the empty placeholder so the transcript stays clean.
        setMessages((current) => current.filter((entry) => entry.id !== assistantId));
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [messages, streaming],
  );

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        aria-controls="site-assistant"
        aria-label={open ? "Close the assistant" : `Ask ${companyName} a question`}
        className={cn(
          "group relative flex size-13 items-center justify-center rounded-full text-white shadow-[0_12px_30px_-10px_rgb(37_99_235_/_0.75)]",
          "transition-transform duration-200 hover:scale-105 active:scale-95",
          "bg-linear-135 from-brand-700 to-accent-500",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.16 }}
            >
              <X aria-hidden className="size-5.5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.16 }}
            >
              <Sparkles aria-hidden className="size-5.5" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Attention pulse, only before first use and never under reduced motion. */}
        {!open && !reduceMotion && messages.length === 0 && (
          <span
            aria-hidden
            className="absolute inset-0 -z-1 animate-ping rounded-full bg-brand-500/40 [animation-duration:2.8s]"
          />
        )}

        <span
          aria-hidden
          className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-navy-950 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 lg:block"
        >
          Ask a question
        </span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-assistant"
            ref={panelRef}
            role="dialog"
            aria-label={`${companyName} assistant`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 bottom-16 flex h-[min(34rem,70svh)] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-lift dark:border-navy-800 dark:bg-navy-900"
          >
            {/* Header */}
            <div className="band-blue flex shrink-0 items-center gap-3 px-4 py-3.5">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-white/20"
              >
                <Bot className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{companyName} assistant</p>
                <p className="text-[11.5px] text-white/70">
                  {streaming ? "Typing…" : "Ask about our sectors and mandates"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close the assistant"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>

            {/* Transcript */}
            <div
              ref={scrollRef}
              className="scrollbar-slim flex-1 space-y-3 overflow-y-auto p-4"
              aria-live="polite"
              aria-atomic="false"
            >
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-[13.5px] leading-relaxed text-navy-600 dark:text-navy-300">
                    Hello. I can answer questions about {companyName} — our focus sectors, active
                    mandates, and how to get in touch. What would you like to know?
                  </p>
                  <ul className="space-y-1.5">
                    {SUGGESTIONS.map((suggestion) => (
                      <li key={suggestion}>
                        <button
                          type="button"
                          onClick={() => send(suggestion)}
                          className="w-full rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2 text-left text-[13px] text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:border-navy-700 dark:bg-navy-800/60 dark:text-brand-200 dark:hover:border-brand-500/50"
                        >
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap",
                      message.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-navy-50 text-navy-800 dark:bg-navy-800 dark:text-navy-100",
                    )}
                  >
                    {message.content || (
                      <span className="inline-flex gap-1" aria-label="Thinking">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="size-1.5 animate-bounce rounded-full bg-navy-400"
                            style={{ animationDelay: `${dot * 0.15}s` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              {fallbackMode && (
                <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11.5px] leading-relaxed text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                  <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                  Running in basic mode — answers are matched from the site content rather than
                  generated. Set ANTHROPIC_API_KEY to enable the full assistant.
                </p>
              )}
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-brand-100 p-3 dark:border-navy-800">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send(input);
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="assistant-input" className="sr-only">
                  Ask a question
                </label>
                <textarea
                  id="assistant-input"
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(input);
                    }
                  }}
                  placeholder="Ask about our sectors…"
                  disabled={streaming}
                  className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-navy-200 bg-white px-3 py-2.5 text-[13.5px] text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none disabled:opacity-60 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-50"
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  aria-label="Send"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
                >
                  {streaming ? (
                    <span
                      aria-hidden
                      className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                  ) : (
                    <ArrowUp aria-hidden className="size-4" />
                  )}
                </button>
              </form>

              <p className="mt-2 text-center text-[10.5px] leading-relaxed text-navy-400">
                Answers come from this site&apos;s content and may be incomplete.{" "}
                <Link href="/contact" className="underline underline-offset-2 hover:text-brand-600">
                  Contact us
                </Link>{" "}
                for anything specific.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
