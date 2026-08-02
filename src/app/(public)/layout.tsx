import { Footer } from "@/components/public/footer";
import { Navbar } from "@/components/public/navbar";
import { ScrollToTop } from "@/components/public/scroll-to-top";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { JsonLd } from "@/components/ui/primitives";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { getServices } from "@/lib/services/collections";
import { getSeoSettings, getWebsiteSettings } from "@/lib/services/content";

/**
 * Shell for every public route.
 *
 * Organization and WebSite structured data live here so they appear on every
 * page exactly once; page-specific JSON-LD is emitted by the pages themselves.
 */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, seo, services] = await Promise.all([
    getWebsiteSettings(),
    getSeoSettings(),
    getServices(),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(settings, seo), websiteJsonLd(seo)]} />

      <Navbar settings={settings} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer settings={settings} services={services} />

      <ScrollToTop />
      <WhatsAppButton number={settings.whatsapp} company={settings.companyName} />
    </>
  );
}
