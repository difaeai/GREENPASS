import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/public/logo";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { SOCIAL_ICONS, SOCIAL_LABELS } from "@/components/ui/social-icons";
import { PUBLIC_NAV } from "@/lib/constants";
import { toDialString } from "@/lib/utils";
import type { Service, WebsiteSettings } from "@/types";

type SocialKey = keyof typeof SOCIAL_ICONS;

/**
 * Light footer: a soft blue wash with royal-blue accents, so the page never
 * ends on a dark slab. The newsletter block is the one saturated element,
 * which keeps the subscribe action the clear focal point.
 */
export function Footer({ settings, services }: FooterProps) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(settings.social ?? {}).filter(
    (entry): entry is [SocialKey, string] => Boolean(entry[1]) && entry[0] in SOCIAL_ICONS,
  );

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-brand-100 bg-linear-to-b from-brand-50/60 to-white dark:border-navy-800 dark:from-navy-900 dark:to-navy-950">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 size-96 rounded-full bg-brand-400/8 blur-3xl"
      />

      <div className="relative container-page">
        {/* Newsletter — the one saturated block */}
        <div className="band-blue mt-14 grid gap-8 rounded-4xl px-7 py-10 shadow-[0_18px_46px_-18px_rgb(37_99_235_/_0.55)] sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Engineering notes, once a month
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">
              Practical writing on architecture, delivery and the things that actually break in
              production. No sales sequences, unsubscribe in one click.
            </p>
          </div>
          <NewsletterForm className="lg:max-w-md lg:justify-self-end" />
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo settings={settings} showTagline />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-navy-600 dark:text-navy-300">
              {settings.footerText}
            </p>

            {socialEntries.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {socialEntries.map(([key, href]) => {
                  const IconComponent = SOCIAL_ICONS[key];
                  return (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={SOCIAL_LABELS[key]}
                        className="flex size-9.5 items-center justify-center rounded-full border border-brand-200 bg-white text-navy-500 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-600 hover:text-white dark:border-navy-700 dark:bg-navy-900 dark:text-navy-300"
                      >
                        <IconComponent className="size-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav className="lg:col-span-2" aria-labelledby="footer-company">
            <h3
              id="footer-company"
              className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-400"
            >
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-navy-600 transition-colors hover:text-brand-700 dark:text-navy-300 dark:hover:text-brand-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-3" aria-labelledby="footer-services">
            <h3
              id="footer-services"
              className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-400"
            >
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-navy-600 transition-colors hover:text-brand-700 dark:text-navy-300 dark:hover:text-brand-300"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              {services.length === 0 && (
                <li>
                  <Link
                    href="/services"
                    className="text-sm text-navy-600 transition-colors hover:text-brand-700 dark:text-navy-300"
                  >
                    View all services
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.16em] text-brand-700 uppercase dark:text-brand-400">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3.5 text-sm">
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <address className="whitespace-pre-line text-navy-600 not-italic dark:text-navy-300">
                  {settings.address}
                </address>
              </li>
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                  <a
                    href={`tel:${toDialString(settings.phone)}`}
                    className="text-navy-600 transition-colors hover:text-brand-700 dark:text-navy-300 dark:hover:text-brand-300"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-navy-600 transition-colors hover:text-brand-700 dark:text-navy-300 dark:hover:text-brand-300"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-100 py-6 text-[13px] text-navy-500 sm:flex-row dark:border-navy-800 dark:text-navy-400">
          <p>
            &copy; {year} {settings.copyrightText}
          </p>
          <p>
            Built by{" "}
            <Link
              href="/about"
              className="font-medium text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400"
            >
              {settings.companyName}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

interface FooterProps {
  settings: WebsiteSettings;
  services: Service[];
}
