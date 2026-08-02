"use client";

import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { TagInput } from "@/components/admin/ui";
import { FieldGroup, Input, Switch, Textarea } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { MediaFolder, SeoFields as SeoFieldsType } from "@/types";

/**
 * Per-document SEO block, shared by the service and project editors.
 *
 * The character counters matter: Google truncates titles around 60 characters
 * and descriptions around 160, so the limits are surfaced rather than enforced
 * silently.
 */
export function SeoFieldsEditor({
  value,
  onChange,
  folder,
  previewPath,
  fallbackTitle,
  fallbackDescription,
}: {
  value: SeoFieldsType;
  onChange: (value: SeoFieldsType) => void;
  folder: MediaFolder;
  previewPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
}) {
  const patch = (partial: Partial<SeoFieldsType>) => onChange({ ...value, ...partial });

  const title = value.metaTitle?.trim() || fallbackTitle;
  const description = value.metaDescription?.trim() || fallbackDescription;

  const titleLength = title.length;
  const descriptionLength = description.length;

  const ogImage: ImageValue = { url: value.ogImage ?? "", path: null };

  return (
    <FieldGroup
      title="Search engine optimisation"
      description="Leave a field blank to fall back to the page content above."
    >
      {/* SERP preview */}
      <div className="rounded-xl border border-navy-200 bg-navy-50/60 p-4 dark:border-navy-700 dark:bg-navy-950/50">
        <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
          Search result preview
        </p>
        <p className="truncate text-[13px] text-emerald-700 dark:text-emerald-400">
          {previewPath}
        </p>
        <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-navy-600 dark:text-navy-400">
          {description}
        </p>
      </div>

      <div>
        <Input
          label="Meta title"
          placeholder={fallbackTitle}
          value={value.metaTitle ?? ""}
          onChange={(event) => patch({ metaTitle: event.target.value })}
        />
        <p
          className={cn(
            "mt-1 text-right text-[11px] tabular-nums",
            titleLength > 60 ? "text-amber-600 dark:text-amber-400" : "text-navy-400",
          )}
        >
          {titleLength} / 60 characters
          {titleLength > 60 && " — likely to be truncated"}
        </p>
      </div>

      <div>
        <Textarea
          label="Meta description"
          rows={3}
          placeholder={fallbackDescription}
          value={value.metaDescription ?? ""}
          onChange={(event) => patch({ metaDescription: event.target.value })}
        />
        <p
          className={cn(
            "mt-1 text-right text-[11px] tabular-nums",
            descriptionLength > 160 ? "text-amber-600 dark:text-amber-400" : "text-navy-400",
          )}
        >
          {descriptionLength} / 160 characters
          {descriptionLength > 160 && " — likely to be truncated"}
        </p>
      </div>

      <TagInput
        label="Keywords"
        description="Comma or Enter to add. Used for the keywords meta tag."
        values={value.keywords ?? []}
        onChange={(keywords) => patch({ keywords })}
      />

      <ImageUploader
        label="Social share image"
        description="Shown when the page is shared. 1200×630 is the safe size."
        folder={folder}
        aspect="wide"
        value={ogImage}
        onChange={(image) => patch({ ogImage: image.url || null })}
      />

      <Input
        label="Canonical URL"
        placeholder="Leave blank to use the page's own address"
        value={value.canonicalUrl ?? ""}
        onChange={(event) => patch({ canonicalUrl: event.target.value })}
      />

      <Switch
        label="Hide from search engines"
        description="Adds noindex, nofollow and drops the page from the sitemap."
        checked={value.noIndex ?? false}
        onChange={(noIndex) => patch({ noIndex })}
      />
    </FieldGroup>
  );
}

export const EMPTY_SEO: SeoFieldsType = {
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  ogImage: null,
  canonicalUrl: "",
  noIndex: false,
};
