import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/public/logo";
import { NewsletterForm } from "@/components/public/newsletter-form";
import { SOCIAL_ICONS, SOCIAL_LABELS } from "@/components/ui/social-icons";
import { PUBLIC_NAV } from "@/lib/constants";
import { toDialString } from "@/lib/utils";
import type { Service, WebsiteSettings } from "@/types";

type SocialKey = keyof typeof SOCIAL_ICONS;

interface FooterProps {
  settings: WebsiteSettings;
  services: Service[];
}

export function Footer({ settings, services }: FooterProps) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(settings.social ?? {}).filter(
    (entry): entry is [SocialKey, string] =>
      Boolean(entry[1]) && entry[0] in SOCIAL_ICONS,
  );

  return (
    <footer className="relative mt-auto overflow-hidden bg-navy-950 text-white">
      {/* Ambient gradient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 15% 0%, rgba(37,99,235,0.22), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 20%, rgba(14,165,233,0.16), transparent 60%)",
        }}
      />

      <div className="relative container-page">
        {/* Newsletter */}
        <div className="grid gap-8 border-b border-white/10 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Engineering notes, once a month
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">
              Practical writing on architecture, delivery and the things that actually break in
              production. No sales sequences, unsubscribe in one click.
            </p>
          </div>
          <NewsletterForm className="lg:justify-self-end lg:max-w-md" />
        </div>

        {/* Link columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo settings={settings} variant="onDark" showTagline />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
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
                        className="flex size-9.5 items-center justify-center rounded-full border border-white/12 bg-white/5 text-white/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400/50 hover:bg-brand-500/15 hover:text-white"
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
              className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase"
            >
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
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
              className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase"
            >
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
              {services.length === 0 && (
                <li>
                  <Link
                    href="/services"
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    View all services
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-3.5 text-sm">
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <address className="whitespace-pre-line text-white/60 not-italic">
                  {settings.address}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <a
                  href={`tel:${toDialString(settings.phone)}`}
                  className="text-white/60 transition-colors hover:text-white"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-white/60 transition-colors hover:text-white"
                >
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[13px] text-white/45 sm:flex-row">
          <p>
            &copy; {year} {settings.copyrightText}
          </p>
          <p>
            Built by{" "}
            <Link href="/about" className="text-white/70 transition-colors hover:text-white">
              {settings.companyName}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
