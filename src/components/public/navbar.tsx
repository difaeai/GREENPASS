"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/public/logo";
import { ThemeToggle } from "@/components/public/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn, toDialString } from "@/lib/utils";
import type { WebsiteSettings } from "@/types";

/**
 * Sticky navigation.
 *
 * Transparent over the homepage hero, then swaps to a solid glass bar once the
 * user scrolls past it. Every other route starts solid.
 */
export function Navbar({ settings }: { settings: WebsiteSettings }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const overHero = pathname === "/";
  const solid = scrolled || !overHero || mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // Read the position once on mount: the browser restores scroll after
    // hydration, so the initial value cannot be derived during SSR without
    // causing a hydration mismatch.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation. Navigation is an external event, not
  // something derivable from render.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMobileOpen(false), [pathname]);

  // Lock body scroll and wire up Escape while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
      >
        Skip to content
      </a>

      {/* Utility strip — always visible with green banner. */}
      <div
        className="band-blue overflow-hidden border-b border-white/10"
      >
        <div className="container-page flex h-10 items-center justify-between text-[12.5px]">
          <div className="flex items-center gap-6 text-white/70">
            <a
              href={`mailto:${settings?.email || "contact@msgreenpass.com"}`}
              className="flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail aria-hidden className="size-3.5" />
              {settings?.email || "contact@msgreenpass.com"}
            </a>
            {(settings?.phone || settings?.whatsapp) && (
              <a
                href={settings?.phone ? `tel:${toDialString(settings.phone)}` : (settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}` : "#")}
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone aria-hidden className="size-3.5" />
                {settings?.phone || settings?.whatsapp || "+92 300 4109593"}
              </a>
            )}
          </div>
          <p className="text-white/55">{settings?.tagline || "Unlocking Pakistan's land, resources, and energy potential"}</p>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          solid
            ? "glass-panel border-b shadow-[0_1px_0_0_rgba(16,34,64,0.06)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Main navigation"
          className="container-page flex h-17 items-center justify-between gap-4"
        >
          <Logo settings={settings} variant={solid ? "auto" : "onDark"} />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                      solid
                        ? active
                          ? "text-brand-700 dark:text-brand-300"
                          : "text-navy-600 hover:text-navy-950 dark:text-navy-300 dark:hover:text-white"
                        : active
                          ? "text-white"
                          : "text-white/75 hover:text-white",
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full",
                          solid ? "bg-brand-500" : "bg-white",
                        )}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle className={cn(!solid && "border-white/25 bg-white/10")} />

            <ButtonLink href="/contact" size="sm" className="hidden lg:inline-flex">
              Get a quote
              <ArrowRight aria-hidden className="size-3.5" />
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border transition-colors lg:hidden",
                solid
                  ? "border-navy-200 text-navy-800 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-100 dark:hover:bg-navy-900"
                  : "border-white/25 text-white hover:bg-white/10",
              )}
            >
              {mobileOpen ? (
                <X aria-hidden className="size-5" />
              ) : (
                <Menu aria-hidden className="size-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-navy-950/45 backdrop-blur-xs lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 top-17 z-45 mx-4 overflow-hidden rounded-3xl border border-navy-200 bg-white shadow-lift lg:hidden dark:border-navy-800 dark:bg-navy-950"
            >
              <ul className="flex flex-col p-2.5">
                {PUBLIC_NAV.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                          active
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300"
                            : "text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-900",
                        )}
                      >
                        {item.label}
                        <ArrowRight aria-hidden className="size-4 opacity-40" />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-3 border-t border-navy-100 p-4 dark:border-navy-800">
                <ButtonLink href="/contact" className="w-full">
                  Get a quote
                  <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
                <div className="flex flex-col gap-2 text-[13px] text-navy-500 dark:text-navy-400">
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
                  >
                    <Mail aria-hidden className="size-4" />
                    {settings.email}
                  </a>
                  {settings.phone && (
                    <a
                      href={`tel:${toDialString(settings.phone)}`}
                      className="flex items-center gap-2.5 transition-colors hover:text-brand-600"
                    >
                      <Phone aria-hidden className="size-4" />
                      {settings.phone}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
