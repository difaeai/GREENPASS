"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * `next/image` with the three things every image on this site needs:
 * lazy loading by default, a shimmer placeholder while it decodes, and a
 * graceful fallback when an admin-supplied URL 404s.
 */

type SmartImageProps = Omit<ImageProps, "onLoad" | "onError" | "src"> & {
  src?: string | null;
  /** Rendered in place of the image when `src` is empty or fails to load. */
  fallbackLabel?: string;
  wrapperClassName?: string;
};

export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackLabel,
  fill,
  sizes,
  priority,
  ...props
}: SmartImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const hasSrc = Boolean(src && src.trim());

  if (!hasSrc || status === "error") {
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? alt : fallbackLabel}
        className={cn(
          "flex items-center justify-center bg-linear-135 from-navy-100 via-navy-50 to-brand-50",
          "text-xs font-medium tracking-wide text-navy-400 uppercase",
          "dark:from-navy-900 dark:via-navy-950 dark:to-navy-900 dark:text-navy-500",
          fill ? "absolute inset-0" : "size-full",
          wrapperClassName,
          className,
        )}
      >
        {fallbackLabel ?? "No image"}
      </div>
    );
  }

  return (
    <>
      {status === "loading" && (
        <span
          aria-hidden
          className={cn("skeleton absolute inset-0 z-1", !fill && "size-full")}
        />
      )}
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        sizes={sizes ?? (fill ? "(max-width: 768px) 100vw, 50vw" : undefined)}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={cn(
          "transition-opacity duration-700",
          status === "loaded" ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    </>
  );
}
