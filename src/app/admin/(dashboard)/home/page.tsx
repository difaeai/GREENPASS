"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { RepeatableList } from "@/components/admin/repeatable";
import {
  AdminLoading,
  AdminPageHeader,
  IconPicker,
  Panel,
  SaveBar,
  TagInput,
} from "@/components/admin/ui";
import { FieldGroup, Input, Textarea } from "@/components/ui/form";
import { COLLECTIONS, DOC_IDS, STORAGE_FOLDERS } from "@/lib/constants";
import { DEFAULT_HOME_CONTENT } from "@/lib/defaults";
import { getSingleton, saveSingleton } from "@/lib/firebase/repository";
import { withDefaults } from "@/lib/firebase/serialize";
import { nanoId } from "@/lib/utils";
import type { HomeContent, HomeSectionHeading } from "@/types";

/** Eyebrow + heading + description trio, reused by five sections. */
function HeadingFields({
  value,
  onChange,
}: {
  value: HomeSectionHeading;
  onChange: (value: HomeSectionHeading) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        label="Eyebrow"
        placeholder="Why choose us"
        value={value.eyebrow}
        onChange={(event) => onChange({ ...value, eyebrow: event.target.value })}
      />
      <Input
        label="Heading"
        placeholder="A partner that behaves like part of your team"
        value={value.heading}
        onChange={(event) => onChange({ ...value, heading: event.target.value })}
      />
      <Textarea
        label="Description"
        rows={2}
        value={value.description}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
      />
    </div>
  );
}

export default function HomeContentPage() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSingleton<HomeContent>(COLLECTIONS.home, DOC_IDS.homeContent)
      .then((stored) => {
        if (cancelled) return;
        // Merge over the defaults so a partially-filled document still yields
        // a complete form rather than blank inputs.
        setContent(withDefaults(DEFAULT_HOME_CONTENT, stored));
      })
      .catch((error) => {
        console.error("[home] Failed to load content:", error);
        toast.error("Could not load the homepage content.");
        if (!cancelled) setContent(DEFAULT_HOME_CONTENT);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(partial: Partial<HomeContent>) {
    setContent((state) => (state ? { ...state, ...partial } : state));
    setDirty(true);
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);

    try {
      await saveSingleton(COLLECTIONS.home, DOC_IDS.homeContent, content);
      setDirty(false);
      toast.success("Homepage content saved.");
    } catch (error) {
      console.error("[home] Save failed:", error);
      toast.error("Could not save the homepage content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !content) return <AdminLoading label="Loading homepage content…" />;

  const introImage: ImageValue = {
    url: content.intro.image,
    path: content.intro.imagePath ?? null,
  };

  return (
    <div>
      <AdminPageHeader
        title="Homepage content"
        description="Every section of the homepage except the hero slides, which have their own screen."
      />

      <div className="space-y-5">
        {/* Introduction */}
        <FieldGroup
          title="Company introduction"
          description="The image-and-text block directly beneath the hero."
        >
          <ImageUploader
            label="Section image"
            folder={STORAGE_FOLDERS.company}
            value={introImage}
            onChange={(image) =>
              patch({ intro: { ...content.intro, image: image.url, imagePath: image.path } })
            }
          />

          <Input
            label="Eyebrow"
            value={content.intro.eyebrow}
            onChange={(event) =>
              patch({ intro: { ...content.intro, eyebrow: event.target.value } })
            }
          />
          <Input
            label="Heading"
            value={content.intro.heading}
            onChange={(event) =>
              patch({ intro: { ...content.intro, heading: event.target.value } })
            }
          />
          <Textarea
            label="Body copy"
            rows={6}
            description="Leave a blank line between paragraphs."
            value={content.intro.body}
            onChange={(event) => patch({ intro: { ...content.intro, body: event.target.value } })}
          />

          <TagInput
            label="Highlights"
            description="Short checklist points shown beside the body copy."
            values={content.intro.highlights}
            onChange={(highlights) => patch({ intro: { ...content.intro, highlights } })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Button label"
              placeholder="More about us"
              value={content.intro.buttonLabel ?? ""}
              onChange={(event) =>
                patch({ intro: { ...content.intro, buttonLabel: event.target.value || null } })
              }
            />
            <Input
              label="Button link"
              placeholder="/about"
              value={content.intro.buttonLink ?? ""}
              onChange={(event) =>
                patch({ intro: { ...content.intro, buttonLink: event.target.value || null } })
              }
            />
          </div>
        </FieldGroup>

        {/* Why choose us */}
        <FieldGroup title="Why choose us" description="Icon cards. Add as many as you need.">
          <HeadingFields
            value={content.whyChooseUs.heading}
            onChange={(heading) =>
              patch({ whyChooseUs: { ...content.whyChooseUs, heading } })
            }
          />

          <RepeatableList
            items={content.whyChooseUs.items}
            onChange={(items) => patch({ whyChooseUs: { ...content.whyChooseUs, items } })}
            createItem={() => ({
              id: nanoId(),
              icon: "Sparkles",
              title: "",
              description: "",
              order: content.whyChooseUs.items.length + 1,
            })}
            itemLabel="Card"
            addLabel="Add card"
            summary={(item) => item.title}
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon} onChange={(icon) => update({ icon })} />
                <Input
                  label="Title"
                  value={item.title}
                  onChange={(event) => update({ title: event.target.value })}
                />
                <Textarea
                  label="Description"
                  rows={3}
                  value={item.description}
                  onChange={(event) => update({ description: event.target.value })}
                />
              </>
            )}
          />
        </FieldGroup>

        {/* Statistics */}
        <FieldGroup
          title="Statistics"
          description="Animated counters. Enter the number alone and use the suffix for symbols."
        >
          <HeadingFields
            value={content.stats.heading}
            onChange={(heading) => patch({ stats: { ...content.stats, heading } })}
          />

          <RepeatableList
            items={content.stats.items}
            onChange={(items) => patch({ stats: { ...content.stats, items } })}
            createItem={() => ({
              id: nanoId(),
              label: "",
              value: 0,
              suffix: "+",
              prefix: "",
              icon: "CheckCircle2",
              order: content.stats.items.length + 1,
            })}
            itemLabel="Statistic"
            addLabel="Add statistic"
            summary={(item) =>
              item.label ? `${item.prefix ?? ""}${item.value}${item.suffix ?? ""} — ${item.label}` : ""
            }
            renderItem={(item, update) => (
              <>
                <IconPicker value={item.icon ?? "CheckCircle2"} onChange={(icon) => update({ icon })} />
                <Input
                  label="Label"
                  placeholder="Projects Completed"
                  value={item.label}
                  onChange={(event) => update({ label: event.target.value })}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Prefix"
                    placeholder="$"
                    value={item.prefix ?? ""}
                    onChange={(event) => update({ prefix: event.target.value })}
                  />
                  <Input
                    label="Value"
                    type="number"
                    min={0}
                    value={item.value}
                    onChange={(event) => update({ value: Number(event.target.value) || 0 })}
                  />
                  <Input
                    label="Suffix"
                    placeholder="+"
                    value={item.suffix ?? ""}
                    onChange={(event) => update({ suffix: event.target.value })}
                  />
                </div>
              </>
            )}
          />
        </FieldGroup>

        {/* Section headings */}
        <FieldGroup
          title="Featured services heading"
          description="The services section pulls in whichever services are marked as featured."
        >
          <HeadingFields
            value={content.featuredServices}
            onChange={(featuredServices) => patch({ featuredServices })}
          />
        </FieldGroup>

        <FieldGroup
          title="Featured portfolio heading"
          description="The portfolio section pulls in whichever projects are marked as featured."
        >
          <HeadingFields
            value={content.featuredPortfolio}
            onChange={(featuredPortfolio) => patch({ featuredPortfolio })}
          />
        </FieldGroup>

        <FieldGroup title="Testimonials heading">
          <HeadingFields
            value={content.testimonials}
            onChange={(testimonials) => patch({ testimonials })}
          />
        </FieldGroup>

        {/* CTA */}
        <FieldGroup title="Call to action" description="The closing band at the bottom of the homepage.">
          <ImageUploader
            label="Background image"
            description="Optional. Sits behind a dark gradient."
            folder={STORAGE_FOLDERS.company}
            aspect="wide"
            value={{ url: content.cta.backgroundImage ?? "", path: null }}
            onChange={(image) =>
              patch({ cta: { ...content.cta, backgroundImage: image.url || null } })
            }
          />
          <Input
            label="Eyebrow"
            value={content.cta.eyebrow}
            onChange={(event) => patch({ cta: { ...content.cta, eyebrow: event.target.value } })}
          />
          <Input
            label="Heading"
            value={content.cta.heading}
            onChange={(event) => patch({ cta: { ...content.cta, heading: event.target.value } })}
          />
          <Textarea
            label="Description"
            rows={3}
            value={content.cta.description}
            onChange={(event) =>
              patch({ cta: { ...content.cta, description: event.target.value } })
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Button label"
              value={content.cta.buttonLabel}
              onChange={(event) =>
                patch({ cta: { ...content.cta, buttonLabel: event.target.value } })
              }
            />
            <Input
              label="Button link"
              value={content.cta.buttonLink}
              onChange={(event) =>
                patch({ cta: { ...content.cta, buttonLink: event.target.value } })
              }
            />
          </div>
        </FieldGroup>

        <Panel className="bg-navy-50/60 dark:bg-navy-900/40">
          <p className="text-[13px] leading-relaxed text-navy-600 dark:text-navy-300">
            The public homepage revalidates every 5 minutes, so saved changes appear shortly after
            you save rather than instantly.
          </p>
        </Panel>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  );
}
