import "server-only";
import { cache } from "react";

import { getAdminDb } from "@/lib/firebase/admin";
import { withDefaults, toPlainValue } from "@/lib/firebase/serialize";
import { COLLECTIONS, DOC_IDS } from "@/lib/constants";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_HOME_CONTENT,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_WEBSITE_SETTINGS,
} from "@/lib/defaults";
import type { AboutContent, HomeContent, SeoSettings, WebsiteSettings } from "@/types";

/**
 * Readers for the four singleton documents.
 *
 * Each is wrapped in React's `cache()` so a page that needs settings in both
 * `generateMetadata` and the component tree only hits Firestore once per
 * request. Missing credentials or a missing document both fall back to the
 * defaults rather than throwing — a half-configured project still renders.
 */

async function readSingleton<T>(
  collection: string,
  docId: string,
  fallback: T,
  label: string,
): Promise<T> {
  const db = getAdminDb();
  if (!db) return fallback;

  try {
    const snapshot = await db.collection(collection).doc(docId).get();
    if (!snapshot.exists) return fallback;
    return withDefaults(fallback, toPlainValue(snapshot.data()));
  } catch (error) {
    console.error(`[services] Failed to read ${label}:`, error);
    return fallback;
  }
}

export const getWebsiteSettings = cache(async (): Promise<WebsiteSettings> => {
  const settings = await readSingleton(
    COLLECTIONS.websiteSettings,
    DOC_IDS.websiteSettings,
    DEFAULT_WEBSITE_SETTINGS,
    "website settings",
  );
  return {
    ...settings,
    businessHours: [...(settings.businessHours ?? [])].sort((a, b) => a.order - b.order),
  };
});

export const getSeoSettings = cache(async (): Promise<SeoSettings> => {
  const seo = await readSingleton(
    COLLECTIONS.seoSettings,
    DOC_IDS.seoSettings,
    DEFAULT_SEO_SETTINGS,
    "SEO settings",
  );
  // The env var is the source of truth for the canonical origin in every
  // environment; a stale value saved in Firestore must not override it.
  return { ...seo, siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? seo.siteUrl };
});

export const getHomeContent = cache(async (): Promise<HomeContent> => {
  const content = await readSingleton(
    COLLECTIONS.home,
    DOC_IDS.homeContent,
    DEFAULT_HOME_CONTENT,
    "home content",
  );
  return {
    ...content,
    whyChooseUs: {
      ...content.whyChooseUs,
      items: [...(content.whyChooseUs?.items ?? [])].sort((a, b) => a.order - b.order),
    },
    stats: {
      ...content.stats,
      items: [...(content.stats?.items ?? [])].sort((a, b) => a.order - b.order),
    },
  };
});

export const getAboutContent = cache(async (): Promise<AboutContent> => {
  const content = await readSingleton(
    COLLECTIONS.about,
    DOC_IDS.aboutContent,
    DEFAULT_ABOUT_CONTENT,
    "about content",
  );
  return {
    ...content,
    coreValues: {
      ...content.coreValues,
      items: [...(content.coreValues?.items ?? [])].sort((a, b) => a.order - b.order),
    },
    history: {
      ...content.history,
      milestones: [...(content.history?.milestones ?? [])].sort((a, b) => a.order - b.order),
    },
  };
});
