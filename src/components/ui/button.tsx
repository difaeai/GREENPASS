import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn, isExternalUrl } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "glass";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-r from-brand-700 to-brand-500 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.7)] hover:from-brand-600 hover:to-brand-400 hover:shadow-[0_14px_38px_-10px_rgba(37,99,235,0.8)] active:scale-[0.985]",
  secondary:
    "bg-navy-950 text-white hover:bg-navy-800 dark:bg-white dark:text-navy-950 dark:hover:bg-navy-100",
  outline:
    "border border-navy-200 bg-transparent text-navy-900 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 dark:border-navy-700 dark:text-navy-100 dark:hover:border-brand-500 dark:hover:bg-navy-900 dark:hover:text-brand-300",
  ghost:
    "bg-transparent text-navy-700 hover:bg-navy-100 hover:text-navy-950 dark:text-navy-300 dark:hover:bg-navy-900 dark:hover:text-white",
  danger:
    "bg-red-600 text-white hover:bg-red-500 active:scale-[0.985] dark:bg-red-600 dark:hover:bg-red-500",
  glass:
    "glass-panel text-white hover:bg-white/25 dark:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3.5 text-[13px]",
  md: "h-11 gap-2 px-5 text-sm",
  lg: "h-13 gap-2.5 px-7 text-[15px]",
  icon: "size-10 justify-center",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 " +
  "disabled:pointer-events-none disabled:opacity-55 whitespace-nowrap select-none";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

/** Same visual language as `Button`, but renders an anchor. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ariaLabel,
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
