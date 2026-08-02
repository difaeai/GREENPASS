/**
 * Domain model for the whole site.
 *
 * Every document is serialised to these shapes before it crosses a
 * server/client boundary: Firestore `Timestamp`s become ISO strings so the
 * objects stay structurally cloneable in React Server Components.
 */

export type ISODateString = string;

/** Fields every Firestore document in this project carries. */
export interface BaseDoc {
  id: string;
  createdAt?: ISODateString | null;
  updatedAt?: ISODateString | null;
}

/** Anything the admin can order and hide is `Orderable`. */
export interface Orderable {
  order: number;
  isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* Admin & auth                                                        */
/* ------------------------------------------------------------------ */

export type AdminRole = "superadmin" | "admin" | "editor";

export interface AdminUser extends BaseDoc {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  photoURL?: string | null;
  isActive: boolean;
  lastLoginAt?: ISODateString | null;
}

/* ------------------------------------------------------------------ */
/* Home page                                                           */
/* ------------------------------------------------------------------ */

export interface HomeBanner extends BaseDoc, Orderable {
  smallHeading: string;
  mainHeading: string;
  description: string;
  backgroundImage: string;
  backgroundImagePath?: string | null;
  buttonLabel?: string | null;
  buttonLink?: string | null;
  secondaryButtonLabel?: string | null;
  secondaryButtonLink?: string | null;
  overlayOpacity?: number;
}

export interface WhyChooseUsItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: string;
  order: number;
}

export interface HomeIntro {
  eyebrow: string;
  heading: string;
  body: string;
  image: string;
  imagePath?: string | null;
  highlights: string[];
  buttonLabel?: string | null;
  buttonLink?: string | null;
}

export interface HomeCta {
  eyebrow: string;
  heading: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
  backgroundImage?: string | null;
}

export interface HomeSectionHeading {
  eyebrow: string;
  heading: string;
  description: string;
}

/** Single `home/content` document holding every non-repeating home section. */
export interface HomeContent {
  intro: HomeIntro;
  whyChooseUs: {
    heading: HomeSectionHeading;
    items: WhyChooseUsItem[];
  };
  stats: {
    heading: HomeSectionHeading;
    items: StatItem[];
  };
  featuredServices: HomeSectionHeading;
  featuredPortfolio: HomeSectionHeading;
  testimonials: HomeSectionHeading;
  cta: HomeCta;
}

/* ------------------------------------------------------------------ */
/* About page                                                          */
/* ------------------------------------------------------------------ */

export interface CoreValue {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface HistoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  order: number;
}

export interface CeoMessage {
  name: string;
  designation: string;
  message: string;
  photo: string;
  photoPath?: string | null;
  signatureImage?: string | null;
  signatureImagePath?: string | null;
}

export interface AboutContent {
  intro: {
    eyebrow: string;
    heading: string;
    body: string;
    image: string;
    imagePath?: string | null;
    secondaryImage?: string | null;
    secondaryImagePath?: string | null;
  };
  vision: { heading: string; body: string; icon: string };
  mission: { heading: string; body: string; icon: string };
  coreValues: { heading: HomeSectionHeading; items: CoreValue[] };
  history: { heading: HomeSectionHeading; milestones: HistoryMilestone[] };
  team: HomeSectionHeading;
  ceo: CeoMessage;
}

export interface TeamMember extends BaseDoc, Orderable {
  name: string;
  position: string;
  description: string;
  photo: string;
  photoPath?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export interface Service extends BaseDoc, Orderable {
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  imagePath?: string | null;
  icon: string;
  features: string[];
  isFeatured: boolean;
  seo: SeoFields;
}

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */

export interface PortfolioCategory extends BaseDoc, Orderable {
  slug: string;
  name: string;
  description?: string | null;
}

export interface PortfolioImage {
  url: string;
  path?: string | null;
  alt?: string | null;
}

export interface PortfolioProject extends BaseDoc, Orderable {
  slug: string;
  title: string;
  clientName: string;
  completionDate: ISODateString | null;
  categoryId: string;
  categoryName: string;
  description: string;
  shortDescription: string;
  featuredImage: string;
  featuredImagePath?: string | null;
  images: PortfolioImage[];
  technologies: string[];
  projectUrl?: string | null;
  isFeatured: boolean;
  seo: SeoFields;
}

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

export interface Testimonial extends BaseDoc, Orderable {
  name: string;
  company: string;
  designation?: string | null;
  feedback: string;
  photo: string;
  photoPath?: string | null;
  rating: number;
}

/* ------------------------------------------------------------------ */
/* Contact & newsletter                                                */
/* ------------------------------------------------------------------ */

export const CONTACT_STATUSES = ["new", "read", "in_progress", "completed"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface ContactQuery extends BaseDoc {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  notes?: string | null;
  submittedAt: ISODateString | null;
  userAgent?: string | null;
}

export interface NewsletterSubscriber extends BaseDoc {
  email: string;
  source: string;
  isActive: boolean;
  subscribedAt: ISODateString | null;
}

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export interface BusinessHour {
  id: string;
  day: string;
  hours: string;
  order: number;
}

export interface SocialLinks {
  facebook?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  github?: string | null;
}

export interface WebsiteSettings {
  companyName: string;
  tagline: string;
  logoLight: string;
  logoDark: string;
  favicon: string;
  email: string;
  secondaryEmail?: string | null;
  phone: string;
  secondaryPhone?: string | null;
  whatsapp: string;
  address: string;
  googleMapsEmbedUrl: string;
  googleMapsLink?: string | null;
  businessHours: BusinessHour[];
  social: SocialLinks;
  footerText: string;
  copyrightText: string;
  contactHeading?: string;
  contactSubheading?: string;
}

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  ogImage?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
}

export type SeoPageKey =
  | "home"
  | "about"
  | "services"
  | "portfolio"
  | "contact";

export interface SeoSettings {
  siteName: string;
  siteUrl: string;
  defaultOgImage: string;
  twitterHandle?: string | null;
  organizationLogo?: string | null;
  googleSiteVerification?: string | null;
  pages: Record<SeoPageKey, SeoFields>;
}

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export interface MediaItem extends BaseDoc {
  name: string;
  url: string;
  path: string;
  folder: string;
  contentType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  uploadedBy?: string | null;
  alt?: string | null;
}

export const MEDIA_FOLDERS = [
  "banners",
  "services",
  "portfolio",
  "team",
  "testimonials",
  "company",
  "general",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export interface DashboardStats {
  banners: number;
  services: number;
  projects: number;
  team: number;
  testimonials: number;
  queries: number;
  unreadQueries: number;
  subscribers: number;
  mediaItems: number;
  visitors: number | null;
}
