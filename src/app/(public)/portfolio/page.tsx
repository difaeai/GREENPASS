import { FolderOpen } from "lucide-react";
import type { Metadata } from "next";

import { CtaSection } from "@/components/home/sections";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState, JsonLd } from "@/components/ui/primitives";
import { Section } from "@/components/ui/section";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { getPortfolioCategories, getProjects } from "@/lib/services/collections";
import { getHomeContent, getSeoSettings } from "@/lib/services/content";

export const revalidate = 300;

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
];

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();

  return buildMetadata({
    seo,
    fields: seo.pages.portfolio,
    fallbackTitle: "Portfolio",
    fallbackDescription:
      "Selected platforms, mobile apps and internal tools we have designed, built and shipped for clients worldwide.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const [projects, categories, home, seo] = await Promise.all([
    getProjects(),
    getPortfolioCategories(),
    getHomeContent(),
    getSeoSettings(),
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: `${seo.siteUrl.replace(/\/$/, "")}/portfolio/${project.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd(CRUMBS, seo), itemListJsonLd]} />

      <PageHero
        eyebrow={home.featuredPortfolio.eyebrow}
        title={home.featuredPortfolio.heading}
        description={home.featuredPortfolio.description}
        crumbs={CRUMBS}
      />

      <Section>
        <div className="container-page">
          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderOpen className="size-5" />}
              title="No mandates published yet"
              description="Mandates added from the admin panel will appear here."
            />
          ) : (
            <PortfolioGrid projects={projects} categories={categories} />
          )}
        </div>
      </Section>

      <CtaSection cta={home.cta} />
    </>
  );
}
