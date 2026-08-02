"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/admin/image-uploader";
import { AdminLoading, AdminPageHeader, Panel, SaveBar, TagInput } from "@/components/admin/ui";
import { FieldGroup, Input, Switch, Textarea } from "@/components/ui/form";
import { COLLECTIONS, DOC_IDS, STORAGE_FOLDERS } from "@/lib/constants";
import { DEFAULT_SEO_SETTINGS } from "@/lib/defaults";
import { getSingleton, saveSingleton } from "@/lib/firebase/repository";
import { withDefaults } from "@/lib/firebase/serialize";
import { cn } from "@/lib/utils";
import type { SeoPageKey, SeoSettings } from "@/types";

const PAGES: { key: SeoPageKey; label: string; path: string }[] = [
  { key: "home", label: "Home", path: "/" },
  { key: "about", label: "About Us", path: "/about" },
  { key: "services", label: "Our Services", path: "/services" },
  { key: "portfolio", label: "Portfolio", path: "/portfolio" },
  { key: "contact", label: "Contact Us", path: "/contact" },
];

export default function SeoSettingsPage() {
  const [seo, setSeo] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activePage, setActivePage] = useState<SeoPageKey>("home");

  useEffect(() => {
    let cancelled = false;

    getSingleton<SeoSettings>(COLLECTIONS.seoSettings, DOC_IDS.seoSettings)
      .then((stored) => {
        if (!cancelled) setSeo(withDefaults(DEFAULT_SEO_SETTINGS, stored));
      })
      .catch((error) => {
        console.error("[seo] Failed to load:", error);
        toast.error("Could not load the SEO settings.");
        if (!cancelled) setSeo(DEFAULT_SEO_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(partial: Partial<SeoSettings>) {
    setSeo((state) => (state ? { ...state, ...partial } : state));
    setDirty(true);
  }

  function patchPage(key: SeoPageKey, partial: Partial<SeoSettings["pages"][SeoPageKey]>) {
    setSeo((state) =>
      state
        ? { ...state, pages: { ...state.pages, [key]: { ...state.pages[key], ...partial } } }
        : state,
    );
    setDirty(true);
  }

  async function handleSave() {
    if (!seo) return;
    setSaving(true);

    try {
      await saveSingleton(COLLECTIONS.seoSettings, DOC_IDS.seoSettings, seo);
      setDirty(false);
      toast.success("SEO settings saved.");
    } catch (error) {
      console.error("[seo] Save failed:", error);
      toast.error("Could not save the SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !seo) return <AdminLoading label="Loading SEO settings…" />;

  const current = seo.pages[activePage];
  const currentPage = PAGES.find((page) => page.key === activePage)!;
  const titleLength = (current.metaTitle ?? "").length;
  const descriptionLength = (current.metaDescription ?? "").length;

  return (
    <div>
      <AdminPageHeader
        title="SEO settings"
        description="Global search settings plus per-page titles and descriptions. Services and projects carry their own SEO fields inside their editors."
      />

      <div className="space-y-5">
        <FieldGroup title="Global">
          <Input
            label="Site name"
            description="Used in Open Graph tags and the browser title template."
            value={seo.siteName}
            onChange={(event) => patch({ siteName: event.target.value })}
          />

          <Input
            label="Site URL"
            description="Read from NEXT_PUBLIC_SITE_URL at runtime — set it in your environment, not here."
            value={seo.siteUrl}
            disabled
            onChange={() => undefined}
          />

          <ImageUploader
            label="Default social share image"
            description="Used whenever a page has no image of its own. 1200×630."
            folder={STORAGE_FOLDERS.company}
            aspect="wide"
            value={{ url: seo.defaultOgImage, path: null }}
            onChange={(image) => patch({ defaultOgImage: image.url })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="X (Twitter) handle"
              placeholder="@yourcompany"
              value={seo.twitterHandle ?? ""}
              onChange={(event) => patch({ twitterHandle: event.target.value || null })}
            />
            <Input
              label="Google site verification"
              description="The content value from the verification meta tag."
              value={seo.googleSiteVerification ?? ""}
              onChange={(event) => patch({ googleSiteVerification: event.target.value || null })}
            />
          </div>

          <ImageUploader
            label="Organisation logo for structured data"
            description="Used in the Organization JSON-LD block. Square works best."
            folder={STORAGE_FOLDERS.company}
            aspect="square"
            value={{ url: seo.organizationLogo ?? "", path: null }}
            onChange={(image) => patch({ organizationLogo: image.url || null })}
          />
        </FieldGroup>

        <FieldGroup title="Page metadata">
          <div
            role="tablist"
            aria-label="Choose a page"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {PAGES.map((page) => (
              <button
                key={page.key}
                type="button"
                role="tab"
                aria-selected={activePage === page.key}
                onClick={() => setActivePage(page.key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                  activePage === page.key
                    ? "border-transparent bg-brand-600 text-white"
                    : "border-navy-200 text-navy-600 hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:text-navy-300",
                )}
              >
                {page.label}
              </button>
            ))}
          </div>

          {/* SERP preview */}
          <div className="rounded-xl border border-navy-200 bg-navy-50/60 p-4 dark:border-navy-700 dark:bg-navy-950/50">
            <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
              Search result preview
            </p>
            <p className="truncate text-[13px] text-emerald-700 dark:text-emerald-400">
              {seo.siteUrl.replace(/\/$/, "")}
              {currentPage.path === "/" ? "" : currentPage.path}
            </p>
            <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
              {current.metaTitle || `${currentPage.label} | ${seo.siteName}`}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-navy-600 dark:text-navy-400">
              {current.metaDescription || "No description set — search engines will pick their own."}
            </p>
          </div>

          <div>
            <Input
              label="Meta title"
              value={current.metaTitle ?? ""}
              onChange={(event) => patchPage(activePage, { metaTitle: event.target.value })}
            />
            <p
              className={cn(
                "mt-1 text-right text-[11px] tabular-nums",
                titleLength > 60 ? "text-amber-600 dark:text-amber-400" : "text-navy-400",
              )}
            >
              {titleLength} / 60 characters
            </p>
          </div>

          <div>
            <Textarea
              label="Meta description"
              rows={3}
              value={current.metaDescription ?? ""}
              onChange={(event) => patchPage(activePage, { metaDescription: event.target.value })}
            />
            <p
              className={cn(
                "mt-1 text-right text-[11px] tabular-nums",
                descriptionLength > 160 ? "text-amber-600 dark:text-amber-400" : "text-navy-400",
              )}
            >
              {descriptionLength} / 160 characters
            </p>
          </div>

          <TagInput
            label="Keywords"
            values={current.keywords ?? []}
            onChange={(keywords) => patchPage(activePage, { keywords })}
          />

          <ImageUploader
            label="Page share image"
            description="Overrides the default social image for this page only."
            folder={STORAGE_FOLDERS.company}
            aspect="wide"
            value={{ url: current.ogImage ?? "", path: null }}
            onChange={(image) => patchPage(activePage, { ogImage: image.url || null })}
          />

          <Switch
            label="Hide this page from search engines"
            description="Adds noindex, nofollow and drops it from the sitemap."
            checked={current.noIndex ?? false}
            onChange={(noIndex) => patchPage(activePage, { noIndex })}
          />
        </FieldGroup>

        <Panel className="bg-navy-50/60 dark:bg-navy-900/40">
          <h3 className="text-sm font-semibold text-navy-950 dark:text-white">
            Generated automatically
          </h3>
          <ul className="mt-2.5 space-y-1.5 text-[13px] text-navy-600 dark:text-navy-300">
            <li>
              •{" "}
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-400"
              >
                sitemap.xml
                <ExternalLink aria-hidden className="size-3" />
              </a>{" "}
              — every page, service and project, refreshed hourly.
            </li>
            <li>
              •{" "}
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-600 hover:underline dark:text-brand-400"
              >
                robots.txt
                <ExternalLink aria-hidden className="size-3" />
              </a>{" "}
              — blocks /admin and /api; blocks everything on non-production origins.
            </li>
            <li>• Open Graph, Twitter Card, canonical URLs and JSON-LD on every page.</li>
          </ul>
        </Panel>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  );
}
