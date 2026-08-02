"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Icon, ICON_CHOICES } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

export function AdminPageHeader({
  title,
  description,
  backHref,
  actions,
}: {
  title: string;
  description?: string;
  backHref?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:text-brand-600 dark:text-navy-400"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            Back
          </Link>
        )}
        <h2 className="font-display text-xl font-semibold text-navy-950 sm:text-2xl dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-navy-500 dark:text-navy-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-navy-200 bg-white shadow-soft dark:border-navy-800 dark:bg-navy-900",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Loading / empty                                                     */
/* ------------------------------------------------------------------ */

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-navy-200 bg-white py-20 dark:border-navy-800 dark:bg-navy-900"
    >
      <Loader2 aria-hidden className="size-5 animate-spin text-brand-600" />
      <p className="text-sm text-navy-500 dark:text-navy-400">{label}</p>
    </div>
  );
}

export function AdminEmpty({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center dark:border-navy-700 dark:bg-navy-900/50">
      {icon && (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-400 dark:bg-navy-800">
          {icon}
        </span>
      )}
      <h3 className="text-base font-semibold text-navy-900 dark:text-white">{title}</h3>
      {description && (
        <p className="max-w-md text-[13.5px] leading-relaxed text-navy-500 dark:text-navy-400">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} size="sm" className="mt-2">
          <Plus aria-hidden className="size-4" />
          {actionLabel}
        </ButtonLink>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button size="sm" className="mt-2" onClick={onAction}>
          <Plus aria-hidden className="size-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Search input                                                        */
/* ------------------------------------------------------------------ */

export function AdminSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("relative w-full sm:w-72", className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pr-9 pl-10 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-navy-50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-navy-400 transition-colors hover:text-navy-700 dark:hover:text-navy-200"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  destructive = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-navy-950/60 p-5 backdrop-blur-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(event) => {
            if (event.target === event.currentTarget && !busy) onCancel();
          }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-2xl border border-navy-200 bg-white p-6 shadow-lift dark:border-navy-800 dark:bg-navy-900"
          >
            <span
              aria-hidden
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl",
                destructive
                  ? "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400"
                  : "bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-400",
              )}
            >
              <AlertTriangle className="size-5.5" />
            </span>

            <h2
              id="confirm-title"
              className="mt-4 text-lg font-semibold text-navy-950 dark:text-white"
            >
              {title}
            </h2>
            <p
              id="confirm-message"
              className="mt-2 text-[13.5px] leading-relaxed text-navy-600 dark:text-navy-300"
            >
              {message}
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button variant="outline" onClick={onCancel} disabled={busy}>
                Cancel
              </Button>
              <Button
                ref={confirmRef}
                variant={destructive ? "danger" : "primary"}
                onClick={onConfirm}
                loading={busy}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Reorder controls                                                    */
/* ------------------------------------------------------------------ */

export function ReorderControls({
  onUp,
  onDown,
  isFirst,
  isLast,
  disabled,
}: {
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-navy-200 dark:border-navy-700">
      <button
        type="button"
        onClick={onUp}
        disabled={isFirst || disabled}
        aria-label="Move up"
        className="flex size-6 items-center justify-center text-navy-500 transition-colors hover:bg-navy-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-navy-400 dark:hover:bg-navy-800"
      >
        <ChevronUp aria-hidden className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={isLast || disabled}
        aria-label="Move down"
        className="flex size-6 items-center justify-center border-t border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-navy-700 dark:text-navy-400 dark:hover:bg-navy-800"
      >
        <ChevronDown aria-hidden className="size-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tag input                                                           */
/* ------------------------------------------------------------------ */

export function TagInput({
  values,
  onChange,
  label,
  placeholder = "Type and press Enter",
  description,
  error,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  label: string;
  placeholder?: string;
  description?: string;
  error?: string;
}) {
  const [draft, setDraft] = useState("");
  const id = useId();

  function commit(raw: string) {
    // Support pasting a comma-separated list in one go.
    const additions = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && !values.includes(entry));

    if (additions.length > 0) onChange([...values, ...additions]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-navy-800 dark:text-navy-200">
        {label}
      </label>
      {description && (
        <p className="text-xs leading-relaxed text-navy-500 dark:text-navy-400">{description}</p>
      )}

      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-xl border bg-white p-2.5 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/12 dark:bg-navy-950",
          error ? "border-red-400" : "border-navy-200 dark:border-navy-700",
        )}
      >
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 py-1 pr-1 pl-2.5 text-[12.5px] font-medium text-brand-700 dark:bg-brand-500/12 dark:text-brand-300"
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              aria-label={`Remove ${value}`}
              className="flex size-4.5 items-center justify-center rounded-md transition-colors hover:bg-brand-200/70 dark:hover:bg-brand-500/25"
            >
              <X aria-hidden className="size-3" />
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={draft}
          placeholder={values.length === 0 ? placeholder : ""}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              commit(draft);
            } else if (event.key === "Backspace" && !draft && values.length > 0) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
          className="min-w-40 flex-1 bg-transparent px-1 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none dark:text-navy-50"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Icon picker                                                         */
/* ------------------------------------------------------------------ */

export function IconPicker({
  value,
  onChange,
  label = "Icon",
}: {
  value: string;
  onChange: (name: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const matches = ICON_CHOICES.filter((name) =>
    name.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-navy-800 dark:text-navy-200">{label}</span>

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-expanded={open}
        className="flex items-center justify-between gap-3 rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm transition-colors hover:border-brand-400 dark:border-navy-700 dark:bg-navy-950"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-300">
            <Icon name={value} className="size-4" />
          </span>
          <span className="font-medium text-navy-900 dark:text-navy-50">{value || "Choose…"}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-navy-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="rounded-xl border border-navy-200 bg-white p-3 dark:border-navy-700 dark:bg-navy-950">
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter icons…"
            className="mb-3 w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-[13px] focus:border-brand-500 focus:outline-none dark:border-navy-700 dark:bg-navy-900"
          />
          <div className="scrollbar-slim grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
            {matches.map((name) => (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                aria-pressed={value === name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setFilter("");
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border transition-colors",
                  value === name
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                    : "border-transparent text-navy-500 hover:border-navy-200 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-800",
                )}
              >
                <Icon name={name} className="size-4" />
              </button>
            ))}
            {matches.length === 0 && (
              <p className="col-span-full py-6 text-center text-[13px] text-navy-400">
                No icons match &ldquo;{filter}&rdquo;.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky save bar                                                     */
/* ------------------------------------------------------------------ */

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-4 mt-8 border-t border-navy-200 bg-white/92 px-4 py-3.5 backdrop-blur-lg sm:-mx-6 sm:px-6 dark:border-navy-800 dark:bg-navy-950/92">
      <div className="flex items-center justify-between gap-4">
        <p
          className="text-[13px] text-navy-500 dark:text-navy-400"
          role="status"
          aria-live="polite"
        >
          {saving
            ? "Saving…"
            : dirty
              ? "You have unsaved changes."
              : "All changes are saved."}
        </p>
        <div className="flex items-center gap-2">
          {onReset && dirty && !saving && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Discard
            </Button>
          )}
          <Button size="sm" onClick={onSave} loading={saving} disabled={!dirty && !saving}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
