"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/admin/image-uploader";
import { RepeatableList } from "@/components/admin/repeatable";
import {
  AdminLoading,
  AdminPageHeader,
  IconPicker,
  SaveBar,
} from "@/components/admin/ui";
import { FieldGroup, Input, Textarea } from "@/components/ui/form";
import { COLLECTIONS, DOC_IDS, STORAGE_FOLDERS } from "@/lib/constants";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/defaults";
import { getSingleton, saveSingleton } from "@/lib/firebase/repository";
import { withDefaults } from "@/lib/firebase/serialize";
import { nanoId } from "@/lib/utils";
import type { AboutContent, HomeSectionHeading } from "@/types";

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
        value={value.eyebrow}
        onChange={(event) => onChange({ ...value, eyebrow: event.target.value })}
      />
      <Input
        label="Heading"
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

export default function AboutContentPage() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getSingleton<AboutContent>(COLLECTIONS.about, DOC_IDS.aboutContent)
      .then((stored) => {
        if (!cancelled) setContent(withDefaults(DEFAULT_ABOUT_CONTENT, stored));
      })
      .catch((error) => {
        console.error("[about] Failed to load content:", error);
        toast.error("Could not load the About page content.");
        if (!cancelled) setContent(DEFAULT_ABOUT_CONTENT);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function patch(partial: Partial<AboutContent>) {
    setContent((state) => (state ? { ...state, ...partial } : state));
    setDirty(true);
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);

    try {
      await saveSingleton(COLLECTIONS.about, DOC_IDS.aboutContent, content);
      setDirty(false);
      toast.success("About page saved.");
    } catch (error) {
      console.error("[about] Save failed:", error);
      toast.error("Could not save the About page.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !content) return <AdminLoading label="Loading About page content…" />;

  return (
    <div>
      <AdminPageHeader
        title="About page"
        description="Company story, vision, mission, values, history and the CEO message. Team members are managed separately."
      />

      <div className="space-y-5">
        {/* Intro */}
        <FieldGroup title="Introduction">
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader
              label="Main image"
              folder={STORAGE_FOLDERS.company}
              aspect="portrait"
              value={{ url: content.intro.image, path: content.intro.imagePath ?? null }}
              onChange={(image) =>
                patch({ intro: { ...content.intro, image: image.url, imagePath: image.path } })
              }
            />
            <ImageUploader
              label="Secondary image"
              description="Optional. Overlaps the main image on larger screens."
              folder={STORAGE_FOLDERS.company}
              value={{
                url: content.intro.secondaryImage ?? "",
                path: content.intro.secondaryImagePath ?? null,
              }}
              onChange={(image) =>
                patch({
                  intro: {
                    ...content.intro,
                    secondaryImage: image.url || null,
                    secondaryImagePath: image.path,
                  },
                })
              }
            />
          </div>

          <Input
            label="Eyebrow"
            value={content.intro.eyebrow}
            onChange={(event) =>
              patch({ intro: { ...content.intro, eyebrow: event.target.value } })
            }
          />
          <Input
            label="Heading"
            description="Also used as the page title in the masthead."
            value={content.intro.heading}
            onChange={(event) =>
              patch({ intro: { ...content.intro, heading: event.target.value } })
            }
          />
          <Textarea
            label="Company story"
            rows={8}
            description="Leave a blank line between paragraphs."
            value={content.intro.body}
            onChange={(event) => patch({ intro: { ...content.intro, body: event.target.value } })}
          />
        </FieldGroup>

        {/* Vision & mission */}
        <div className="grid gap-5 lg:grid-cols-2">
          <FieldGroup title="Vision">
            <IconPicker
              value={content.vision.icon}
              onChange={(icon) => patch({ vision: { ...content.vision, icon } })}
            />
            <Input
              label="Heading"
              value={content.vision.heading}
              onChange={(event) =>
                patch({ vision: { ...content.vision, heading: event.target.value } })
              }
            />
            <Textarea
              label="Body"
              rows={5}
              value={content.vision.body}
              onChange={(event) =>
                patch({ vision: { ...content.vision, body: event.target.value } })
              }
            />
          </FieldGroup>

          <FieldGroup title="Mission">
            <IconPicker
              value={content.mission.icon}
              onChange={(icon) => patch({ mission: { ...content.mission, icon } })}
            />
            <Input
              label="Heading"
              value={content.mission.heading}
              onChange={(event) =>
                patch({ mission: { ...content.mission, heading: event.target.value } })
              }
            />
            <Textarea
              label="Body"
              rows={5}
              value={content.mission.body}
              onChange={(event) =>
                patch({ mission: { ...content.mission, body: event.target.value } })
              }
            />
          </FieldGroup>
        </div>

        {/* Core values */}
        <FieldGroup title="Core values">
          <HeadingFields
            value={content.coreValues.heading}
            onChange={(heading) => patch({ coreValues: { ...content.coreValues, heading } })}
          />

          <RepeatableList
            items={content.coreValues.items}
            onChange={(items) => patch({ coreValues: { ...content.coreValues, items } })}
            createItem={() => ({
              id: nanoId(),
              icon: "Gem",
              title: "",
              description: "",
              order: content.coreValues.items.length + 1,
            })}
            itemLabel="Value"
            addLabel="Add value"
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

        {/* CEO message */}
        <FieldGroup
          title="CEO message"
          description="A personal note from leadership, shown as a full-width panel."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader
              label="CEO photo"
              folder={STORAGE_FOLDERS.company}
              aspect="portrait"
              value={{ url: content.ceo.photo, path: content.ceo.photoPath ?? null }}
              onChange={(image) =>
                patch({ ceo: { ...content.ceo, photo: image.url, photoPath: image.path } })
              }
            />
            <ImageUploader
              label="Signature image"
              description="Optional. A transparent PNG works best — it is rendered in white."
              folder={STORAGE_FOLDERS.company}
              value={{
                url: content.ceo.signatureImage ?? "",
                path: content.ceo.signatureImagePath ?? null,
              }}
              onChange={(image) =>
                patch({
                  ceo: {
                    ...content.ceo,
                    signatureImage: image.url || null,
                    signatureImagePath: image.path,
                  },
                })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={content.ceo.name}
              onChange={(event) => patch({ ceo: { ...content.ceo, name: event.target.value } })}
            />
            <Input
              label="Designation"
              value={content.ceo.designation}
              onChange={(event) =>
                patch({ ceo: { ...content.ceo, designation: event.target.value } })
              }
            />
          </div>

          <Textarea
            label="Message"
            rows={8}
            description="Leave a blank line between paragraphs."
            value={content.ceo.message}
            onChange={(event) => patch({ ceo: { ...content.ceo, message: event.target.value } })}
          />
        </FieldGroup>

        {/* History */}
        <FieldGroup title="Company history" description="Rendered as a vertical timeline.">
          <HeadingFields
            value={content.history.heading}
            onChange={(heading) => patch({ history: { ...content.history, heading } })}
          />

          <RepeatableList
            items={content.history.milestones}
            onChange={(milestones) => patch({ history: { ...content.history, milestones } })}
            createItem={() => ({
              id: nanoId(),
              year: String(new Date().getFullYear()),
              title: "",
              description: "",
              order: content.history.milestones.length + 1,
            })}
            itemLabel="Milestone"
            addLabel="Add milestone"
            summary={(item) => (item.year ? `${item.year} — ${item.title}` : item.title)}
            renderItem={(item, update) => (
              <>
                <Input
                  label="Year"
                  placeholder="2019"
                  value={item.year}
                  onChange={(event) => update({ year: event.target.value })}
                />
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

        <FieldGroup
          title="Team section heading"
          description="Team members themselves are managed on the Team screen."
        >
          <HeadingFields value={content.team} onChange={(team) => patch({ team })} />
        </FieldGroup>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  );
}
