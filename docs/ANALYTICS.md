# Connecting analytics

The dashboard shows a **Website visitors** card marked *Not connected*. Traffic data lives
in Google Analytics, not Firestore, so it needs wiring up separately. This is the only
placeholder in the panel — everything else reads live data.

## 1. Create a GA4 property

<https://analytics.google.com> → Admin → Create property → Web data stream. Copy the
measurement ID (`G-XXXXXXXXXX`).

## 2. Add the tag to the public site

Add to `.env.local` and your production environment:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Then load it in `src/app/(public)/layout.tsx` — the public group only, so the admin panel
is never tracked:

```tsx
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// …inside the returned JSX:
{GA_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      strategy="afterInteractive"
    />
    <Script id="ga" strategy="afterInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());gtag('config','${GA_ID}');`}
    </Script>
  </>
)}
```

If your audience includes the EU, gate this behind a consent banner before it loads.

## 3. Surface the numbers in the dashboard

GA4 has no browser-readable API for reporting, so this needs a server route using the
Google Analytics Data API:

1. Enable the **Google Analytics Data API** in the Google Cloud console for your project.
2. Grant your Firebase service account **Viewer** on the GA4 property
   (GA Admin → Property access management).
3. `npm install @google-analytics/data`
4. Create `src/app/api/analytics/route.ts` that runs a `runReport` call for
   `activeUsers` over the last 30 days, guarded by an admin check.
5. Replace the placeholder panel in
   `src/app/admin/(dashboard)/page.tsx` with a fetch against that route.

Keep the credentials server-side. The Data API key must never reach the browser.

## Alternatives

If GA4 is more than you need, Plausible, Fathom and Umami all expose a simple JSON stats
API and drop straight into the same placeholder — usually a single fetch with a read-only
API key.
