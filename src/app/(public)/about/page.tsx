import type { Metadata } from "next";

import {
  AboutIntro,
  CeoMessageSection,
  CoreValues,
  HistoryTimeline,
  TeamSection,
  VisionMission,
} from "@/components/about/sections";
import { CtaSection } from "@/components/home/sections";
import { PageHero } from "@/components/public/page-hero";
import { JsonLd } from "@/components/ui/primitives";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { getTeamMembers } from "@/lib/services/collections";
import {
  getAboutContent,
  getHomeContent,
  getSeoSettings,
  getWebsiteSettings,
} from "@/lib/services/content";

export const revalidate = 300;

const CRUMBS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
];

export async function generateMetadata(): Promise<Metadata> {
  const [seo, about] = await Promise.all([getSeoSettings(), getAboutContent()]);

  return buildMetadata({
    seo,
    fields: seo.pages.about,
    fallbackTitle: "About Us",
    fallbackDescription: about.intro.body,
    path: "/about",
    images: [about.intro.image],
  });
}

export default async function AboutPage() {
  const [about, team, home, seo] = await Promise.all([
    getAboutContent(),
    getTeamMembers(),
    getHomeContent(),
    getSeoSettings(),
  ]);

  // Referenced so `getWebsiteSettings` stays warm for the shared layout cache.
  await getWebsiteSettings();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(CRUMBS, seo)} />

      <PageHero
        eyebrow={about.intro.eyebrow}
        title={about.intro.heading}
        description={about.vision.body}
        crumbs={CRUMBS}
        backgroundImage={about.intro.image}
      />

      <AboutIntro intro={about.intro} />
      <VisionMission vision={about.vision} mission={about.mission} />
      <CoreValues coreValues={about.coreValues} />
      <CeoMessageSection ceo={about.ceo} />
      <HistoryTimeline history={about.history} />
      <TeamSection heading={about.team} members={team} />
      <CtaSection cta={home.cta} />
    </>
  );
}
