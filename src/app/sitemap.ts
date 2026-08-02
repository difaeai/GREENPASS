import type { MetadataRoute } from "next";

import { getProjects, getServices } from "@/lib/services/collections";
import { getSeoSettings } from "@/lib/services/content";

/** Regenerated hourly so newly published content is discoverable quickly. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, services, projects] = await Promise.all([
    getSeoSettings(),
    getServices(),
    getProjects(),
  ]);

  const base = seo.siteUrl.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.7, lastModified: now },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services
    .filter((service) => !service.seo?.noIndex)
    .map((service) => ({
      url: `${base}/services/${service.slug}`,
      changeFrequency: "monthly",
      priority: 0.75,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
    }));

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => !project.seo?.noIndex)
    .map((project) => ({
      url: `${base}/portfolio/${project.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
    }));

  return [...staticRoutes, ...serviceRoutes, ...projectRoutes];
}
