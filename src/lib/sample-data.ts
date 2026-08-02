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
 * Demo content for the list collections.
 *
 * Used in exactly two places:
 *  - as the payload for `npm run seed`, and
 *  - as a read-only fallback when the Admin SDK has no credentials, so
 *    `npm run dev` shows a complete site before Firebase is wired up.
 *
 * Once Firestore is seeded these are never read again.
 */

const now = "2025-01-01T00:00:00.000Z";

const base = { createdAt: now, updatedAt: now, isActive: true };

export const SAMPLE_BANNERS: HomeBanner[] = [
  {
    ...base,
    id: "banner-1",
    order: 1,
    smallHeading: "Product engineering partner",
    mainHeading: "We build software that earns its place in your business",
    description:
      "Senior designers and engineers, embedded with your team, shipping production software in two-week increments.",
    backgroundImage: IMG.code,
    backgroundImagePath: null,
    buttonLabel: "Start a project",
    buttonLink: "/contact",
    secondaryButtonLabel: "See our work",
    secondaryButtonLink: "/portfolio",
    overlayOpacity: 0.68,
  },
  {
    ...base,
    id: "banner-2",
    order: 2,
    smallHeading: "Cloud & platform",
    mainHeading: "Architecture that holds up at ten times today's load",
    description:
      "Cloud-native platforms designed for scale, observability and cost control from the very first deployment.",
    backgroundImage: IMG.city,
    backgroundImagePath: null,
    buttonLabel: "Explore services",
    buttonLink: "/services",
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    overlayOpacity: 0.7,
  },
  {
    ...base,
    id: "banner-3",
    order: 3,
    smallHeading: "Design & experience",
    mainHeading: "Interfaces your customers do not have to be taught",
    description:
      "Research-led product design that turns complicated workflows into something people reach for by choice.",
    backgroundImage: IMG.desk,
    backgroundImagePath: null,
    buttonLabel: "Talk to a designer",
    buttonLink: "/contact",
    secondaryButtonLabel: null,
    secondaryButtonLink: null,
    overlayOpacity: 0.66,
  },
];

export const SAMPLE_SERVICES: Service[] = [
  {
    ...base,
    id: "svc-web",
    order: 1,
    slug: "web-development",
    title: "Web Development",
    icon: "Globe2",
    isFeatured: true,
    shortDescription:
      "High-performance web platforms built on modern frameworks, tuned for Core Web Vitals and search visibility.",
    fullDescription:
      "We build web applications that stay fast as they grow. Every project starts with a technical discovery covering data model, access patterns and traffic expectations, so the architecture matches the load it will actually see.\n\nOur stack of choice is React and Next.js on a typed backend, deployed to a managed cloud runtime with preview environments on every pull request. Accessibility, performance budgets and SEO are enforced in CI rather than audited after launch — which is why our builds routinely score in the mid-nineties on Lighthouse without a remediation phase.",
    image: IMG.code,
    imagePath: null,
    features: [
      "Next.js and React with full TypeScript coverage",
      "Server-side rendering and edge caching for sub-second loads",
      "Design systems and reusable component libraries",
      "Headless CMS and commerce integrations",
      "Automated accessibility and performance budgets in CI",
      "Preview deployments on every pull request",
    ],
    seo: {
      metaTitle: "Web Development Services",
      metaDescription:
        "Custom web application development with Next.js, React and TypeScript — fast, accessible, SEO-ready platforms built to scale.",
      keywords: ["web development", "next.js development", "react development agency"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-mobile",
    order: 2,
    slug: "mobile-app-development",
    title: "Mobile App Development",
    icon: "Smartphone",
    isFeatured: true,
    shortDescription:
      "Native-quality iOS and Android apps from a single codebase, with offline support and hardened release pipelines.",
    fullDescription:
      "Mobile is where user tolerance is lowest: a slow launch or a broken offline state and the app gets deleted. We build with that constraint in front of us.\n\nMost engagements use React Native or Flutter to share logic across platforms while keeping platform-specific behaviour where it matters — navigation, gestures, notifications. Offline-first data sync, biometric authentication and staged rollouts through TestFlight and Play Console are standard rather than extras.",
    image: IMG.desk,
    imagePath: null,
    features: [
      "React Native and Flutter cross-platform delivery",
      "Offline-first sync with conflict resolution",
      "Push notifications and deep linking",
      "Biometric and social authentication",
      "Automated store submission pipelines",
      "Crash reporting and release-over-release analytics",
    ],
    seo: {
      metaTitle: "Mobile App Development Services",
      metaDescription:
        "iOS and Android app development with React Native and Flutter — offline-capable, secure and ready for the app stores.",
      keywords: ["mobile app development", "react native agency", "flutter development"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-cloud",
    order: 3,
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    icon: "Cloud",
    isFeatured: true,
    shortDescription:
      "Infrastructure as code, CI/CD pipelines and observability that turn deployments into a non-event.",
    fullDescription:
      "Shipping should be boring. We build the infrastructure that makes it so.\n\nEverything is defined in code — Terraform for cloud resources, containerised workloads, environment parity from local through to production. Pipelines run tests, security scans and infrastructure plans before anything reaches a live environment, and every service ships with dashboards, alerts and a runbook. For teams inheriting an existing estate, we start with a cost and reliability audit and work down the list from there.",
    image: IMG.city,
    imagePath: null,
    features: [
      "Terraform-managed AWS, GCP and Azure environments",
      "Containerised workloads on Kubernetes or serverless runtimes",
      "Zero-downtime blue/green and canary deployments",
      "Centralised logging, tracing and alerting",
      "Cost optimisation and rightsizing reviews",
      "Disaster recovery planning and restore drills",
    ],
    seo: {
      metaTitle: "Cloud & DevOps Consulting",
      metaDescription:
        "Cloud architecture, Terraform infrastructure as code, CI/CD pipelines and observability for teams that need to ship safely.",
      keywords: ["devops consulting", "cloud architecture", "terraform consulting"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-design",
    order: 4,
    slug: "ui-ux-design",
    title: "UI/UX Design",
    icon: "PenTool",
    isFeatured: true,
    shortDescription:
      "Research-led product design — from discovery interviews through to a production-ready design system.",
    fullDescription:
      "Good design is a research output, not a rendering style. We start with the people who will actually use the product: interviews, task analysis, a hard look at where the current experience leaks users.\n\nFrom there we move quickly to interactive prototypes that can be tested before a line of production code exists. What ships to engineering is a documented design system — tokens, components, states, accessibility annotations — so the built product matches the design without a month of pixel negotiation.",
    image: IMG.meeting,
    imagePath: null,
    features: [
      "User research, interviews and usability testing",
      "Information architecture and user-flow mapping",
      "Interactive prototypes in Figma",
      "Design systems with tokens and documented states",
      "WCAG 2.2 AA accessibility annotation",
      "Design QA through to production release",
    ],
    seo: {
      metaTitle: "UI/UX Design Services",
      metaDescription:
        "Research-led UI and UX design, interactive prototyping and production design systems for web and mobile products.",
      keywords: ["ui ux design agency", "product design services", "design systems"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-data",
    order: 5,
    slug: "data-engineering-ai",
    title: "Data Engineering & AI",
    icon: "BrainCircuit",
    isFeatured: false,
    shortDescription:
      "Pipelines, warehouses and applied AI features grounded in your own data rather than a generic model.",
    fullDescription:
      "Most AI projects fail on data plumbing, not modelling. We start by making the data trustworthy: ingestion pipelines, a warehouse with tested transformations, and lineage you can point an auditor at.\n\nOn top of that foundation we build the features that actually move numbers — retrieval-augmented assistants grounded in your documentation, forecasting models wired into operational dashboards, classification that removes manual triage. Every model ships with evaluation harnesses so quality regressions are caught before users find them.",
    image: IMG.office,
    imagePath: null,
    features: [
      "Batch and streaming ingestion pipelines",
      "Cloud data warehouse design and dbt transformations",
      "Retrieval-augmented generation over private data",
      "Forecasting and classification models in production",
      "Evaluation harnesses and drift monitoring",
      "Executive dashboards and self-serve analytics",
    ],
    seo: {
      metaTitle: "Data Engineering & AI Services",
      metaDescription:
        "Data pipelines, warehouse modelling and applied AI features — including retrieval-augmented assistants grounded in your own data.",
      keywords: ["data engineering", "ai consulting", "rag implementation"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "svc-support",
    order: 6,
    slug: "managed-support",
    title: "Managed Support",
    icon: "LifeBuoy",
    isFeatured: false,
    shortDescription:
      "Named engineers, agreed response times and continuous improvement after the launch confetti settles.",
    fullDescription:
      "Launch is the start of a product's life, not the end of the engagement. Our managed support plans keep the same engineers who built the system available to run it.\n\nThat covers the unglamorous work that determines whether software survives: dependency and security patching, performance regression hunting, capacity planning ahead of seasonal peaks, and a monthly report that tells you honestly what broke and what we changed. Response-time commitments are contractual, and escalation reaches a human rather than a queue.",
    image: IMG.team,
    imagePath: null,
    features: [
      "Contractual response and resolution targets",
      "Named engineers who know your codebase",
      "Proactive security and dependency patching",
      "Performance monitoring and regression triage",
      "Capacity planning ahead of peak periods",
      "Monthly reporting with a prioritised backlog",
    ],
    seo: {
      metaTitle: "Managed Application Support",
      metaDescription:
        "Ongoing application support and maintenance with named engineers, contractual SLAs and proactive security patching.",
      keywords: ["application support", "software maintenance", "managed services"],
      ogImage: null,
      noIndex: false,
    },
  },
];

export const SAMPLE_CATEGORIES: PortfolioCategory[] = [
  { ...base, id: "cat-web", order: 1, slug: "web-platforms", name: "Web Platforms", description: "Customer-facing web products and portals." },
  { ...base, id: "cat-mobile", order: 2, slug: "mobile-apps", name: "Mobile Apps", description: "iOS and Android applications." },
  { ...base, id: "cat-cloud", order: 3, slug: "cloud-infrastructure", name: "Cloud & Infrastructure", description: "Platform, DevOps and migration work." },
  { ...base, id: "cat-ai", order: 4, slug: "data-ai", name: "Data & AI", description: "Analytics platforms and applied AI systems." },
];

function gallery(...urls: string[]) {
  return urls.map((url, i) => ({ url, path: null, alt: `Project screenshot ${i + 1}` }));
}

export const SAMPLE_PROJECTS: PortfolioProject[] = [
  {
    ...base,
    id: "prj-atlas",
    order: 1,
    slug: "atlas-logistics-platform",
    title: "Atlas Logistics Platform",
    clientName: "Atlas Freight Group",
    completionDate: "2025-04-18T00:00:00.000Z",
    categoryId: "cat-web",
    categoryName: "Web Platforms",
    shortDescription:
      "A shipment orchestration platform replacing eleven spreadsheets and a decade-old desktop client.",
    description:
      "Atlas Freight moved 40,000 shipments a month across a patchwork of spreadsheets, email threads and a Windows client nobody had source code for. Dispatchers spent more time reconciling data than routing freight.\n\nWe rebuilt the operation as a single web platform: real-time shipment tracking, automated carrier selection against negotiated rate cards, exception queues that surface problems before customers notice, and a customer portal that removed roughly 300 status-check calls a week. The rollout ran region by region over four months with zero unplanned downtime.\n\nSix months after launch, average dispatch time was down 46% and the platform was handling peak-season volume on the same infrastructure footprint.",
    featuredImage: IMG.city,
    featuredImagePath: null,
    images: gallery(IMG.city, IMG.code, IMG.office, IMG.desk),
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "AWS", "Terraform"],
    projectUrl: "https://example.com",
    isFeatured: true,
    seo: {
      metaTitle: "Atlas Logistics Platform — Case Study",
      metaDescription:
        "How GreenPass replaced a legacy dispatch system with a real-time logistics platform, cutting average dispatch time by 46%.",
      keywords: ["logistics software case study", "freight platform development"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "prj-north",
    order: 2,
    slug: "northwind-banking-app",
    title: "Northwind Mobile Banking",
    clientName: "Northwind Credit Union",
    completionDate: "2025-02-06T00:00:00.000Z",
    categoryId: "cat-mobile",
    categoryName: "Mobile Apps",
    shortDescription:
      "A ground-up mobile banking app for 180,000 members, built to work on a patchy rural signal.",
    description:
      "Northwind's members are spread across a largely rural service area where connectivity is unreliable. The incumbent app assumed a stable connection and failed badly without one.\n\nWe designed an offline-first architecture: balances, recent transactions and payees cache locally, transfers queue and reconcile when signal returns, and the interface tells members exactly what state their money is in rather than spinning. Biometric login, card freeze and dispute filing all work from the account screen.\n\nThe app shipped to both stores in seven months and moved from 2.4 to 4.7 stars within a quarter, with support call volume down 31%.",
    featuredImage: IMG.desk,
    featuredImagePath: null,
    images: gallery(IMG.desk, IMG.meeting, IMG.code),
    technologies: ["React Native", "TypeScript", "GraphQL", "Node.js", "Azure"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Northwind Mobile Banking — Case Study",
      metaDescription:
        "An offline-first mobile banking app for 180,000 credit union members, rebuilt from scratch by GreenPass.",
      keywords: ["mobile banking app development", "fintech case study"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "prj-helio",
    order: 3,
    slug: "helio-cloud-migration",
    title: "Helio Cloud Migration",
    clientName: "Helio Energy",
    completionDate: "2024-11-22T00:00:00.000Z",
    categoryId: "cat-cloud",
    categoryName: "Cloud & Infrastructure",
    shortDescription:
      "Lifting a 14-year-old monolith out of a leased data centre and onto Kubernetes, without a maintenance window.",
    description:
      "Helio's core trading system ran on hardware in a data centre whose lease was ending in nine months. A rewrite was off the table; the system had to move as-is and then improve.\n\nWe containerised the monolith, moved state into managed services, and cut traffic over service by service behind a routing layer that could fail back instantly. Terraform replaced a decade of manual configuration, and every environment became reproducible from scratch in under an hour.\n\nThe migration completed six weeks ahead of the lease deadline with no customer-visible downtime, and infrastructure spend landed 38% below the data-centre run rate.",
    featuredImage: IMG.office,
    featuredImagePath: null,
    images: gallery(IMG.office, IMG.city, IMG.code),
    technologies: ["Kubernetes", "Terraform", "GCP", "Go", "Prometheus", "Grafana"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Helio Cloud Migration — Case Study",
      metaDescription:
        "A zero-downtime data centre to Kubernetes migration that cut infrastructure spend by 38%.",
      keywords: ["cloud migration case study", "kubernetes migration"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "prj-verity",
    order: 4,
    slug: "verity-claims-assistant",
    title: "Verity Claims Assistant",
    clientName: "Verity Insurance",
    completionDate: "2025-06-30T00:00:00.000Z",
    categoryId: "cat-ai",
    categoryName: "Data & AI",
    shortDescription:
      "A retrieval-grounded assistant that cut first-response time on complex claims from days to minutes.",
    description:
      "Verity's claims handlers were spending the first day of every complex claim reading policy documents to establish what was covered. The answers existed; finding them was the bottleneck.\n\nWe built an assistant grounded strictly in Verity's own policy corpus and claims history, with citations back to the source clause on every answer and a hard refusal when the corpus does not support a conclusion. Handlers stay in control — the system drafts and cites, it does not decide.\n\nAn evaluation harness runs against a labelled set of 1,200 historical claims on every model or prompt change. First-response time on complex claims fell from 2.3 days to under 20 minutes, with handler-reported answer accuracy above 94%.",
    featuredImage: IMG.meeting,
    featuredImagePath: null,
    images: gallery(IMG.meeting, IMG.team, IMG.office),
    technologies: ["Python", "FastAPI", "pgvector", "Next.js", "AWS Bedrock"],
    projectUrl: null,
    isFeatured: true,
    seo: {
      metaTitle: "Verity Claims Assistant — Case Study",
      metaDescription:
        "A citation-grounded AI assistant for insurance claims handlers, cutting first-response time from days to minutes.",
      keywords: ["ai insurance case study", "rag assistant development"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "prj-orchard",
    order: 5,
    slug: "orchard-commerce-replatform",
    title: "Orchard Commerce Replatform",
    clientName: "Orchard Home",
    completionDate: "2024-09-12T00:00:00.000Z",
    categoryId: "cat-web",
    categoryName: "Web Platforms",
    shortDescription:
      "A headless commerce rebuild that took the storefront from a 4.8s to a 0.9s largest contentful paint.",
    description:
      "Orchard's storefront was losing mobile customers before the first product image rendered. Page weight had crept past six megabytes and every campaign landing page was a bespoke template.\n\nWe replatformed onto a headless architecture with a component-driven storefront, edge-cached product data and a merchandising interface the marketing team could actually use without a developer. Image pipelines, font loading and third-party scripts were all rebuilt against a strict performance budget enforced in CI.\n\nLargest contentful paint dropped from 4.8s to 0.9s on a mid-range Android device, and mobile conversion rose 22% in the first quarter after launch.",
    featuredImage: IMG.code,
    featuredImagePath: null,
    images: gallery(IMG.code, IMG.desk, IMG.city),
    technologies: ["Next.js", "Shopify", "GraphQL", "Vercel Edge", "TypeScript"],
    projectUrl: "https://example.com",
    isFeatured: false,
    seo: {
      metaTitle: "Orchard Commerce Replatform — Case Study",
      metaDescription:
        "A headless commerce rebuild that cut largest contentful paint from 4.8s to 0.9s and lifted mobile conversion 22%.",
      keywords: ["headless commerce case study", "ecommerce performance"],
      ogImage: null,
      noIndex: false,
    },
  },
  {
    ...base,
    id: "prj-meridian",
    order: 6,
    slug: "meridian-field-operations",
    title: "Meridian Field Operations",
    clientName: "Meridian Utilities",
    completionDate: "2025-05-09T00:00:00.000Z",
    categoryId: "cat-mobile",
    categoryName: "Mobile Apps",
    shortDescription:
      "A field engineering app that works underground, in basements and anywhere else the signal dies.",
    description:
      "Meridian's field engineers work in exactly the places mobile data does not reach: substations, basements, trenches. Paper job sheets were still the fallback, and re-keying them consumed a full back-office role.\n\nWe built an app that assumes no connection: full job packs sync overnight, evidence photos and readings capture locally, and everything reconciles when the van returns to coverage. Digital signatures and asset scanning removed the paper trail entirely.\n\nRe-keying disappeared as a job function, and average job completion time dropped 27% across a fleet of 340 engineers.",
    featuredImage: IMG.team,
    featuredImagePath: null,
    images: gallery(IMG.team, IMG.office, IMG.meeting),
    technologies: ["Flutter", "Dart", "SQLite", "Firebase", "Cloud Functions"],
    projectUrl: null,
    isFeatured: false,
    seo: {
      metaTitle: "Meridian Field Operations — Case Study",
      metaDescription:
        "An offline-capable field operations app for 340 utility engineers, cutting job completion time by 27%.",
      keywords: ["field service app", "offline mobile app case study"],
      ogImage: null,
      noIndex: false,
    },
  },
];

export const SAMPLE_TEAM: TeamMember[] = [
  {
    ...base,
    id: "team-1",
    order: 1,
    name: "Daniel Okafor",
    position: "Founder & Chief Executive Officer",
    description:
      "Founded GreenPass in 2013 after a decade building trading systems. Still reviews architecture on every engagement over $250k.",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: "https://x.com/",
    email: "daniel@greenpass.example",
  },
  {
    ...base,
    id: "team-2",
    order: 2,
    name: "Priya Raghavan",
    position: "Chief Technology Officer",
    description:
      "Leads our engineering practice and the cloud architecture group. Previously scaled infrastructure for a 40-million-user marketplace.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    email: "priya@greenpass.example",
  },
  {
    ...base,
    id: "team-3",
    order: 3,
    name: "Marcus Lindqvist",
    position: "Head of Product Design",
    description:
      "Runs the design studio. Believes every interface decision should be traceable to something a real user said out loud.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: "https://instagram.com/",
    twitterUrl: null,
    email: "marcus@greenpass.example",
  },
  {
    ...base,
    id: "team-4",
    order: 4,
    name: "Amara Bello",
    position: "Director of Delivery",
    description:
      "Keeps 14 concurrent engagements honest about scope and timeline. The person clients thank in the retrospective.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    email: "amara@greenpass.example",
  },
  {
    ...base,
    id: "team-5",
    order: 5,
    name: "Tomás Herrera",
    position: "Principal Cloud Architect",
    description:
      "Has migrated more legacy systems out of leased data centres than he cares to count. Terraform evangelist, reluctantly.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    email: "tomas@greenpass.example",
  },
  {
    ...base,
    id: "team-6",
    order: 6,
    name: "Sarah Chen",
    position: "Head of Data & AI",
    description:
      "Builds the evaluation harnesses before the models. Convinced most AI failures are data failures wearing a costume.",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
    photoPath: null,
    linkedinUrl: "https://linkedin.com/",
    facebookUrl: null,
    instagramUrl: null,
    twitterUrl: null,
    email: "sarah@greenpass.example",
  },
];

export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    ...base,
    id: "tst-1",
    order: 1,
    name: "Helen Marsh",
    company: "Atlas Freight Group",
    designation: "Chief Operating Officer",
    rating: 5,
    feedback:
      "We had been told a replacement for our dispatch system would take two years. GreenPass had the first region live in four months and the whole network migrated inside a year. What impressed me most was how often they pushed back on things we asked for — always with a better alternative attached.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    photoPath: null,
  },
  {
    ...base,
    id: "tst-2",
    order: 2,
    name: "Jonas Weber",
    company: "Northwind Credit Union",
    designation: "VP of Digital",
    rating: 5,
    feedback:
      "Our members live where the signal drops. GreenPass understood that constraint better than we did and designed around it from the first sketch. The app went from 2.4 stars to 4.7 in a quarter, and our call centre finally has room to breathe.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    photoPath: null,
  },
  {
    ...base,
    id: "tst-3",
    order: 3,
    name: "Ingrid Solberg",
    company: "Helio Energy",
    designation: "Director of Technology",
    rating: 5,
    feedback:
      "A data centre exit with a hard deadline and no rewrite budget is not a fun brief. They delivered it six weeks early with no downtime our customers could detect, and we came out 38% cheaper on infrastructure. I have already recommended them twice.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    photoPath: null,
  },
  {
    ...base,
    id: "tst-4",
    order: 4,
    name: "Rafael Costa",
    company: "Verity Insurance",
    designation: "Head of Claims",
    rating: 5,
    feedback:
      "Every vendor we spoke to promised an AI assistant. GreenPass was the only one who led with how they would prove it was right, and what it would do when it was not sure. That evaluation harness is the reason our handlers actually trust the thing.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    photoPath: null,
  },
  {
    ...base,
    id: "tst-5",
    order: 5,
    name: "Claire Dubois",
    company: "Orchard Home",
    designation: "Chief Marketing Officer",
    rating: 5,
    feedback:
      "They rebuilt our storefront and, almost as an aside, gave my team the ability to launch a campaign page without filing a ticket. Mobile conversion is up 22% and I have stopped apologising for our site speed in board meetings.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    photoPath: null,
  },
];
