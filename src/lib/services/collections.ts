import "server-only";
import { cache } from "react";

import { getAdminDb } from "@/lib/firebase/admin";
import { docsToPlain } from "@/lib/firebase/serialize";
import { COLLECTIONS } from "@/lib/constants";
import {
  SAMPLE_BANNERS,
  SAMPLE_CATEGORIES,
  SAMPLE_PROJECTS,
  SAMPLE_SERVICES,
  SAMPLE_TEAM,
  SAMPLE_TESTIMONIALS,
} from "@/lib/sample-data";
import type {
  HomeBanner,
  PortfolioCategory,
  PortfolioProject,
  Service,
  TeamMember,
  Testimonial,
} from "@/types";

/**
 * Public read helpers for the list collections.
 *
 * All of them filter to `isActive === true` and sort by `order`. Sorting
 * happens in memory rather than via `orderBy` so a single-field index is
 * enough — no composite index needed for the `isActive + order` pair.
 *
 * When the Admin SDK has no credentials these fall back to the demo dataset
 * so the site is reviewable before Firebase is wired up.
 */

async function readActive<T extends { order: number }>(
  collection: string,
  fallback: T[],
  label: string,
): Promise<T[]> {
  const db = getAdminDb();
  if (!db) return fallback;

  try {
    const snapshot = await db.collection(collection).where("isActive", "==", true).get();
    return docsToPlain<T>(snapshot.docs).sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error(`[services] Failed to read ${label}:`, error);
    return [];
  }
}

/* ------------------------------- banners -------------------------------- */

export const getBanners = cache(() =>
  readActive<HomeBanner>(COLLECTIONS.homeBanners, SAMPLE_BANNERS, "banners"),
);

/* ------------------------------- services ------------------------------- */

export const getServices = cache(() =>
  readActive<Service>(COLLECTIONS.services, SAMPLE_SERVICES, "services"),
);

export const getFeaturedServices = cache(async (limit = 6): Promise<Service[]> => {
  const services = await getServices();
  const featured = services.filter((s) => s.isFeatured);
  // Fall back to the first N services so the section is never empty.
  return (featured.length > 0 ? featured : services).slice(0, limit);
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const db = getAdminDb();
  if (!db) return SAMPLE_SERVICES.find((s) => s.slug === slug) ?? null;

  try {
    const snapshot = await db
      .collection(COLLECTIONS.services)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const [service] = docsToPlain<Service>(snapshot.docs);
    return service?.isActive ? service : null;
  } catch (error) {
    console.error(`[services] Failed to read service "${slug}":`, error);
    return null;
  }
});

/* ------------------------------- portfolio ------------------------------ */

export const getPortfolioCategories = cache(() =>
  readActive<PortfolioCategory>(
    COLLECTIONS.portfolioCategories,
    SAMPLE_CATEGORIES,
    "portfolio categories",
  ),
);

export const getProjects = cache(() =>
  readActive<PortfolioProject>(COLLECTIONS.portfolio, SAMPLE_PROJECTS, "portfolio projects"),
);

export const getFeaturedProjects = cache(async (limit = 6): Promise<PortfolioProject[]> => {
  const projects = await getProjects();
  const featured = projects.filter((p) => p.isFeatured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
});

export const getProjectBySlug = cache(async (slug: string): Promise<PortfolioProject | null> => {
  const db = getAdminDb();
  if (!db) return SAMPLE_PROJECTS.find((p) => p.slug === slug) ?? null;

  try {
    const snapshot = await db
      .collection(COLLECTIONS.portfolio)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const [project] = docsToPlain<PortfolioProject>(snapshot.docs);
    return project?.isActive ? project : null;
  } catch (error) {
    console.error(`[services] Failed to read project "${slug}":`, error);
    return null;
  }
});

/** Up to `limit` other projects, preferring ones in the same category. */
export const getRelatedProjects = cache(
  async (project: PortfolioProject, limit = 3): Promise<PortfolioProject[]> => {
    const projects = (await getProjects()).filter((p) => p.id !== project.id);
    const sameCategory = projects.filter((p) => p.categoryId === project.categoryId);
    const rest = projects.filter((p) => p.categoryId !== project.categoryId);
    return [...sameCategory, ...rest].slice(0, limit);
  },
);

/* --------------------------------- team --------------------------------- */

export const getTeamMembers = cache(() =>
  readActive<TeamMember>(COLLECTIONS.team, SAMPLE_TEAM, "team members"),
);

/* ----------------------------- testimonials ----------------------------- */

export const getTestimonials = cache(() =>
  readActive<Testimonial>(COLLECTIONS.testimonials, SAMPLE_TESTIMONIALS, "testimonials"),
);
