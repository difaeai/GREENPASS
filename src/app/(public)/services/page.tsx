import { Layers } from "lucide-react";
import type { Metadata } from "next";

import { CtaSection } from "@/components/home/sections";
import { ServiceCard } from "@/components/public/cards";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState, JsonLd } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { getServices } from "@/lib/services/collections";
import { getHomeContent, getSeoSettings } from "@/lib/services/content";

export const revalidate = 300;

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "Our Services", href: "/services" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return buildMetadata({
    seo,
    fields: seo.pages.services,
    fallbackTitle: "Our Services",
    fallbackDescription:
      "End-to-end product engineering: web platforms, mobile apps, cloud infrastructure, design and long-term support.",
    path: "/services",
  });
}

export default async function ServicesPage() {
  const [services, home, seo] = await Promise.all([
    getServices(),
    getHomeContent(),
    getSeoSettings(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.title,
      url: `${seo.siteUrl.replace(/\/$/, "")}/services/${service.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(CRUMBS, seo), itemListJsonLd]} />

      <PageHero
        eyebrow={home.featuredServices.eyebrow}
        title={home.featuredServices.heading}
        description={home.featuredServices.description}
        crumbs={CRUMBS}
      />

      <Section>
        <div className="container-page">
          {services.length === 0 ? (
            <EmptyState
              icon={<Layers className="size-5" />}
              title="No services published yet"
              description="Services added from the admin panel will be listed here."
            />
          ) : (
            <Stagger as="ul" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <StaggerItem as="li" key={service.id} className="h-full">
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </Section>

      <CtaSection cta={home.cta} />
    </>
  );
}
