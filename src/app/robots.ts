import type { MetadataRoute } from "next";

import { getSeoSettings } from "@/lib/services/content";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  const base = seo.siteUrl.replace(/\/$/, "");

  // Staging and preview origins must never be indexed.
  const isProduction =
    process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true" ||
    (process.env.NODE_ENV === "production" && !base.includes("localhost"));

  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
