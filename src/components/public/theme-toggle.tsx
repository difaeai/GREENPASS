"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

/**
 * Three-state theme switch. Renders a neutral placeholder until mounted so the
 * server HTML and the first client paint agree.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The active theme is only known on the client. Rendering a neutral
  // placeholder until mount is what keeps the server and client HTML in sync.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-navy-200 bg-navy-50/80 p-0.5",
        "dark:border-navy-700 dark:bg-navy-900/70",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, icon: IconComponent }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors duration-200",
              active
                ? "bg-white text-brand-600 shadow-xs dark:bg-navy-700 dark:text-brand-300"
                : "text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100",
            )}
          >
            <IconComponent aria-hidden className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
