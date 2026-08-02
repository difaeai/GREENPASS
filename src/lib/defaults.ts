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
 * Placeholder imagery points at Unsplash; replace it from the admin panel's
 * Media Library once real assets exist.
 */

const IMG = {
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  team: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80",
  meeting: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80",
  code: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=80",
  city: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  desk: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1600&q=80",
  ceo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
} as const;

export const DEFAULT_HOME_CONTENT: HomeContent = {
  intro: {
    eyebrow: "Who we are",
    heading: "Engineering the software that moves ambitious companies forward",
    body:
      "GreenPass is a product engineering partner for organisations that treat software as a competitive advantage. " +
      "We embed senior designers, engineers and cloud architects alongside your team to ship platforms that are fast, " +
      "secure and genuinely pleasant to use — then we stay to help them scale.",
    image: IMG.office,
    imagePath: null,
    highlights: [
      "Senior-only delivery squads, no hand-offs to juniors",
      "Cloud-native architecture built for scale from day one",
      "Transparent weekly demos and a shared roadmap",
      "Post-launch support and continuous optimisation",
    ],
    buttonLabel: "More about us",
    buttonLink: "/about",
  },
  whyChooseUs: {
    heading: {
      eyebrow: "Why choose us",
      heading: "A partner that behaves like part of your team",
      description:
        "We combine deep technical craft with the commercial judgement to know which problems are actually worth solving.",
    },
    items: [
      {
        id: "wcu-strategy",
        icon: "Compass",
        title: "Strategy first",
        description:
          "Every engagement opens with a discovery sprint so we build the right thing before we build the thing right.",
        order: 1,
      },
      {
        id: "wcu-team",
        icon: "Users",
        title: "Senior engineers only",
        description:
          "The people in your kickoff call are the people writing the code. No bait-and-switch staffing.",
        order: 2,
      },
      {
        id: "wcu-speed",
        icon: "Rocket",
        title: "Shipping velocity",
        description:
          "Two-week increments with working software at the end of each one, deployed to a real environment.",
        order: 3,
      },
      {
        id: "wcu-security",
        icon: "ShieldCheck",
        title: "Security by default",
        description:
          "Threat modelling, least-privilege access and automated dependency scanning are part of the baseline.",
        order: 4,
      },
      {
        id: "wcu-scale",
        icon: "TrendingUp",
        title: "Built to scale",
        description:
          "Architecture that holds up at ten times today's load, without a rewrite eighteen months from now.",
        order: 5,
      },
      {
        id: "wcu-support",
        icon: "Headphones",
        title: "Support that answers",
        description:
          "Named engineers, agreed response times and a status page you can actually trust.",
        order: 6,
      },
    ],
  },
  stats: {
    heading: {
      eyebrow: "By the numbers",
      heading: "Measured in outcomes, not hours billed",
      description: "A decade of shipping production software for clients across four continents.",
    },
    items: [
      { id: "stat-projects", label: "Projects Completed", value: 480, suffix: "+", icon: "CheckCircle2", order: 1 },
      { id: "stat-clients", label: "Happy Clients", value: 210, suffix: "+", icon: "Heart", order: 2 },
      { id: "stat-countries", label: "Countries Served", value: 26, suffix: "", icon: "Globe2", order: 3 },
      { id: "stat-years", label: "Years of Experience", value: 12, suffix: "", icon: "CalendarClock", order: 4 },
    ],
  },
  featuredServices: {
    eyebrow: "What we do",
    heading: "Services built around the whole product lifecycle",
    description:
      "From the first whiteboard sketch to a platform serving millions of requests a day — one accountable partner throughout.",
  },
  featuredPortfolio: {
    eyebrow: "Selected work",
    heading: "Recent projects we're proud of",
    description: "A sample of the platforms, apps and internal tools we've delivered over the past two years.",
  },
  testimonials: {
    eyebrow: "Client stories",
    heading: "What our clients say",
    description: "We measure success by whether teams want to work with us again. Most do.",
  },
  cta: {
    eyebrow: "Let's build something",
    heading: "Have a project in mind? Let's talk about it.",
    description:
      "Tell us where you're headed and we'll come back within one business day with a clear view of scope, timeline and cost.",
    buttonLabel: "Start a conversation",
    buttonLink: "/contact",
    backgroundImage: IMG.city,
  },
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  intro: {
    eyebrow: "About GreenPass",
    heading: "A software company built by engineers who got tired of shipping the wrong thing",
    body:
      "GreenPass started in 2013 with four engineers and one conviction: most software projects fail long before the first " +
      "line of code, in the gap between what a business needs and what gets specified. So we built a company around closing " +
      "that gap.\n\nToday we're a team of designers, engineers, cloud architects and delivery leads working with startups " +
      "scaling past their first million users and with enterprises modernising systems that have been running for decades. " +
      "The constant across both is the same: small senior teams, short feedback loops, and an obsession with the outcome " +
      "rather than the invoice.",
    image: IMG.team,
    imagePath: null,
    secondaryImage: IMG.meeting,
    secondaryImagePath: null,
  },
  vision: {
    heading: "Our Vision",
    body:
      "To be the engineering partner that ambitious organisations call first — known less for the size of our team than " +
      "for the durability of what we build and the honesty of how we build it.",
    icon: "Eye",
  },
  mission: {
    heading: "Our Mission",
    body:
      "To turn complex business problems into software that is fast, secure and genuinely enjoyable to use, delivered by " +
      "senior people who stay accountable from discovery through to long-term support.",
    icon: "Target",
  },
  coreValues: {
    heading: {
      eyebrow: "Core values",
      heading: "The principles we actually hire and fire on",
      description: "Values only matter if they cost something. These do.",
    },
    items: [
      {
        id: "cv-craft",
        icon: "Gem",
        title: "Craft over volume",
        description:
          "We would rather deliver one system that lasts a decade than ten that need replacing in eighteen months.",
        order: 1,
      },
      {
        id: "cv-candour",
        icon: "MessageSquare",
        title: "Uncomfortable candour",
        description:
          "If a requested feature is a bad idea, you will hear it from us early — with the reasoning and an alternative.",
        order: 2,
      },
      {
        id: "cv-ownership",
        icon: "KeyRound",
        title: "Total ownership",
        description:
          "You own the code, the infrastructure and the documentation. No lock-in, no hostage architecture.",
        order: 3,
      },
      {
        id: "cv-curiosity",
        icon: "Lightbulb",
        title: "Relentless curiosity",
        description:
          "Every engineer gets dedicated time to go deep on new tooling, and the obligation to teach the rest of us.",
        order: 4,
      },
    ],
  },
  history: {
    heading: {
      eyebrow: "Our history",
      heading: "Twelve years, one direction",
      description: "The moments that shaped how we work today.",
    },
    milestones: [
      {
        id: "hist-2013",
        year: "2013",
        title: "Four engineers, one room",
        description:
          "GreenPass is founded as a specialist web engineering shop, taking on the projects other agencies had abandoned.",
        order: 1,
      },
      {
        id: "hist-2016",
        year: "2016",
        title: "First enterprise platform",
        description:
          "We deliver a logistics platform still processing millions of shipments a year, and grow to twenty-five people.",
        order: 2,
      },
      {
        id: "hist-2019",
        year: "2019",
        title: "Cloud & data practice",
        description:
          "Dedicated cloud architecture and data engineering teams launch, alongside our first overseas delivery hub.",
        order: 3,
      },
      {
        id: "hist-2022",
        year: "2022",
        title: "Product design studio",
        description:
          "Design joins engineering under one roof so research, interface and implementation stop being separate contracts.",
        order: 4,
      },
      {
        id: "hist-2025",
        year: "2025",
        title: "AI engineering group",
        description:
          "We formalise an applied AI practice, embedding retrieval and agent systems into the products we already run.",
        order: 5,
      },
    ],
  },
  team: {
    eyebrow: "Our team",
    heading: "The people you'll actually work with",
    description: "Senior practitioners who have shipped, scaled and occasionally rescued production systems.",
  },
  ceo: {
    name: "Daniel Okafor",
    designation: "Founder & Chief Executive Officer",
    message:
      "When we started GreenPass, the industry standard was to sell a large team and quietly staff it with whoever was on " +
      "the bench. We built the opposite company.\n\nEvery engagement we take on is one where we would be comfortable putting " +
      "our own name on the result — because we do. That means turning down work that isn't a fit, telling clients when a " +
      "requested feature won't earn its keep, and staying long after launch to make sure the thing actually holds.\n\nIf " +
      "that sounds like the kind of partner you're looking for, I'd genuinely like to hear what you're building.",
    photo: IMG.ceo,
    photoPath: null,
    signatureImage: null,
    signatureImagePath: null,
  },
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  companyName: "GreenPass",
  tagline: "Software engineering for ambitious companies",
  logoLight: "",
  logoDark: "",
  favicon: "",
  email: "hello@greenpass.example",
  secondaryEmail: "careers@greenpass.example",
  phone: "+1 (415) 555-0142",
  secondaryPhone: "",
  whatsapp: "+14155550142",
  address: "500 Howard Street, Suite 400\nSan Francisco, CA 94105\nUnited States",
  googleMapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0396193355!2d-122.39968368468!3d37.78779497975668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807ded297e89%3A0xa4614a4b5e1e1c1!2sHoward%20St%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000",
  googleMapsLink: "https://maps.google.com/?q=500+Howard+Street+San+Francisco",
  businessHours: [
    { id: "bh-1", day: "Monday – Friday", hours: "9:00 AM – 6:00 PM", order: 1 },
    { id: "bh-2", day: "Saturday", hours: "10:00 AM – 2:00 PM", order: 2 },
    { id: "bh-3", day: "Sunday", hours: "Closed", order: 3 },
  ],
  social: {
    facebook: "https://facebook.com/",
    twitter: "https://x.com/",
    linkedin: "https://linkedin.com/",
    instagram: "https://instagram.com/",
    youtube: "",
    github: "https://github.com/",
  },
  footerText:
    "GreenPass builds and scales digital products for companies that treat software as a competitive advantage.",
  copyrightText: "GreenPass. All rights reserved.",
  contactHeading: "Let's talk about your project",
  contactSubheading:
    "Tell us what you're building. We reply to every enquiry within one business day — usually much sooner.",
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteName: "GreenPass",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  defaultOgImage: IMG.code,
  twitterHandle: "@greenpass",
  organizationLogo: "",
  googleSiteVerification: "",
  pages: {
    home: {
      metaTitle: "GreenPass — Software Engineering for Ambitious Companies",
      metaDescription:
        "GreenPass designs, builds and scales web platforms, mobile apps and cloud infrastructure for companies that treat software as a competitive advantage.",
      keywords: [
        "software development company",
        "custom software development",
        "web application development",
        "mobile app development",
        "cloud consulting",
      ],
      ogImage: null,
      noIndex: false,
    },
    about: {
      metaTitle: "About Us",
      metaDescription:
        "Meet the engineers, designers and cloud architects behind GreenPass — twelve years of shipping production software for clients across 26 countries.",
      keywords: ["about greenpass", "software company team", "engineering culture"],
      ogImage: null,
      noIndex: false,
    },
    services: {
      metaTitle: "Our Services",
      metaDescription:
        "Custom software development, mobile apps, cloud architecture, UI/UX design, data engineering and long-term product support.",
      keywords: ["software services", "IT consulting", "product engineering"],
      ogImage: null,
      noIndex: false,
    },
    portfolio: {
      metaTitle: "Portfolio",
      metaDescription:
        "Selected work from GreenPass — platforms, mobile apps and internal tools delivered for startups and enterprises worldwide.",
      keywords: ["software portfolio", "case studies", "client projects"],
      ogImage: null,
      noIndex: false,
    },
    contact: {
      metaTitle: "Contact Us",
      metaDescription:
        "Get in touch with GreenPass. Tell us about your project and we'll respond within one business day.",
      keywords: ["contact greenpass", "hire software developers", "project enquiry"],
      ogImage: null,
      noIndex: false,
    },
  },
};

export const PLACEHOLDER_IMAGES = IMG;
