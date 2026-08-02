import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { PageHero } from "@/components/public/page-hero";
import { JsonLd } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SOCIAL_ICONS, SOCIAL_LABELS } from "@/components/ui/social-icons";
import { breadcrumbJsonLd, buildMetadata, contactPageJsonLd } from "@/lib/seo";
import { getSeoSettings, getWebsiteSettings } from "@/lib/services/content";
import { toDialString, toMapEmbedUrl, whatsappLink } from "@/lib/utils";

export const revalidate = 300;

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "Contact Us", href: "/contact" },
];

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoSettings(), getWebsiteSettings()]);

  return buildMetadata({
    seo,
    fields: seo.pages.contact,
    fallbackTitle: "Contact Us",
    fallbackDescription: `Get in touch with ${settings.companyName}. ${settings.contactSubheading ?? ""}`.trim(),
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [settings, seo] = await Promise.all([getWebsiteSettings(), getSeoSettings()]);

  const socialEntries = Object.entries(settings.social ?? {}).filter(
    (entry): entry is [keyof typeof SOCIAL_ICONS, string] =>
      Boolean(entry[1]) && entry[0] in SOCIAL_ICONS,
  );

  const channels = [
    {
      icon: MapPin,
      label: "Visit us",
      lines: settings.address.split("\n"),
      href: settings.googleMapsLink ?? undefined,
    },
    {
      icon: Phone,
      label: "Call us",
      lines: [settings.phone, settings.secondaryPhone].filter(Boolean) as string[],
      href: `tel:${toDialString(settings.phone)}`,
    },
    {
      icon: Mail,
      label: "Email us",
      lines: [settings.email, settings.secondaryEmail].filter(Boolean) as string[],
      href: `mailto:${settings.email}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      lines: [settings.whatsapp],
      href: whatsappLink(settings.whatsapp, `Hi ${settings.companyName}!`),
    },
  ].filter((channel) => channel.lines.length > 0 && channel.lines[0]);

  const mapEmbedUrl = toMapEmbedUrl(settings.googleMapsEmbedUrl);

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(CRUMBS, seo), contactPageJsonLd(settings, seo)]} />

      <PageHero
        eyebrow="Contact"
        title={settings.contactHeading ?? "Let's talk about your project"}
        description={settings.contactSubheading}
        crumbs={CRUMBS}
      />

      {/* Contact channels */}
      <Section spacing="sm">
        <div className="container-page">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel, index) => {
              const ChannelIcon = channel.icon;
              const body = (
                <>
                  <span
                    aria-hidden
                    className="flex size-11 items-center justify-center rounded-2xl bg-linear-135 from-brand-600 to-accent-500 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.7)] transition-transform duration-300 group-hover:scale-105"
                  >
                    <ChannelIcon className="size-5" />
                  </span>
                  <h2 className="mt-4 text-[11px] font-semibold tracking-[0.16em] text-navy-400 uppercase">
                    {channel.label}
                  </h2>
                  <div className="mt-2 space-y-0.5">
                    {channel.lines.map((line) => (
                      <p
                        key={line}
                        className="text-[15px] leading-snug font-medium break-words text-navy-900 dark:text-navy-50"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              );

              return (
                <Reveal as="li" key={channel.label} delay={index * 0.06} className="h-full">
                  {channel.href ? (
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="surface-card group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-500/40"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="surface-card group flex h-full flex-col p-6">{body}</div>
                  )}
                </Reveal>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* Form + sidebar */}
      <Section spacing="md">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <Reveal direction="right">
            <ContactForm />
          </Reveal>

          <Reveal direction="left" delay={0.08} className="space-y-6">
            {settings.businessHours.length > 0 && (
              <div className="surface-card p-6">
                <h2 className="flex items-center gap-2.5 text-base font-semibold text-navy-950 dark:text-white">
                  <Clock aria-hidden className="size-4.5 text-brand-600 dark:text-brand-400" />
                  Business hours
                </h2>
                <dl className="mt-4 space-y-0">
                  {settings.businessHours.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-4 border-b border-navy-100 py-2.5 last:border-0 dark:border-navy-800"
                    >
                      <dt className="text-sm text-navy-600 dark:text-navy-300">{entry.day}</dt>
                      <dd className="text-sm font-medium text-navy-900 dark:text-navy-50">
                        {entry.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {socialEntries.length > 0 && (
              <div className="surface-card p-6">
                <h2 className="text-base font-semibold text-navy-950 dark:text-white">
                  Follow along
                </h2>
                <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-400">
                  Updates, engineering notes and the occasional hiring post.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {socialEntries.map(([key, href]) => {
                    const SocialIcon = SOCIAL_ICONS[key];
                    return (
                      <li key={key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={SOCIAL_LABELS[key]}
                          className="flex size-10 items-center justify-center rounded-full border border-navy-200 text-navy-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-navy-700 dark:text-navy-400 dark:hover:border-brand-500/50 dark:hover:bg-navy-900"
                        >
                          <SocialIcon className="size-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="surface-card overflow-hidden bg-navy-950 p-6 text-white">
              <h2 className="text-base font-semibold">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {[
                  "We read your message and reply within one business day.",
                  "A 30-minute call to understand scope, constraints and timing.",
                  "A written proposal with phases, cost and a delivery date.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3.5">
                    <span
                      aria-hidden
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-300"
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-white/65">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Map */}
      {mapEmbedUrl && (
        <section aria-label="Our location on a map" className="relative">
          <div className="h-96 w-full overflow-hidden border-y border-navy-200 bg-navy-100 sm:h-[28rem] dark:border-navy-800 dark:bg-navy-900">
            <iframe
              src={mapEmbedUrl}
              title={`Map showing the offices of ${settings.companyName}`}
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full border-0 grayscale-[0.35] transition-all duration-500 hover:grayscale-0 dark:invert-[0.9] dark:hue-rotate-180"
            />
          </div>
        </section>
      )}
    </>
  );
}
