import { z } from "zod";

/**
 * Shared schemas. The contact and newsletter schemas run on both sides of the
 * wire: the browser uses them for inline validation, the route handlers use
 * them as the trust boundary.
 */

export const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "That name is too long."),
  companyName: z.string().trim().max(120, "That company name is too long.").optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("That doesn't look like a valid email address.")
    .max(160),
  phone: z
    .string()
    .trim()
    .max(32, "That phone number is too long.")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a subject.")
    .max(150, "That subject is too long."),
  message: z
    .string()
    .trim()
    .min(20, "Please give us a little more detail — at least 20 characters.")
    .max(5000, "That message is too long. Please keep it under 5,000 characters."),
  // Honeypot. Deliberately permissive: the route handler inspects this and
  // answers 200 so a bot believes it succeeded. Rejecting it here instead
  // would hand the bot a 400 and tell it to try a different shape.
  website: z.string().max(200).optional(),
  recaptchaToken: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(160),
  source: z.string().trim().max(50).optional(),
});

/* ------------------------------------------------------------------ */
/* Admin content schemas                                               */
/* ------------------------------------------------------------------ */

const seoSchema = z.object({
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(180).optional().or(z.literal("")),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().trim().optional().or(z.literal("")),
  canonicalUrl: z.string().trim().optional().or(z.literal("")),
  noIndex: z.boolean().default(false),
});

export const bannerSchema = z.object({
  smallHeading: z.string().trim().max(80).default(""),
  mainHeading: z.string().trim().min(3, "A main heading is required.").max(160),
  description: z.string().trim().max(400).default(""),
  backgroundImage: z.string().trim().min(1, "A background image is required."),
  backgroundImagePath: z.string().nullable().default(null),
  buttonLabel: z.string().trim().max(40).nullable().default(null),
  buttonLink: z.string().trim().max(300).nullable().default(null),
  secondaryButtonLabel: z.string().trim().max(40).nullable().default(null),
  secondaryButtonLink: z.string().trim().max(300).nullable().default(null),
  overlayOpacity: z.number().min(0).max(1).default(0.68),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const serviceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "A URL slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  title: z.string().trim().min(2, "A title is required.").max(120),
  shortDescription: z.string().trim().min(10, "Add a short description.").max(300),
  fullDescription: z.string().trim().min(20, "Add the full description.").max(20000),
  image: z.string().trim().default(""),
  imagePath: z.string().nullable().default(null),
  icon: z.string().trim().default("Sparkles"),
  features: z.array(z.string().trim().min(1)).default([]),
  isFeatured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seo: seoSchema,
});

export const portfolioCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "A URL slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(2, "A category name is required.").max(80),
  description: z.string().trim().max(300).nullable().default(null),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const portfolioProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "A URL slug is required.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  title: z.string().trim().min(2, "A title is required.").max(150),
  clientName: z.string().trim().min(1, "A client name is required.").max(120),
  completionDate: z.string().nullable().default(null),
  categoryId: z.string().trim().min(1, "Choose a category."),
  categoryName: z.string().trim().default(""),
  shortDescription: z.string().trim().min(10, "Add a short description.").max(300),
  description: z.string().trim().min(20, "Add the full description.").max(20000),
  featuredImage: z.string().trim().min(1, "A featured image is required."),
  featuredImagePath: z.string().nullable().default(null),
  images: z
    .array(
      z.object({
        url: z.string().trim().min(1),
        path: z.string().nullable().default(null),
        alt: z.string().trim().nullable().default(null),
      }),
    )
    .default([]),
  technologies: z.array(z.string().trim().min(1)).default([]),
  projectUrl: z.string().trim().max(300).nullable().default(null),
  isFeatured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  seo: seoSchema,
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2, "A name is required.").max(100),
  position: z.string().trim().min(2, "A position is required.").max(120),
  description: z.string().trim().max(600).default(""),
  photo: z.string().trim().default(""),
  photoPath: z.string().nullable().default(null),
  linkedinUrl: z.string().trim().max(300).nullable().default(null),
  facebookUrl: z.string().trim().max(300).nullable().default(null),
  instagramUrl: z.string().trim().max(300).nullable().default(null),
  twitterUrl: z.string().trim().max(300).nullable().default(null),
  email: z.string().trim().max(160).nullable().default(null),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2, "A name is required.").max(100),
  company: z.string().trim().min(1, "A company is required.").max(120),
  designation: z.string().trim().max(120).nullable().default(null),
  feedback: z.string().trim().min(10, "Add the client's feedback.").max(2000),
  photo: z.string().trim().default(""),
  photoPath: z.string().nullable().default(null),
  rating: z.number().int().min(1).max(5).default(5),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type BannerFormValues = z.input<typeof bannerSchema>;
export type ServiceFormValues = z.input<typeof serviceSchema>;
export type PortfolioProjectFormValues = z.input<typeof portfolioProjectSchema>;
export type PortfolioCategoryFormValues = z.input<typeof portfolioCategorySchema>;
export type TeamMemberFormValues = z.input<typeof teamMemberSchema>;
export type TestimonialFormValues = z.input<typeof testimonialSchema>;
