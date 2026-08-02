import type {
  HomeBanner,
  PortfolioCategory,
  PortfolioProject,
  Service,
  TeamMember,
  Testimonial,
} from "@/types";
import { PLACEHOLDER_IMAGES as IMG } from "@/lib/defaults";

/**
 * Seed content for the list collections.
 *
 * Used in exactly two places:
 *  - as the payload for `npm run seed`, and
 *  - as a read-only fallback when the Admin SDK has no credentials, so
 *    `npm run dev` shows a complete site before Firebase is wired up.
 *
 * Everything here is derived from MS GreenPass's own supplied material. Where
 * the template expects a field the company has not published — completion
 * dates, client names, testimonials — the field is left empty rather than
 * filled with an invention.
 */

const now = "2025-01-01T00:00:00.000Z";
const base = { createdAt: now, updatedAt: now, isActive: true };

/* ------------------------------------------------------------------ */
/* Hero slides                                                         */
/* ------------------------------------------------------------------ */

export const SAMPLE_BANNERS: HomeBanner[] = [
  {
    ...base,
    id: "banner-1",
    order: 1,
    smallHeading: "Islamabad, Pakistan",
    mainHeading: "Unlocking Pakistan's land, resources, and energy potential",
    description:
      "MS GreenPass structures vetted, investment-ready opportunities across real estate, mines & minerals, and clean energy — bridging capital and public-sector access in Pakistan and Saudi Arabia.",
    backgroundImage: IMG.skyline,
    backgroundImagePath: null,
    buttonLabel: "Explore focus areas",
    buttonLink: "/services",
    secondaryButtonLabel: "Request a briefing",
    secondaryButtonLink: "/contact",
    overlayOpacity: 0.7,
  },
  {
    ...base,
    id: "banner-2",
    order: 2,
    smallHeading: "Sector one — Real Estate",
    mainHeading: "Land, ventures & property consultancy",
    description:
      "Every parcel we bring to the table is vetted before it's offered. From acquisition to joint venture to close, we turn land into a structured, bankable opportunity.",
    backgroundImage: IMG.architecture,
    backgroundImagePath: null,
    buttonLabel: "See mandates",
    buttonLink: "/services/real-estate",
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    overlayOpacity: 0.68,
  },
  {
    ...base,
    id: "banner-3",
    order: 3,
    smallHeading: "Sector two — Mines & Minerals",
    mainHeading: "Pakistan's untapped resource wealth",
    description:
      "Pakistan's mineral reserves remain one of the region's most underdeveloped opportunities. We map the resource, open the door, and structure the partnership.",
    backgroundImage: IMG.quarry,
    backgroundImagePath: null,
    buttonLabel: "See mandates",
    buttonLink: "/services/mines-and-minerals",
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    overlayOpacity: 0.7,
  },
  {
    ...base,
    id: "banner-4",
    order: 4,
    smallHeading: "Sector three — Clean Energy",
    mainHeading: "Solar, EV & wind potential",
    description:
      "Pakistan's energy demand is growing faster than its supply. We connect public and private sector partners to the country's immense solar, EV, and wind potential.",
    backgroundImage: IMG.solar,
    backgroundImagePath: null,
    buttonLabel: "See mandates",
    buttonLink: "/services/clean-energy",
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    overlayOpacity: 0.66,
  },
];

/* ------------------------------------------------------------------ */
/* Focus sectors                                                       */
/* ------------------------------------------------------------------ */

export const SAMPLE_SERVICES: Service[] = [
  {
    ...base,
    id: "svc-real-estate",
    order: 1,
    slug: "real-estate",
    title: "Real Estate",
    icon: "Building2",
    isFeatured: true,
    shortDescription:
      "Vetted land, joint ventures, and full-service property consultancy across Pakistan and Saudi Arabia.",
    fullDescription:
      "Every parcel we bring to the table is vetted before it's offered. From acquisition to joint venture to close, we turn land into a structured, bankable opportunity — in Pakistan and the Kingdom of Saudi Arabia.\n\nOur real estate mandate spans three lines of work: sourcing and vetting land for housing projects, structuring joint ventures across commercial, residential and corporate developments, and full-service consultancy for buying, selling and rentals.\n\nWhat separates a parcel that reaches a partner from one that does not is the diligence behind it. We carry each opportunity through the regulatory and government pathways it needs, so capital can be deployed with confidence and the transaction closes cleanly.",
    image: IMG.architecture,
    imagePath: null,
    features: [
      "Vetted land provision for housing projects",
      "JV structuring — commercial, residential & corporate",
      "Mandates in Pakistan and Saudi Arabia",
      "Consultancy for buying, selling & rentals",
      "Homes, luxury apartments & corporate offices",
      "Commercial space acquisition and disposal",
    ],
    seo: {
      metaTitle: "Real Estate — Land, Ventures & Property Consultancy",
      metaDescription:
        "Vetted land for housing projects, joint venture structuring, and full-service property consultancy across Pakistan and Saudi Arabia.",
      keywords: [
        "real estate Pakistan",
        "land for housing projects",
        "joint venture property",
        "property consultancy Islamabad",
      ],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-mines-minerals",
    order: 2,
    slug: "mines-and-minerals",
    title: "Mines & Minerals",
    icon: "Pickaxe",
    isFeatured: true,
    shortDescription:
      "Unlocking Pakistan's untapped mineral wealth for serious exploration partners.",
    fullDescription:
      "Pakistan's mineral reserves remain one of the region's most underdeveloped opportunities. We map the resource, open the door, and structure the partnership — for mutual, long-term benefit.\n\nOur work in this sector begins with highlighting untapped reserves nationwide, then arranging exploration access for established mining companies with the capability to develop them.\n\nAccess alone is not a deal. Each engagement is structured as a partnership built for mutual benefit over the long term, with the regulatory and government pathways carried by us rather than handed back to the partner.",
    image: IMG.quarry,
    imagePath: null,
    features: [
      "Highlighting untapped mineral reserves nationwide",
      "Exploration access for renowned mining companies",
      "Structured partnerships built for mutual benefit",
      "Regulatory and government pathway facilitation",
      "Resource mapping and opportunity briefing",
      "Long-term partnership structuring",
    ],
    seo: {
      metaTitle: "Mines & Minerals — Pakistan's Untapped Resource Wealth",
      metaDescription:
        "Exploration access and structured partnerships across Pakistan's underdeveloped mineral reserves, for established mining companies.",
      keywords: [
        "mining Pakistan",
        "mineral reserves Pakistan",
        "exploration access",
        "mining partnership Pakistan",
      ],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-clean-energy",
    order: 3,
    slug: "clean-energy",
    title: "Clean Energy",
    icon: "Zap",
    isFeatured: true,
    shortDescription:
      "Solar, EV, and wind opportunities backed by public and private sector partnership.",
    fullDescription:
      "Pakistan's energy demand is growing faster than its supply. We connect public and private sector partners to the country's immense solar, EV, and wind potential.\n\nOur clean energy mandate covers solar power projects backed by public and private partnership, EV infrastructure and charging network development, and wind energy project origination.\n\nEach opportunity is structured the same way as the rest of our bench: vetted before it is offered, carried through the approvals it requires, and shaped so that partners on both sides hold a durable position.",
    image: IMG.solar,
    imagePath: null,
    features: [
      "Solar power projects, backed by public & private partnership",
      "EV infrastructure & charging network development",
      "Wind energy project origination",
      "Public and private sector partnership structuring",
      "Regulatory pathway facilitation",
      "Long-horizon energy investment briefing",
    ],
    seo: {
      metaTitle: "Clean Energy — Solar, EV & Wind Potential",
      metaDescription:
        "Solar power, EV infrastructure and wind energy opportunities in Pakistan, backed by public and private sector partnership.",
      keywords: [
        "solar power Pakistan",
        "EV charging infrastructure Pakistan",
        "wind energy Pakistan",
        "clean energy investment",
      ],
      ogImage: null,
      noIndex: false,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Mandate categories                                                  */
/* ------------------------------------------------------------------ */

export const SAMPLE_CATEGORIES: PortfolioCategory[] = [
  {
    ...base,
    id: "cat-real-estate",
    order: 1,
    slug: "real-estate",
    name: "Real Estate",
    description: "Land, joint ventures and property consultancy.",
  },
  {
    ...base,
    id: "cat-mines",
    order: 2,
    slug: "mines-and-minerals",
    name: "Mines & Minerals",
    description: "Reserves, exploration access and resource partnerships.",
  },
  {
    ...base,
    id: "cat-energy",
    order: 3,
    slug: "clean-energy",
    name: "Clean Energy",
    description: "Solar, EV and wind origination.",
  },
];

/* ------------------------------------------------------------------ */
/* Active mandates                                                     */
/* ------------------------------------------------------------------ */

/**
 * These are open opportunities, not delivered case studies.
 *
 * `completionDate` is deliberately `null` throughout — the UI renders that as
 * "Ongoing". `clientName` carries the partner profile a mandate is open to,
 * which is what the detail page labels "Open to".
 */
export const SAMPLE_PROJECTS: PortfolioProject[] = [
  /* ---- Real estate ---- */
  {
    ...base,
    id: "mandate-land-housing",
    order: 1,
    slug: "vetted-land-for-housing-projects",
    title: "Vetted land provision for housing projects",
    clientName: "Housing developers & institutional investors",
    completionDate: null,
    categoryId: "cat-real-estate",
    categoryName: "Real Estate",
    shortDescription:
      "Land sourced and vetted for housing development, offered only once the diligence stands up.",
    description:
      "Every parcel we bring to the table is vetted before it's offered. This mandate covers the sourcing, diligence and provision of land suitable for housing development across Pakistan.\n\nWe carry each parcel through the regulatory and government pathways it requires, so that a developer receives a structured, bankable opportunity rather than a lead to chase.\n\nIntroductions to specific parcels happen after a short qualification conversation.",
    featuredImage: IMG.land,
    featuredImagePath: null,
    images: [],
    technologies: ["Land acquisition", "Due diligence", "Regulatory pathway", "Housing"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Vetted Land Provision for Housing Projects",
      metaDescription:
        "Land sourced and vetted for housing development in Pakistan, structured through regulatory and government pathways.",
      keywords: ["land for housing Pakistan", "vetted land", "housing development"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-jv-structuring",
    order: 2,
    slug: "joint-venture-structuring",
    title: "JV structuring — commercial, residential & corporate",
    clientName: "Developers & capital partners, Pakistan and Saudi Arabia",
    completionDate: null,
    categoryId: "cat-real-estate",
    categoryName: "Real Estate",
    shortDescription:
      "Joint ventures structured across commercial, residential and corporate development in both markets.",
    description:
      "This mandate covers the structuring of joint ventures across commercial, residential and corporate property — in Pakistan and the Kingdom of Saudi Arabia.\n\nFrom acquisition to joint venture to close, we turn land into a structured, bankable opportunity. Commercial negotiation and regulatory facilitation are carried by our bench, built on direct relationships with public-sector counterparts.\n\nPartnerships are shaped for mutual, long-term benefit rather than a single transaction.",
    featuredImage: IMG.handshake,
    featuredImagePath: null,
    images: [],
    technologies: ["Joint venture", "Commercial", "Residential", "Corporate", "Cross-border"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Joint Venture Structuring — Commercial, Residential & Corporate",
      metaDescription:
        "Property joint ventures structured across commercial, residential and corporate development in Pakistan and Saudi Arabia.",
      keywords: ["joint venture property", "JV structuring Pakistan", "Saudi Arabia real estate"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-property-consultancy",
    order: 3,
    slug: "property-buying-selling-rentals",
    title: "Consultancy for buying, selling & rentals",
    clientName: "Private buyers, corporates & landlords",
    completionDate: null,
    categoryId: "cat-real-estate",
    categoryName: "Real Estate",
    shortDescription:
      "Full-service consultancy across homes, luxury apartments, corporate offices and commercial space.",
    description:
      "A full-service property consultancy mandate covering buying, selling and rentals across homes, luxury apartments, corporate offices and commercial space.\n\nThe same diligence standard applies here as everywhere else on our bench: nothing is put in front of a client that has not been checked first.\n\nEngagements run in Pakistan and the Kingdom of Saudi Arabia.",
    featuredImage: IMG.office,
    featuredImagePath: null,
    images: [],
    technologies: ["Buying", "Selling", "Rentals", "Luxury apartments", "Corporate offices"],
    projectUrl: null,
    isFeatured: false,
    seo: {
      metaTitle: "Property Consultancy — Buying, Selling & Rentals",
      metaDescription:
        "Consultancy across homes, luxury apartments, corporate offices and commercial space in Pakistan and Saudi Arabia.",
      keywords: ["property consultancy", "luxury apartments Pakistan", "corporate offices"],
      ogImage: null,
      noIndex: false,
    },
  },

  /* ---- Mines & minerals ---- */
  {
    ...base,
    id: "mandate-reserves",
    order: 4,
    slug: "untapped-mineral-reserves",
    title: "Highlighting untapped mineral reserves nationwide",
    clientName: "Exploration and resource investors",
    completionDate: null,
    categoryId: "cat-mines",
    categoryName: "Mines & Minerals",
    shortDescription:
      "Mapping and briefing on Pakistan's underdeveloped mineral reserves.",
    description:
      "Pakistan's mineral reserves remain one of the region's most underdeveloped opportunities. This mandate covers the identification and briefing of untapped reserves nationwide.\n\nWe map the resource and prepare the opportunity so that a serious partner can assess it properly, rather than starting from a blank sheet.\n\nIntroductions to specific reserves happen after a short qualification conversation.",
    featuredImage: IMG.quarry,
    featuredImagePath: null,
    images: [],
    technologies: ["Resource mapping", "Reserve briefing", "Nationwide"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Untapped Mineral Reserves in Pakistan",
      metaDescription:
        "Identification and briefing on Pakistan's underdeveloped mineral reserves for serious exploration partners.",
      keywords: ["mineral reserves Pakistan", "untapped minerals", "resource mapping"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-exploration-access",
    order: 5,
    slug: "exploration-access",
    title: "Exploration access for renowned mining companies",
    clientName: "Established international mining companies",
    completionDate: null,
    categoryId: "cat-mines",
    categoryName: "Mines & Minerals",
    shortDescription:
      "Access arranged for established mining companies with the capability to develop a reserve.",
    description:
      "This mandate arranges exploration access for renowned mining companies — those with the technical and financial capability to take a reserve into development.\n\nWe map the resource, open the door, and structure the partnership. Regulatory and government pathways are carried by our bench, built on direct relationships with public-sector counterparts.\n\nQualification precedes any introduction.",
    featuredImage: IMG.machinery,
    featuredImagePath: null,
    images: [],
    technologies: ["Exploration access", "Government pathway", "Qualified operators"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Exploration Access for Mining Companies",
      metaDescription:
        "Exploration access in Pakistan arranged for established mining companies, with regulatory pathways carried by MS GreenPass.",
      keywords: ["exploration access Pakistan", "mining licence", "mining companies Pakistan"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-resource-partnerships",
    order: 6,
    slug: "structured-resource-partnerships",
    title: "Structured partnerships built for mutual benefit",
    clientName: "Long-horizon resource partners",
    completionDate: null,
    categoryId: "cat-mines",
    categoryName: "Mines & Minerals",
    shortDescription:
      "Resource partnerships structured for mutual, long-term benefit rather than a single transaction.",
    description:
      "Access alone is not a deal. This mandate covers the structuring of resource partnerships built for mutual, long-term benefit.\n\nCommercial terms, regulatory facilitation and public-sector engagement are handled on one bench, so a partner is not passed between intermediaries at the point where the transaction matters most.",
    featuredImage: IMG.boardroom,
    featuredImagePath: null,
    images: [],
    technologies: ["Partnership structuring", "Commercial negotiation", "Long-term"],
    projectUrl: null,
    isFeatured: false,
    seo: {
      metaTitle: "Structured Resource Partnerships",
      metaDescription:
        "Mineral resource partnerships structured for mutual, long-term benefit across Pakistan.",
      keywords: ["resource partnership", "mining joint venture Pakistan"],
      ogImage: null,
      noIndex: false,
    },
  },

  /* ---- Clean energy ---- */
  {
    ...base,
    id: "mandate-solar",
    order: 7,
    slug: "solar-power-projects",
    title: "Solar power projects, backed by public & private partnership",
    clientName: "Energy developers & institutional capital",
    completionDate: null,
    categoryId: "cat-energy",
    categoryName: "Clean Energy",
    shortDescription:
      "Solar generation opportunities structured with public and private sector partnership.",
    description:
      "Pakistan's energy demand is growing faster than its supply. This mandate covers solar power project opportunities backed by public and private sector partnership.\n\nWe connect partners to the country's immense solar potential and structure the engagement through the approvals it requires.",
    featuredImage: IMG.solar,
    featuredImagePath: null,
    images: [],
    technologies: ["Solar", "Public-private partnership", "Generation"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Solar Power Project Opportunities in Pakistan",
      metaDescription:
        "Solar generation opportunities in Pakistan, structured with public and private sector partnership.",
      keywords: ["solar projects Pakistan", "solar investment", "public private partnership energy"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-ev",
    order: 8,
    slug: "ev-infrastructure",
    title: "EV infrastructure & charging network development",
    clientName: "Mobility operators & infrastructure investors",
    completionDate: null,
    categoryId: "cat-energy",
    categoryName: "Clean Energy",
    shortDescription:
      "Electric vehicle infrastructure and charging network opportunities across Pakistan.",
    description:
      "This mandate covers electric vehicle infrastructure and the development of charging networks in Pakistan.\n\nAs with every engagement on our bench, the opportunity is vetted before it is offered and the regulatory pathway is carried by us.",
    featuredImage: IMG.construction,
    featuredImagePath: null,
    images: [],
    technologies: ["EV charging", "Infrastructure", "Network development"],
    projectUrl: null,
    isFeatured: false,
    seo: {
      metaTitle: "EV Infrastructure & Charging Networks",
      metaDescription:
        "Electric vehicle infrastructure and charging network development opportunities in Pakistan.",
      keywords: ["EV charging Pakistan", "electric vehicle infrastructure"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "mandate-wind",
    order: 9,
    slug: "wind-energy-origination",
    title: "Wind energy project origination",
    clientName: "Renewable energy developers",
    completionDate: null,
    categoryId: "cat-energy",
    categoryName: "Clean Energy",
    shortDescription:
      "Origination of wind energy projects across Pakistan's viable corridors.",
    description:
      "This mandate covers the origination of wind energy projects, connecting developers to Pakistan's wind potential.\n\nOpportunities are structured with the same discipline as the rest of our bench: vetted first, carried through approval, and shaped for a durable position on both sides.",
    featuredImage: IMG.wind,
    featuredImagePath: null,
    images: [],
    technologies: ["Wind", "Project origination", "Renewables"],
    projectUrl: null,
    isFeatured: false,
    seo: {
      metaTitle: "Wind Energy Project Origination",
      metaDescription: "Wind energy project origination opportunities across Pakistan.",
      keywords: ["wind energy Pakistan", "wind projects", "renewable origination"],
      ogImage: null,
      noIndex: false,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Leadership                                                          */
/* ------------------------------------------------------------------ */

export const SAMPLE_TEAM: TeamMember[] = [
  {
    ...base,
    id: "team-faraz-chaudhry",
    order: 1,
    name: "Faraz Chaudhry",
    position: "CEO, MS GreenPass Pvt Ltd",
    description:
      "Leads MS GreenPass across real estate, mines & minerals, and clean energy — structuring joint ventures and carrying projects through approval with partners in Pakistan and Saudi Arabia. Commercial negotiation, regulatory facilitation and deal origination, built on direct relationships with public-sector counterparts.",
    photo: IMG.ceo,
    photoPath: null,
    linkedinUrl: null,
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    email: "contact@msgreenpass.com",
  },
];

/* ------------------------------------------------------------------ */
/* Testimonials                                                        */
/* ------------------------------------------------------------------ */

/**
 * Intentionally empty.
 *
 * No partner statements were supplied, and inventing endorsements for a real
 * company would be a fabrication. The homepage testimonial section hides
 * itself while this is empty — add real quotes from Admin → Testimonials and
 * the section appears automatically.
 */
export const SAMPLE_TESTIMONIALS: Testimonial[] = [];
