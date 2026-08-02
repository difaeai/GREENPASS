import type {
  AboutContent,
  HomeContent,
  SeoSettings,
  WebsiteSettings,
} from "@/types";

/**
 * Canonical shape + copy for every singleton document.
 *
 * These serve three jobs:
 *  1. Render a complete, presentable site before Firestore is ever seeded.
 *  2. Backfill fields the admin has not filled in yet (see `withDefaults`).
 *  3. Provide the payload for `npm run seed`.
 *
 * Copy here is derived from the company's own supplied material. Nothing is
 * asserted that was not provided — no client names, revenue figures, project
 * histories or endorsements have been invented.
 */

/**
 * PLACEHOLDER IMAGERY — replace every one of these from
 * Admin → Media Library before launch.
 *
 * These are generic Unsplash stock photos chosen to suit the three sectors.
 * They are not photographs of MS GreenPass sites, assets or people, and the
 * `ceo` portrait is a stock model, not Faraz Chaudhry.
 */
const IMG = {
  // Real estate / development
  skyline: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
  architecture: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
  construction: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",

  // Clean energy
  solar: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
  wind: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80",

  // Mines & minerals / industrial
  quarry: "https://images.unsplash.com/photo-1579547944212-c4f4961a8dd8?auto=format&fit=crop&w=1600&q=80",
  machinery: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",

  // Corporate
  boardroom: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  handshake: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80",
  ceo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
} as const;

export const DEFAULT_HOME_CONTENT: HomeContent = {
  intro: {
    eyebrow: "Who we are",
    heading: "Vision & Mission",
    body:
      "MS GreenPass Pvt Ltd is a diversified commercial development company headquartered in Islamabad, " +
      "concentrating on three core sectors: real estate, mines & minerals, and clean energy.\n\n" +
      "We identify, vet, and structure opportunities — then carry them through regulatory and government " +
      "pathways so partners can deploy capital with confidence, in Pakistan and beyond.",
    image: IMG.boardroom,
    imagePath: null,
    highlights: [
      "Every opportunity vetted before it is offered",
      "Structured from due diligence to government approval",
      "Direct relationships with public-sector counterparts",
      "Active across Pakistan and Saudi Arabia",
    ],
    buttonLabel: "More about us",
    buttonLink: "/about",
  },
  whyChooseUs: {
    heading: {
      eyebrow: "Focus sectors",
      heading: "Three disciplines. One bench.",
      description:
        "Real estate, mines & minerals, and clean energy — originated, vetted and structured by the same team.",
    },
    items: [
      {
        id: "wcu-vetted",
        icon: "BadgeCheck",
        title: "Vetted before it's offered",
        description:
          "Every parcel, reserve and project is checked before it reaches a partner. Nothing goes on the table unqualified.",
        order: 1,
      },
      {
        id: "wcu-access",
        icon: "KeyRound",
        title: "Public-sector access",
        description:
          "Regulatory facilitation and government pathways are part of the mandate, not an obstacle handed back to you.",
        order: 2,
      },
      {
        id: "wcu-structure",
        icon: "Handshake",
        title: "Structured partnerships",
        description:
          "Joint ventures shaped for mutual, long-term benefit — commercial, residential and corporate.",
        order: 3,
      },
      {
        id: "wcu-crossborder",
        icon: "Globe2",
        title: "Pakistan and Saudi Arabia",
        description:
          "Mandates and partnerships spanning both markets, with the relationships to move between them.",
        order: 4,
      },
      {
        id: "wcu-bench",
        icon: "Users",
        title: "A single bench, no hand-offs",
        description:
          "The people who originate a deal are the people who carry it through negotiation and approval.",
        order: 5,
      },
      {
        id: "wcu-close",
        icon: "ShieldCheck",
        title: "Built for a clean close",
        description:
          "Every step structured so capital can be deployed with confidence and the transaction completes cleanly.",
        order: 6,
      },
    ],
  },
  stats: {
    heading: {
      eyebrow: "At a glance",
      heading: "Where we operate",
      description:
        "A focused mandate across three sectors and two markets.",
    },
    items: [
      { id: "stat-sectors", label: "Focus Sectors", value: 3, suffix: "", icon: "Layers", order: 1 },
      { id: "stat-markets", label: "Markets Served", value: 2, suffix: "", icon: "Globe2", order: 2 },
      { id: "stat-mandates", label: "Active Mandates", value: 9, suffix: "", icon: "ClipboardCheck", order: 3 },
      { id: "stat-hq", label: "Headquarters", value: 1, suffix: "", icon: "Building2", order: 4 },
    ],
  },
  featuredServices: {
    eyebrow: "Focus sectors",
    heading: "Three disciplines. One bench.",
    description:
      "Real estate, mines & minerals, and clean energy — each with live mandates open to qualified partners.",
  },
  featuredPortfolio: {
    eyebrow: "Active mandates",
    heading: "Open opportunities across all three sectors",
    description:
      "Introductions to specific mandates happen after a short qualification conversation.",
  },
  testimonials: {
    eyebrow: "Partners",
    heading: "What our partners say",
    description: "Add partner statements from the admin panel once you have them on record.",
  },
  cta: {
    eyebrow: "Request a briefing",
    heading: "Tell us your sector of interest.",
    description:
      "Introductions to specific mandates happen after a short qualification conversation. We'll route you to the right next step.",
    buttonLabel: "Request a briefing",
    buttonLink: "/contact",
    backgroundImage: IMG.skyline,
  },
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  intro: {
    eyebrow: "Who we are",
    heading: "Unlocking Pakistan's land, resources, and energy potential",
    body:
      "MS GreenPass Pvt Ltd is a diversified commercial development company headquartered in Islamabad, " +
      "concentrating on three core sectors: real estate, mines & minerals, and clean energy.\n\n" +
      "We identify, vet, and structure opportunities — then carry them through regulatory and government " +
      "pathways so partners can deploy capital with confidence, in Pakistan and beyond.\n\n" +
      "Our work bridges capital and public-sector access, structuring vetted, investment-ready " +
      "opportunities for partners in Pakistan and Saudi Arabia.",
    image: IMG.skyline,
    imagePath: null,
    secondaryImage: IMG.handshake,
    secondaryImagePath: null,
  },
  vision: {
    heading: "Our Vision",
    body:
      "To be the trusted bridge between Pakistan's untapped land, resources, and energy potential and the " +
      "capital, expertise, and partnerships needed to unlock it.",
    icon: "Eye",
  },
  mission: {
    heading: "Our Mission",
    body:
      "To surface vetted, investment-ready ventures across real estate, mining, and energy — and to " +
      "structure every step, from due diligence to government approval, for a clean and confident close.",
    icon: "Target",
  },
  coreValues: {
    heading: {
      eyebrow: "How we work",
      heading: "The standards behind every mandate",
      description:
        "Drawn from how we originate, vet and structure opportunities.",
    },
    items: [
      {
        id: "cv-vetting",
        icon: "BadgeCheck",
        title: "Vetted first",
        description:
          "Every parcel we bring to the table is vetted before it's offered. Nothing reaches a partner unqualified.",
        order: 1,
      },
      {
        id: "cv-mutual",
        icon: "Handshake",
        title: "Mutual benefit",
        description:
          "Partnerships are structured for mutual, long-term benefit — not a single transaction.",
        order: 2,
      },
      {
        id: "cv-access",
        icon: "KeyRound",
        title: "Access, not obstacles",
        description:
          "We map the resource, open the door, and carry the project through regulatory and government pathways.",
        order: 3,
      },
      {
        id: "cv-confidence",
        icon: "ShieldCheck",
        title: "Confident capital",
        description:
          "Every step is structured so partners can deploy capital with confidence and close cleanly.",
        order: 4,
      },
    ],
  },
  history: {
    heading: {
      eyebrow: "Our approach",
      heading: "From origination to close",
      description: "How a mandate moves through our bench.",
    },
    milestones: [
      {
        id: "hist-identify",
        year: "01",
        title: "Identify",
        description:
          "We surface opportunities across land, mineral reserves and energy — including assets that never reach an open market.",
        order: 1,
      },
      {
        id: "hist-vet",
        year: "02",
        title: "Vet",
        description:
          "Due diligence before anything is offered. If a parcel or reserve does not stand up, it does not reach a partner.",
        order: 2,
      },
      {
        id: "hist-structure",
        year: "03",
        title: "Structure",
        description:
          "Joint ventures and commercial terms shaped for mutual, long-term benefit across Pakistan and Saudi Arabia.",
        order: 3,
      },
      {
        id: "hist-approve",
        year: "04",
        title: "Facilitate",
        description:
          "Regulatory and government pathways carried by us, built on direct relationships with public-sector counterparts.",
        order: 4,
      },
      {
        id: "hist-close",
        year: "05",
        title: "Close",
        description:
          "Every step structured so capital is deployed with confidence and the transaction completes cleanly.",
        order: 5,
      },
    ],
  },
  team: {
    eyebrow: "A single bench · no hand-offs",
    heading: "Leadership",
    description:
      "The people who originate a mandate are the people who carry it through negotiation and approval.",
  },
  ceo: {
    name: "Faraz Chaudhry",
    designation: "CEO, MS GreenPass Pvt Ltd",
    message:
      "Faraz Chaudhry leads MS GreenPass's work across real estate, mines & minerals, and clean energy, " +
      "structuring joint ventures and carrying projects through approval with partners in Pakistan and " +
      "Saudi Arabia.\n\nHis role spans commercial negotiation, regulatory facilitation, and deal " +
      "origination — built on direct relationships with public-sector counterparts.",
    photo: IMG.ceo,
    photoPath: null,
    signatureImage: null,
    signatureImagePath: null,
  },
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  companyName: "MS GreenPass",
  tagline: "Unlocking Pakistan's land, resources, and energy potential",
  logoLight: "",
  logoDark: "",
  favicon: "",
  email: "contact@msgreenpass.com",
  secondaryEmail: "",
  // No public phone number was supplied. Leaving these blank hides the phone
  // and WhatsApp affordances everywhere rather than showing empty fields.
  phone: "",
  secondaryPhone: "",
  whatsapp: "",
  address: "MS GreenPass Pvt Ltd\nIslamabad\nPakistan",
  // Generic Islamabad embed — replace with the exact office location.
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Islamabad,+Pakistan&output=embed",
  googleMapsLink: "https://maps.google.com/?q=Islamabad,+Pakistan",
  businessHours: [
    { id: "bh-1", day: "Monday – Friday", hours: "9:00 AM – 6:00 PM (PKT)", order: 1 },
    { id: "bh-2", day: "Saturday", hours: "By appointment", order: 2 },
    { id: "bh-3", day: "Sunday", hours: "Closed", order: 3 },
  ],
  // No social profiles were supplied — add them from Admin → Website settings
  // and the icons will appear automatically.
  social: {
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    github: "",
  },
  footerText:
    "A diversified commercial development company across real estate, mines & minerals, and clean energy — headquartered in Islamabad, Pakistan.",
  copyrightText: "MS GreenPass Pvt Ltd. All rights reserved.",
  contactHeading: "Request a Briefing",
  contactSubheading:
    "Introductions to specific mandates happen after a short qualification conversation. Tell us your sector of interest and we'll route you to the right next step.",
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteName: "MS GreenPass",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultOgImage: IMG.skyline,
  twitterHandle: "",
  organizationLogo: "",
  googleSiteVerification: "",
  pages: {
    home: {
      metaTitle: "MS GreenPass — Real Estate, Mines & Minerals, Clean Energy in Pakistan",
      metaDescription:
        "MS GreenPass structures vetted, investment-ready opportunities across real estate, mines & minerals, and clean energy — bridging capital and public-sector access in Pakistan and Saudi Arabia.",
      keywords: [
        "investment opportunities Pakistan",
        "real estate joint venture Pakistan",
        "mining exploration Pakistan",
        "clean energy projects Pakistan",
        "Islamabad commercial development",
        "Pakistan Saudi Arabia investment",
      ],
      ogImage: null,
      noIndex: false,
    },
    about: {
      metaTitle: "About Us",
      metaDescription:
        "MS GreenPass Pvt Ltd is a diversified commercial development company headquartered in Islamabad, working across real estate, mines & minerals, and clean energy.",
      keywords: ["about MS GreenPass", "Faraz Chaudhry", "commercial development Islamabad"],
      ogImage: null,
      noIndex: false,
    },
    services: {
      metaTitle: "Focus Sectors",
      metaDescription:
        "Three disciplines, one bench: vetted land and joint ventures, untapped mineral reserves, and solar, EV and wind opportunities across Pakistan and Saudi Arabia.",
      keywords: [
        "real estate consultancy Pakistan",
        "mines and minerals Pakistan",
        "solar EV wind Pakistan",
      ],
      ogImage: null,
      noIndex: false,
    },
    portfolio: {
      metaTitle: "Active Mandates",
      metaDescription:
        "Open opportunities across real estate, mines & minerals, and clean energy. Introductions follow a short qualification conversation.",
      keywords: ["investment mandates Pakistan", "joint venture opportunities", "exploration access"],
      ogImage: null,
      noIndex: false,
    },
    contact: {
      metaTitle: "Request a Briefing",
      metaDescription:
        "Tell us your sector of interest and we'll route you to the right next step. MS GreenPass, Islamabad, Pakistan.",
      keywords: ["contact MS GreenPass", "request a briefing", "Islamabad Pakistan"],
      ogImage: null,
      noIndex: false,
    },
  },
};

export const PLACEHOLDER_IMAGES = IMG;
