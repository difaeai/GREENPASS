"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Form primitives shared by the public contact form and the whole admin panel.
 * Each control wires up its own label/description/error ids so screen readers
 * announce the full context without callers having to think about it.
 */

const CONTROL_BASE =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-900 shadow-xs transition-colors " +
  "placeholder:text-navy-400 " +
  "focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/12 " +
  "disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400 " +
  "dark:bg-navy-950 dark:text-navy-50 dark:placeholder:text-navy-500 dark:disabled:bg-navy-900";

const CONTROL_BORDER = "border-navy-200 dark:border-navy-700";
const CONTROL_ERROR = "border-red-400 focus:border-red-500 focus:ring-red-500/15 dark:border-red-500/60";

interface FieldShellProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  className?: string;
  children: ReactNode;
  descriptionId: string;
  errorId: string;
}

function FieldShell({
  label,
  description,
  error,
  required,
  htmlFor,
  className,
  children,
  descriptionId,
  errorId,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium text-navy-800 dark:text-navy-200"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {description && (
        <p id={descriptionId} className="text-xs leading-relaxed text-navy-500 dark:text-navy-400">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- Input -------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, description, error, containerClassName, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <FieldShell
      label={label}
      description={description}
      error={error}
      required={required}
      htmlFor={inputId}
      className={containerClassName}
      descriptionId={descriptionId}
      errorId={errorId}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(description && descriptionId, error && errorId) || undefined}
        className={cn(CONTROL_BASE, error ? CONTROL_ERROR : CONTROL_BORDER, className)}
        {...props}
      />
    </FieldShell>
  );
});

/* ------------------------------- Textarea ------------------------------- */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, description, error, containerClassName, className, id, required, rows = 5, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <FieldShell
      label={label}
      description={description}
      error={error}
      required={required}
      htmlFor={inputId}
      className={containerClassName}
      descriptionId={descriptionId}
      errorId={errorId}
    >
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(description && descriptionId, error && errorId) || undefined}
        className={cn(CONTROL_BASE, "resize-y", error ? CONTROL_ERROR : CONTROL_BORDER, className)}
        {...props}
      />
    </FieldShell>
  );
});

/* -------------------------------- Select -------------------------------- */

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, description, error, containerClassName, className, id, required, children, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <FieldShell
      label={label}
      description={description}
      error={error}
      required={required}
      htmlFor={inputId}
      className={containerClassName}
      descriptionId={descriptionId}
      errorId={errorId}
    >
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(description && descriptionId, error && errorId) || undefined}
        className={cn(CONTROL_BASE, "cursor-pointer pr-9", error ? CONTROL_ERROR : CONTROL_BORDER, className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
});

/* -------------------------------- Switch -------------------------------- */

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  const id = useId();

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-[13px] font-medium text-navy-800 dark:text-navy-200">
          {label}
        </label>
        {description && (
          <p className="text-xs leading-relaxed text-navy-500 dark:text-navy-400">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-brand-600" : "bg-navy-300 dark:bg-navy-700",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

/* ------------------------------ Field group ----------------------------- */

export function FieldGroup({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-card p-5 sm:p-6", className)}>
      <div className="mb-5 border-b border-navy-100 pb-4 dark:border-navy-800">
        <h2 className="text-base font-semibold text-navy-900 dark:text-navy-50">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-navy-500 dark:text-navy-400">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
