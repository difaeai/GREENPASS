# GreenPass — Corporate Website + Admin Panel

A production-ready corporate website with a full content management panel, built on
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and Firebase.

Every piece of content on the public site is editable from `/admin` — no code changes
required to run the site day to day.

---

## Table of contents

- [What's included](#whats-included)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Firebase setup](#firebase-setup)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Admin panel](#admin-panel)
- [Security model](#security-model)
- [SEO](#seo)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)

---

## What's included

### Public website

| Page | Route | Content source |
| --- | --- | --- |
| Home | `/` | `home/content` + `home_banners` + featured services/projects + testimonials |
| About Us | `/about` | `about/content` + `team` |
| Our Services | `/services` | `services` |
| Service detail | `/services/[slug]` | `services` |
| Portfolio | `/portfolio` | `portfolio` + `portfolio_categories` |
| Project detail | `/portfolio/[slug]` | `portfolio` |
| Contact Us | `/contact` | `website_settings` |
| 404 | any unmatched route | static |

Plus: sticky navbar with mobile hamburger drawer, professional footer with newsletter
signup, dark mode (light by default), skeleton loading states, breadcrumbs, a lightbox
gallery on project pages, and a fixed bottom-right action stack holding scroll-to-top,
WhatsApp and the **AI website assistant**.

### AI website assistant

A chat widget, fixed bottom-right on every page, that answers visitor questions about the
company. It is grounded in **your own Firestore content** — sectors, mandates, leadership,
contact details — so editing a sector description in the admin panel changes what the
assistant says, with no separate knowledge base to maintain.

- Streams token-by-token from `/api/chat`; the API key stays server-side
- System prompt forbids invention: unanswerable questions are routed to the contact page
- Per-visitor rate limiting (20 messages / 10 min)
- **Works without an API key** — falls back to keyword-matching your site content and
  labels itself "basic mode" in the panel

Set `ANTHROPIC_API_KEY` in `.env.local` to enable the full assistant.

### Admin panel

Sign in at `/admin/login`. Sidebar sections:

- **Dashboard** — counts for every collection, unread query badge, recent messages and projects
- **Home page** — introduction, why-choose-us cards, statistics, section headings, CTA
- **Banner slides** — full CRUD, reorder, show/hide, per-slide overlay control
- **About page** — story, vision, mission, core values, history timeline, CEO message
- **Services** — full CRUD with per-service SEO, features list, icon picker, ordering
- **Portfolio** — full CRUD with multi-image gallery, technologies, client, dates, SEO
- **Categories** — full CRUD; renaming a category updates every project that uses it
- **Team** — full CRUD with photo and social links
- **Testimonials** — full CRUD with photo, rating and ordering
- **Contact queries** — inbox with status workflow, internal notes, search, filter, CSV export
- **Newsletter** — subscriber list, search, filter, unsubscribe toggle, CSV export
- **Media library** — central upload/browse/search/delete, alt text, reusable across every image field
- **SEO settings** — global defaults plus per-page title/description/keywords with a live search preview
- **Website settings** — logo, favicon, contact details, address, map, business hours, socials, footer
- **Administrators** — add, promote, suspend and remove admins (superadmin only)

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) |
| Animation | Framer Motion |
| Icons | Lucide + inline brand SVGs |
| Forms | React Hook Form + Zod |
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Hosting | Firebase Hosting (web frameworks) or Firebase App Hosting |
| Spam control | Google reCAPTCHA v3 + honeypot + rate limiting |
| AI assistant | Claude (`claude-opus-5`) via the Anthropic SDK, streamed |

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
#    …then fill in your Firebase values (see below)

# 3. Seed Firestore with the default content
npm run seed

# 4. Create your admin account
npm run create-admin -- you@example.com "a-strong-password" "Your Name"

# 5. Run
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the panel.

> **Before Firebase is configured**, the site still runs — it falls back to a bundled demo
> dataset so you can review the design immediately. The admin panel requires real Firebase
> credentials.

---

## Firebase setup

1. **Create a project** at <https://console.firebase.google.com>.

2. **Add a Web app** (Project settings → General → Your apps). Copy the config values into
   the `NEXT_PUBLIC_FIREBASE_*` variables in `.env.local`.

3. **Enable Authentication** → Sign-in method → **Email/Password**. There is deliberately no
   public registration screen; admin records can only be created by the `create-admin`
   script or by an existing superadmin.

4. **Create a Firestore database** in production mode.

5. **Enable Storage.**

6. **Download a service-account key** (Project settings → Service accounts → Generate new
   private key) and put it in `.env.local` using either option A or option B described in
   `.env.example`. This is only needed locally — App Hosting injects credentials
   automatically in production.

7. **Deploy the security rules and indexes:**

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # select your project
   npm run deploy:rules
   ```

8. **reCAPTCHA (recommended).** Create a v3 key pair at
   <https://www.google.com/recaptcha/admin>, then set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and
   `RECAPTCHA_SECRET_KEY`. If the secret is absent, verification is skipped and a warning is
   logged — fine locally, not acceptable in production.

---

## Project structure

```
src/
├── app/
│   ├── (public)/              # Public site route group
│   │   ├── layout.tsx         # Navbar + footer + org/website JSON-LD
│   │   ├── page.tsx           # Home
│   │   ├── about/
│   │   ├── services/[slug]/
│   │   ├── portfolio/[slug]/
│   │   └── contact/
│   ├── admin/
│   │   ├── layout.tsx         # AdminAuthProvider
│   │   ├── login/
│   │   └── (dashboard)/       # Guarded route group — every CMS screen
│   ├── api/
│   │   ├── contact/           # Contact form → Firestore (reCAPTCHA verified)
│   │   ├── newsletter/        # Subscriptions → Firestore
│   │   ├── chat/              # AI assistant (streaming, grounded in site content)
│   │   └── admin/users/       # Create/remove admins (superadmin token required)
│   ├── sitemap.ts             # Dynamic XML sitemap
│   ├── robots.ts              # Environment-aware robots.txt
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                    # Design-system primitives
│   ├── public/                # Navbar, footer, cards, hero shells
│   ├── home/  about/  portfolio/  contact/
│   └── admin/                 # Shell, modals, uploaders, editors
├── hooks/
│   └── use-collection.ts      # Shared list CRUD + reordering
├── lib/
│   ├── firebase/
│   │   ├── client.ts          # Browser SDK
│   │   ├── admin.ts           # Admin SDK (server only)
│   │   ├── repository.ts      # Admin-panel CRUD helpers
│   │   ├── storage.ts         # Uploads + media library
│   │   └── serialize.ts       # Timestamp → ISO, default merging
│   ├── services/              # Server-side read layer (cached)
│   ├── constants.ts  defaults.ts  sample-data.ts
│   ├── seo.ts  validation.ts  recaptcha.ts  rate-limit.ts  utils.ts
└── types/index.ts             # Every domain type
scripts/
├── seed.ts                    # Populate Firestore
└── create-admin.ts            # Bootstrap an administrator
firestore.rules  storage.rules  firestore.indexes.json
firebase.json    apphosting.yaml
```

---

## Data model

| Collection | Shape | Notes |
| --- | --- | --- |
| `admins` | one doc per admin, id = Auth UID | `role`, `isActive` — the authorisation source of truth |
| `website_settings` | singleton `global` | branding, contact, socials, footer |
| `home` | singleton `content` | every homepage section except the slides |
| `about` | singleton `content` | story, vision, mission, values, history, CEO |
| `seo_settings` | singleton `global` | global + per-page metadata |
| `home_banners` | list | hero slides, `order` + `isActive` |
| `services` | list | own `slug`, `seo`, `features`, `isFeatured` |
| `portfolio` | list | own `slug`, `seo`, `images[]`, `technologies[]` |
| `portfolio_categories` | list | `name` is denormalised onto each project |
| `team` | list | photo + social links |
| `testimonials` | list | photo, rating, feedback |
| `contact_queries` | list | `status`: `new` → `read` → `in_progress` → `completed` |
| `newsletter_subscribers` | list, id = encoded email | idempotent subscribe |
| `media_library` | list | index over Storage objects |

Every list collection carries `order: number` and `isActive: boolean`. The public read
layer filters on `isActive` and sorts by `order` in memory, so no composite index is needed
for the common path.

Storage folders mirror the content types: `/banners`, `/services`, `/portfolio`, `/team`,
`/testimonials`, `/company`, `/general`.

---

## Admin panel

**Ownership of uploaded files.** Image fields store both a `url` and a `path`. A `path` means
*this record uploaded this file* — deleting the record deletes the file. Images picked from
the Media Library are stored with `path: null` on purpose, so removing them from one record
never deletes a file another record may still be using. Delete shared files from the Media
Library screen instead.

**Ordering.** The up/down controls write a whole new order in a single Firestore batch, so
the public site never observes two items sharing an `order`. Reordering is disabled while a
search or filter is active, since positions would be ambiguous.

**Roles.** Managed under **Admin → Administrators**.

| Role | Content CRUD | Manage admins |
| --- | --- | --- |
| `superadmin` | ✅ | ✅ |
| `admin` | ✅ | ❌ |
| `editor` | ✅ | ❌ |

Suspending an admin revokes access immediately — the rules check `isActive` on every read
and write, not just at sign-in. Removing an admin deletes their `admins` document and clears
their custom claims, but leaves the Firebase Auth account intact. The last remaining
superadmin cannot be removed, and nobody can remove their own access.

Creating and removing admins runs through `POST`/`DELETE /api/admin/users`, which verifies
the caller's ID token (with `checkRevoked`) and requires an active superadmin — the browser
SDK cannot create Auth users. Role and status changes go straight to Firestore, where the
rules already restrict them.

---

## Security model

The admin UI is a convenience gate. The real boundary is `firestore.rules` and
`storage.rules` — bypassing the UI gains nothing.

- **Writes require an active admin document.** Being signed in to Firebase Auth is never
  sufficient; `admins/{uid}` must exist with `isActive == true`.
- **Only a superadmin can write to `admins`.** This is the privilege-escalation boundary. A
  regular admin can update nothing on their own record except `lastLoginAt`.
- **Contact and newsletter documents are create-only** from the public, with field-level
  validation in the rules. Only admins can read them back.
- **`media_library` is admin-only for reads** — the file URLs are public, the index is not.
- **Everything unmatched is denied** by a final catch-all rule.

The contact endpoint additionally applies, in order: per-IP rate limiting → Zod schema
validation → honeypot check → reCAPTCHA verification → write. reCAPTCHA failures **fail
closed**: if Google is unreachable, the submission is rejected rather than waved through.
Raw IPs are never stored — only a non-reversible fingerprint.

`/admin` is `noindex, nofollow` via both response headers and route metadata, and is
disallowed in `robots.txt`.

---

## SEO

- Per-page `generateMetadata` merging document SEO → page SEO → global defaults
- Open Graph and Twitter Card tags on every page
- Canonical URLs on every page
- JSON-LD: `Organization`, `WebSite`, `BreadcrumbList`, `Service`, `CreativeWork`, `ContactPage`, `ItemList`
- `/sitemap.xml` — regenerated hourly, includes every service and project, respects `noIndex`
- `/robots.txt` — **blocks all crawling** unless `NEXT_PUBLIC_ALLOW_INDEXING=true` on a
  production build, so staging and preview deployments cannot be indexed by accident
- Character counters in the admin warn before titles and descriptions get truncated

---

## Performance

- Server Components fetch data; only interactive pieces ship JavaScript
- ISR with a 300-second revalidate on content pages; service and project pages are
  pre-rendered from `generateStaticParams` and new slugs render on demand
- `next/image` everywhere via `SmartImage`, with AVIF/WebP, lazy loading below the fold,
  shimmer placeholders and a graceful fallback when an admin-supplied URL 404s
- React `cache()` deduplicates Firestore reads within a single request
- Dashboard counts use `getCountFromServer` — one document read per aggregate instead of
  downloading whole collections
- `optimizePackageImports` keeps icon and animation bundles out of pages that don't use them
- Immutable cache headers on `/_next/static` and image assets

---

## Accessibility

- Skip-to-content link, landmark regions, and a logical heading order on every page
- Full keyboard support in the carousel, lightbox, modals and menus, with focus trapping
  and focus restoration on close
- `aria-live` announcements for filter results, save states and form status
- Carousels pause on hover and focus; all motion collapses under `prefers-reduced-motion`
- Visible focus rings, labelled controls, and `aria-invalid` + `role="alert"` on field errors
- Colour pairings target WCAG AA in both light and dark themes

---

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full walkthrough of both options.

Short version — Firebase Hosting with the web-frameworks integration:

```bash
firebase experiments:enable webframeworks
firebase login
firebase use --add
npm run deploy
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run seed` | Populate Firestore with default content (`-- --force` to overwrite) |
| `npm run create-admin` | Create or promote an administrator |
| `npm run deploy` | Build, then `firebase deploy` |
| `npm run deploy:rules` | Deploy Firestore rules, indexes and Storage rules only |
| `npm run emulators` | Start the Firebase emulator suite |

---

## Troubleshooting

**"Firebase is not configured" on the login screen.**
`.env.local` is missing or incomplete. It must contain at least
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and
`NEXT_PUBLIC_FIREBASE_APP_ID`. Restart the dev server after editing it.

**"This account is not registered as an administrator."**
The Auth user exists but `admins/{uid}` does not. Run
`npm run create-admin -- <that email> "<password>" "<name>"` — it promotes an existing
account rather than failing.

**`[firebase-admin] No credentials found` during build.**
Expected without a service account; pages render from the bundled demo data instead of
crashing. Add the `FIREBASE_*` variables to fetch real content at build time.

**Permission denied when saving in the admin panel.**
Deploy the rules: `npm run deploy:rules`. Then confirm your `admins/{uid}` document has
`isActive: true`.

**Images don't render after pasting an external URL.**
Add the hostname to `remotePatterns` in `next.config.ts` — `next/image` refuses unlisted
hosts by design.

**Contact form returns 503.**
The Admin SDK has no credentials in the running environment, so the write is refused rather
than silently dropped. Check the server-side `FIREBASE_*` variables.
