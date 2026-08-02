import type { Metadata } from "next";

import { toPlainText, truncate } from "@/lib/utils";
import type {
  PortfolioProject,
  SeoFields,
  SeoSettings,
  Service,
  WebsiteSettings,
} from "@/types";

/**
 * Central metadata + JSON-LD builders.
 *
 * `buildMetadata` merges three layers, most specific first:
 *   per-document SEO fields → per-page SEO settings → global site defaults.
 */

interface BuildMetadataArgs {
  seo: SeoSettings;
  fields?: SeoFields | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  images?: string[];
  type?: "website" | "article" | "profile";
  publishedTime?: string | null;
}

export function buildMetadata({
  seo,
  fields,
  fallbackTitle,
  fallbackDescription,
  path,
  images,
  type = "website",
  publishedTime,
}: BuildMetadataArgs): Metadata {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const url = fields?.canonicalUrl || `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;

  const title = fields?.metaTitle?.trim() || fallbackTitle;
  const description = truncate(
    toPlainText(fields?.metaDescription?.trim() || fallbackDescription),
    170,
  );

  const ogImages = [fields?.ogImage, ...(images ?? []), seo.defaultOgImage]
    .filter((src): src is string => Boolean(src))
    .slice(0, 4);

  return {
    title,
    description,
    keywords: fields?.keywords?.length ? fields.keywords : undefined,
    alternates: { canonical: url },
    robots: fields?.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      type,
      url,
      siteName: seo.siteName,
      title,
      description,
      images: ogImages.map((src) => ({ url: src, alt: title })),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
      ...(seo.twitterHandle ? { site: seo.twitterHandle, creator: seo.twitterHandle } : {}),
    },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

/** Split the multi-line settings address into schema.org parts, best effort. */
function toPostalAddress(address: string) {
  const lines = address.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    "@type": "PostalAddress",
    streetAddress: lines[0] ?? address,
    addressLocality: lines[1] ?? undefined,
    addressCountry: lines[2] ?? undefined,
  };
}

export function organizationJsonLd(settings: WebsiteSettings, seo: SeoSettings) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  const sameAs = Object.values(settings.social ?? {}).filter(
    (href): href is string => Boolean(href),
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: settings.companyName,
    url: siteUrl,
    logo: seo.organizationLogo || settings.logoLight || seo.defaultOgImage,
    description: settings.tagline,
    email: settings.email,
    telephone: settings.phone,
    address: toPostalAddress(settings.address),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function websiteJsonLd(seo: SeoSettings) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: seo.siteName,
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/portfolio?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function serviceJsonLd(service: Service, settings: WebsiteSettings, seo: SeoSettings) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    serviceType: service.title,
    description: toPlainText(service.shortDescription),
    url: `${siteUrl}/services/${service.slug}`,
    image: service.image || undefined,
    provider: {
      "@type": "Organization",
      name: settings.companyName,
      url: siteUrl,
    },
  };
}

export function projectJsonLd(
  project: PortfolioProject,
  settings: WebsiteSettings,
  seo: SeoSettings,
) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: toPlainText(project.shortDescription),
    url: `${siteUrl}/portfolio/${project.slug}`,
    image: [project.featuredImage, ...project.images.map((i) => i.url)].filter(Boolean),
    dateCreated: project.completionDate ?? undefined,
    keywords: project.technologies.join(", "),
    creator: { "@type": "Organization", name: settings.companyName, url: siteUrl },
    about: project.categoryName,
  };
}

export function breadcrumbJsonLd(
  crumbs: { label: string; href: string }[],
  seo: SeoSettings,
) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${siteUrl}${crumb.href}`,
    })),
  };
}

export function contactPageJsonLd(settings: WebsiteSettings, seo: SeoSettings) {
  const siteUrl = seo.siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${siteUrl}/contact`,
    name: `Contact ${settings.companyName}`,
    mainEntity: {
      "@type": "Organization",
      name: settings.companyName,
      email: settings.email,
      telephone: settings.phone,
      address: toPostalAddress(settings.address),
    },
  };
}
