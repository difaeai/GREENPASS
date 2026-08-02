import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/public/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { JsonLd, Prose } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { SmartImage } from "@/components/ui/smart-image";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo";
import { getServiceBySlug, getServices } from "@/lib/services/collections";
import { getSeoSettings, getWebsiteSettings } from "@/lib/services/content";

export const revalidate = 300;
/** Slugs added after a build are rendered on demand and then cached. */
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render every published service at build time. */
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [service, seo] = await Promise.all([getServiceBySlug(slug), getSeoSettings()]);

  if (!service) {
    return { title: "Service not found", robots: { index: false, follow: false } };
  }

  return buildMetadata({
    seo,
    fields: service.seo,
    fallbackTitle: service.title,
    fallbackDescription: service.shortDescription,
    path: `/services/${service.slug}`,
    images: [service.image],
    type: "article",
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [service, allServices, settings, seo] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getWebsiteSettings(),
    getSeoSettings(),
  ]);

  if (!service) notFound();

  const others = allServices.filter((item) => item.id !== service.id).slice(0, 4);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Our Services", href: "/services" },
    { label: service.title, href: `/services/${service.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs, seo),
          serviceJsonLd(service, settings, seo),
        ]}
      />

      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.shortDescription}
        crumbs={crumbs}
        backgroundImage={service.image}
      >
        <ButtonLink href="/contact" size="lg">
          Discuss this service
          <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
      </PageHero>

      <Section>
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          {/* Main column */}
          <div>
            <Reveal>
              <div className="relative aspect-16/9 overflow-hidden rounded-3xl bg-navy-100 shadow-soft dark:bg-navy-900">
                <SmartImage
                  src={service.image}
                  alt={service.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover"
                  fallbackLabel={service.title}
                />
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="mt-10 text-2xl font-semibold text-navy-950 sm:text-3xl dark:text-white">
                Overview
              </h2>
              <Prose text={service.fullDescription} className="mt-5" />
            </Reveal>

            {service.features.length > 0 && (
              <Reveal delay={0.1}>
                <h2 className="mt-12 text-2xl font-semibold text-navy-950 sm:text-3xl dark:text-white">
                  What&apos;s included
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded-2xl border border-navy-100 bg-navy-50/60 p-4 dark:border-navy-800 dark:bg-navy-900/40"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white"
                      >
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="text-sm leading-relaxed text-navy-700 dark:text-navy-200">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Reveal direction="left">
              <div className="surface-card p-6">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-2xl bg-linear-135 from-brand-600 to-accent-500 text-white"
                >
                  <Icon name={service.icon} className="size-5.5" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-navy-950 dark:text-white">
                  Ready to get started?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
                  Tell us about your project and we&apos;ll come back within one business day with
                  scope, timeline and cost.
                </p>
                <ButtonLink href="/contact" className="mt-5 w-full">
                  Contact us
                  <ArrowRight aria-hidden className="size-4" />
                </ButtonLink>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="mt-3 block text-center text-sm font-medium text-navy-500 transition-colors hover:text-brand-600 dark:text-navy-400"
                >
                  or call {settings.phone}
                </a>
              </div>

              {others.length > 0 && (
                <nav
                  aria-labelledby="other-services"
                  className="surface-card mt-6 p-6"
                >
                  <h2
                    id="other-services"
                    className="text-[11px] font-semibold tracking-[0.16em] text-navy-400 uppercase"
                  >
                    Other services
                  </h2>
                  <ul className="mt-4 space-y-1">
                    {others.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/services/${item.slug}`}
                          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-navy-300 dark:hover:bg-navy-900 dark:hover:text-brand-300"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon name={item.icon} className="size-4 shrink-0 opacity-60" />
                            {item.title}
                          </span>
                          <ArrowRight
                            aria-hidden
                            className="size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-70"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </Reveal>
          </aside>
        </div>
      </Section>
    </>
  );
}
