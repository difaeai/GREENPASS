import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Applies the muted background used to separate adjacent sections. */
  muted?: boolean;
  /** Vertical rhythm. `none` when the child controls its own padding. */
  spacing?: "none" | "sm" | "md" | "lg";
}

const SPACING = {
  none: "",
  sm: "py-14 sm:py-16",
  md: "py-18 sm:py-24",
  lg: "py-24 sm:py-32",
} as const;

export function Section({
  id,
  children,
  className,
  muted = false,
  spacing = "md",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        SPACING[spacing],
        muted && "bg-navy-50/70 dark:bg-navy-900/40",
        className,
      )}
    >
      {children}
    </section>
  );
}

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-brand-50 px-3.5 py-1.5",
        "text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700",
        "dark:border-brand-500/25 dark:bg-brand-500/10 dark:text-brand-300",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  heading: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  /** Renders the heading as `h1`. Use once per page. */
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag
        className={cn(
          "font-semibold text-navy-950 dark:text-white",
          Tag === "h1"
            ? "text-4xl leading-[1.08] sm:text-5xl lg:text-6xl"
            : "text-3xl leading-[1.12] sm:text-4xl lg:text-[2.75rem]",
          centered ? "max-w-3xl" : "max-w-2xl",
        )}
      >
        {heading}
      </Tag>
      {description && (
        <p
          className={cn(
            "text-[15px] leading-relaxed text-navy-600 sm:text-base dark:text-navy-300",
            centered ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
