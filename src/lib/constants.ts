/** Firestore collection names — imported everywhere so a rename is one edit. */
export const COLLECTIONS = {
  admins: "admins",
  websiteSettings: "website_settings",
  homeBanners: "home_banners",
  home: "home",
  about: "about",
  services: "services",
  portfolio: "portfolio",
  portfolioCategories: "portfolio_categories",
  team: "team",
  testimonials: "testimonials",
  contactQueries: "contact_queries",
  newsletterSubscribers: "newsletter_subscribers",
  mediaLibrary: "media_library",
  seoSettings: "seo_settings",
} as const;

/** Singleton document ids inside the single-document collections. */
export const DOC_IDS = {
  websiteSettings: "global",
  homeContent: "content",
  aboutContent: "content",
  seoSettings: "global",
} as const;

/** Storage prefixes. Keep in sync with `storage.rules`. */
export const STORAGE_FOLDERS = {
  banners: "banners",
  services: "services",
  portfolio: "portfolio",
  team: "team",
  testimonials: "testimonials",
  company: "company",
  general: "general",
} as const;

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact Us", href: "/contact" },
] as const;

/** Page size used by every paginated admin table and public grid. */
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 15;
