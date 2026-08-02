import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";

import { Providers } from "@/components/providers";
import { getSeoSettings, getWebsiteSettings } from "@/lib/services/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Root metadata. Page-level `generateMetadata` overrides the title and
 * description; everything set here is the site-wide default.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [seo, settings] = await Promise.all([getSeoSettings(), getWebsiteSettings()]);
  const siteUrl = seo.siteUrl.replace(/\/$/, "");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.pages.home.metaTitle || `${settings.companyName} — ${settings.tagline}`,
      template: `%s | ${settings.companyName}`,
    },
    description: seo.pages.home.metaDescription ?? settings.tagline,
    applicationName: settings.companyName,
    authors: [{ name: settings.companyName, url: siteUrl }],
    creator: settings.companyName,
    publisher: settings.companyName,
    formatDetection: { telephone: true, email: true, address: true },
    icons: settings.favicon
      ? { icon: settings.favicon, apple: settings.favicon }
      : { icon: "/favicon.ico" },
    ...(seo.googleSiteVerification
      ? { verification: { google: seo.googleSiteVerification } }
      : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // `next-themes` writes the theme class here before paint; without this
      // React warns about the server/client mismatch it deliberately creates.
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full`}
    >
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
