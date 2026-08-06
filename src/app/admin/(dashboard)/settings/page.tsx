"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/admin/image-uploader";
import { RepeatableList } from "@/components/admin/repeatable";
import { AdminLoading, AdminPageHeader, Panel, SaveBar } from "@/components/admin/ui";
import { FieldGroup, Input, Textarea } from "@/components/ui/form";
import { COLLECTIONS, DOC_IDS, STORAGE_FOLDERS } from "@/lib/constants";
import { DEFAULT_WEBSITE_SETTINGS } from "@/lib/defaults";
import { getSingleton, saveSingleton } from "@/lib/firebase/repository";
import { withDefaults } from "@/lib/firebase/serialize";
import { nanoId, toMapEmbedUrl } from "@/lib/utils";
import type { WebsiteSettings } from "@/types";

const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/…" },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/…" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@…" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/…" },
] as const;

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSingleton<WebsiteSettings>(COLLECTIONS.websiteSettings, DOC_IDS.websiteSettings)
      .then((stored) => {
        if (!cancelled) setSettings(withDefaults(DEFAULT_WEBSITE_SETTINGS, stored));
      })
      .catch((error) => {
        console.error("[settings] Failed to load:", error);
        toast.error("Could not load the website settings.");
        if (!cancelled) setSettings(DEFAULT_WEBSITE_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(partial: Partial<WebsiteSettings>) {
    setSettings((state) => (state ? { ...state, ...partial } : state));
    setDirty(true);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);

    try {
      await saveSingleton(COLLECTIONS.websiteSettings, DOC_IDS.websiteSettings, settings);
      setDirty(false);
      toast.success("Website settings saved.");
    } catch (error) {
      console.error("[settings] Save failed:", error);
      toast.error("Could not save the settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) return <AdminLoading label="Loading settings…" />;

  const mapPreview = toMapEmbedUrl(settings.googleMapsEmbedUrl);

  return (
    <div>
      <AdminPageHeader
        title="Website settings"
        description="Branding, contact details, social links and footer copy. These appear across every page."
      />

      <div className="space-y-5">
        <FieldGroup title="Brand" description="Leave the logos empty to use the typographic wordmark.">
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader
              label="Logo — light backgrounds"
              description="Shown in the navbar in light mode. SVG or transparent PNG."
              folder={STORAGE_FOLDERS.company}
              aspect="wide"
              value={{ url: settings.logoLight, path: null }}
              onChange={(image) => patch({ logoLight: image.url })}
            />
            <ImageUploader
              label="Logo — dark backgrounds"
              description="Shown in dark mode and in the footer."
              folder={STORAGE_FOLDERS.company}
              aspect="wide"
              value={{ url: settings.logoDark, path: null }}
              onChange={(image) => patch({ logoDark: image.url })}
            />
          </div>

          <ImageUploader
            label="Favicon"
            description="A square PNG or ICO, at least 64×64."
            folder={STORAGE_FOLDERS.company}
            aspect="square"
            value={{ url: settings.favicon, path: null }}
            onChange={(image) => patch({ favicon: image.url })}
          />

          <Input
            label="Company name"
            required
            value={settings.companyName}
            onChange={(event) => patch({ companyName: event.target.value })}
          />
          <Input
            label="Tagline"
            description="Shown in the top utility bar and under the footer logo."
            value={settings.tagline}
            onChange={(event) => patch({ tagline: event.target.value })}
          />
        </FieldGroup>

        <FieldGroup title="Contact details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Primary email"
              type="email"
              required
              value={settings.email}
              onChange={(event) => patch({ email: event.target.value })}
            />
            <Input
              label="Secondary email"
              type="email"
              value={settings.secondaryEmail ?? ""}
              onChange={(event) => patch({ secondaryEmail: event.target.value || null })}
            />
            <Input
              label="Primary phone"
              type="tel"
              required
              value={settings.phone}
              onChange={(event) => patch({ phone: event.target.value })}
            />
            <Input
              label="Secondary phone"
              type="tel"
              value={settings.secondaryPhone ?? ""}
              onChange={(event) => patch({ secondaryPhone: event.target.value || null })}
            />
          </div>

          <Input
            label="WhatsApp number"
            description="Digits and country code only, e.g. 14155550142. Powers the floating chat button."
            value={settings.whatsapp}
            onChange={(event) => patch({ whatsapp: event.target.value })}
          />

          <Textarea
            label="Address"
            rows={3}
            description="One line per row. Rendered as-is in the footer and contact page."
            value={settings.address}
            onChange={(event) => patch({ address: event.target.value })}
          />
        </FieldGroup>

        <FieldGroup title="Google Maps">
          <Input
            label="Map embed URL"
            description="In Google Maps choose Share → Embed a map, then paste the src from the iframe."
            value={settings.googleMapsEmbedUrl}
            onChange={(event) => patch({ googleMapsEmbedUrl: event.target.value })}
          />
          <Input
            label="Map link"
            description="Where the 'Visit us' card links to. Optional."
            value={settings.googleMapsLink ?? ""}
            onChange={(event) => patch({ googleMapsLink: event.target.value || null })}
          />

          {mapPreview && (
            <div className="overflow-hidden rounded-xl border border-navy-200 dark:border-navy-700">
              <iframe
                src={mapPreview}
                title="Map preview"
                width="100%"
                height="220"
                loading="lazy"
                className="border-0"
              />
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="Business hours" description="Shown on the Contact page.">
          <RepeatableList
            items={settings.businessHours}
            onChange={(businessHours) => patch({ businessHours })}
            createItem={() => ({
              id: nanoId(),
              day: "",
              hours: "",
              order: settings.businessHours.length + 1,
            })}
            itemLabel="Row"
            addLabel="Add row"
            summary={(item) => (item.day ? `${item.day} — ${item.hours}` : "")}
            renderItem={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Day or range"
                  placeholder="Monday – Friday"
                  value={item.day}
                  onChange={(event) => update({ day: event.target.value })}
                />
                <Input
                  label="Hours"
                  placeholder="9:00 AM – 6:00 PM"
                  value={item.hours}
                  onChange={(event) => update({ hours: event.target.value })}
                />
              </div>
            )}
          />
        </FieldGroup>

        <FieldGroup
          title="Social profiles"
          description="Leave a field blank to hide that icon everywhere."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                type="url"
                placeholder={field.placeholder}
                value={settings.social?.[field.key] ?? ""}
                onChange={(event) =>
                  patch({
                    social: { ...settings.social, [field.key]: event.target.value || null },
                  })
                }
              />
            ))}
          </div>
        </FieldGroup>

        <FieldGroup title="Contact page copy">
          <Input
            label="Contact page heading"
            value={settings.contactHeading ?? ""}
            onChange={(event) => patch({ contactHeading: event.target.value })}
          />
          <Textarea
            label="Contact page subheading"
            rows={2}
            value={settings.contactSubheading ?? ""}
            onChange={(event) => patch({ contactSubheading: event.target.value })}
          />
        </FieldGroup>

        <FieldGroup title="Footer">
          <Textarea
            label="Footer description"
            rows={3}
            description="The paragraph under the footer logo."
            value={settings.footerText}
            onChange={(event) => patch({ footerText: event.target.value })}
          />
          <Input
            label="Copyright text"
            description="The current year is added automatically in front of this."
            value={settings.copyrightText}
            onChange={(event) => patch({ copyrightText: event.target.value })}
          />
        </FieldGroup>

        <Panel className="bg-navy-50/60 dark:bg-navy-900/40">
          <p className="text-[13px] leading-relaxed text-navy-600 dark:text-navy-300">
            These settings are read by every page. Saving refreshes the whole public site straight
            away.
          </p>
        </Panel>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  );
}
