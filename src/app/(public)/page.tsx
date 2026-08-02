import type { Metadata } from "next";

import { HeroSlider } from "@/components/home/hero-slider";
import {
  CtaSection,
  FeaturedPortfolioSection,
  FeaturedServicesSection,
  IntroSection,
  WhyChooseUsSection,
} from "@/components/home/sections";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSlider } from "@/components/home/testimonials-slider";
import { buildMetadata } from "@/lib/seo";
import {
  getBanners,
  getFeaturedProjects,
  getFeaturedServices,
  getTestimonials,
} from "@/lib/services/collections";
import { getHomeContent, getSeoSettings, getWebsiteSettings } from "@/lib/services/content";

// Content is admin-editable, so pages revalidate on a short interval rather
// than being frozen at build time. Firestore reads are cheap and cached.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoSettings(), getWebsiteSettings()]);

  return buildMetadata({
    seo,
    fields: seo.pages.home,
    fallbackTitle: `${settings.companyName} — ${settings.tagline}`,
    fallbackDescription: settings.footerText,
    path: "/",
  });
}

export default async function HomePage() {
  const [content, banners, services, projects, testimonials] = await Promise.all([
    getHomeContent(),
    getBanners(),
    getFeaturedServices(6),
    getFeaturedProjects(6),
    getTestimonials(),
  ]);

  return (
    <>
      <HeroSlider banners={banners} />
      <IntroSection intro={content.intro} />
      <WhyChooseUsSection
        heading={content.whyChooseUs.heading}
        items={content.whyChooseUs.items}
      />
      <StatsSection heading={content.stats.heading} items={content.stats.items} />
      <FeaturedServicesSection heading={content.featuredServices} services={services} />
      <FeaturedPortfolioSection heading={content.featuredPortfolio} projects={projects} />
      <TestimonialsSlider heading={content.testimonials} testimonials={testimonials} />
      <CtaSection cta={content.cta} />
    </>
  );
}
