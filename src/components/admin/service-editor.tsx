"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { EMPTY_SEO, SeoFieldsEditor } from "@/components/admin/seo-fields";
import {
  AdminLoading,
  AdminPageHeader,
  ConfirmDialog,
  IconPicker,
  SaveBar,
  TagInput,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Switch, Textarea } from "@/components/ui/form";
import { COLLECTIONS, STORAGE_FOLDERS } from "@/lib/constants";
import {
  createDoc,
  deleteDocById,
  getById,
  listOrdered,
  nextOrder,
  updateDocById,
} from "@/lib/firebase/repository";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { slugify } from "@/lib/utils";
import type { SeoFields, Service } from "@/types";

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  image: ImageValue;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  seo: SeoFields;
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  icon: "Sparkles",
  image: { url: "", path: null },
  features: [],
  isFeatured: false,
  isActive: true,
  seo: EMPTY_SEO,
};

export function ServiceEditor({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const isNew = !serviceId;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [original, setOriginal] = useState<Service | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Auto-fill the slug from the title only until the admin edits it. */
  const [slugLocked, setSlugLocked] = useState(!isNew);

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    getById<Service>(COLLECTIONS.services, serviceId)
      .then((service) => {
        if (cancelled) return;

        if (!service) {
          toast.error("That service no longer exists.");
          router.replace("/admin/services");
          return;
        }

        setOriginal(service);
        setForm({
          title: service.title,
          slug: service.slug,
          shortDescription: service.shortDescription,
          fullDescription: service.fullDescription,
          icon: service.icon || "Sparkles",
          image: { url: service.image ?? "", path: service.imagePath ?? null },
          features: service.features ?? [],
          isFeatured: service.isFeatured,
          isActive: service.isActive,
          seo: { ...EMPTY_SEO, ...(service.seo ?? {}) },
        });
      })
      .catch((error) => {
        console.error("[services] Failed to load:", error);
        toast.error("Could not load this service.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, router]);

  function patch(partial: Partial<FormState>) {
    setForm((state) => ({ ...state, ...partial }));
    setDirty(true);
  }

  function onTitleChange(title: string) {
    patch(slugLocked ? { title } : { title, slug: slugify(title) });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2) next.title = "A title is required.";
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      next.slug = "Use lowercase letters, numbers and hyphens only.";
    }
    if (form.shortDescription.trim().length < 10) {
      next.shortDescription = "Add a short description of at least 10 characters.";
    }
    if (form.fullDescription.trim().length < 20) {
      next.fullDescription = "Add the full description.";
    }
    setErrors(next);

    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    try {
      // Slugs are the public URL — they must stay unique.
      const existing = await listOrdered<Service>(COLLECTIONS.services);
      const clash = existing.find(
        (service) => service.slug === form.slug && service.id !== serviceId,
      );
      if (clash) {
        setErrors({ slug: `"${form.slug}" is already used by "${clash.title}".` });
        toast.error("That URL slug is already taken.");
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title.trim(),
        slug: form.slug,
        shortDescription: form.shortDescription.trim(),
        fullDescription: form.fullDescription.trim(),
        icon: form.icon,
        image: form.image.url,
        imagePath: form.image.path,
        features: form.features,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        seo: form.seo,
      };

      if (isNew) {
        const id = await createDoc(COLLECTIONS.services, {
          ...payload,
          order: nextOrder(existing),
        });
        toast.success("Service created.");
        setDirty(false);
        router.replace(`/admin/services/${id}`);
      } else {
        if (original?.imagePath && original.imagePath !== form.image.path) {
          await deleteStorageObject(original.imagePath);
        }
        await updateDocById(COLLECTIONS.services, serviceId, payload);
        setOriginal((current) => (current ? { ...current, ...payload } : current));
        setDirty(false);
        toast.success("Service saved.");
      }
    } catch (error) {
      console.error("[services] Save failed:", error);
      toast.error("Could not save this service.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!serviceId) return;
    setSaving(true);

    try {
      await deleteStorageObject(original?.imagePath);
      await deleteDocById(COLLECTIONS.services, serviceId);
      toast.success("Service deleted.");
      router.replace("/admin/services");
    } catch (error) {
      console.error("[services] Delete failed:", error);
      toast.error("Could not delete this service.");
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading service…" />;

  return (
    <div>
      <AdminPageHeader
        title={isNew ? "New service" : form.title || "Edit service"}
        description={
          isNew
            ? "Services appear on the Services page and can be featured on the homepage."
            : `Public URL: /services/${form.slug}`
        }
        backHref="/admin/services"
        actions={
          <>
            {!isNew && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/services/${form.slug}`, "_blank")}
                >
                  <ExternalLink aria-hidden className="size-4" />
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 aria-hidden className="size-4" />
                  Delete
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <FieldGroup title="Service details">
            <Input
              label="Title"
              required
              placeholder="Web Development"
              value={form.title}
              error={errors.title}
              onChange={(event) => onTitleChange(event.target.value)}
            />

            <Input
              label="URL slug"
              required
              description={`The page will live at /services/${form.slug || "your-slug"}`}
              placeholder="web-development"
              value={form.slug}
              error={errors.slug}
              onChange={(event) => {
                setSlugLocked(true);
                patch({ slug: slugify(event.target.value) });
              }}
            />

            <Textarea
              label="Short description"
              required
              rows={3}
              description="Shown on service cards and in search results."
              value={form.shortDescription}
              error={errors.shortDescription}
              onChange={(event) => patch({ shortDescription: event.target.value })}
            />

            <Textarea
              label="Full description"
              required
              rows={10}
              description="Shown on the service detail page. Leave a blank line between paragraphs."
              value={form.fullDescription}
              error={errors.fullDescription}
              onChange={(event) => patch({ fullDescription: event.target.value })}
            />

            <TagInput
              label="What's included"
              description="One feature per entry. These render as a checklist on the detail page."
              placeholder="Add a feature and press Enter"
              values={form.features}
              onChange={(features) => patch({ features })}
            />
          </FieldGroup>

          <SeoFieldsEditor
            value={form.seo}
            onChange={(seo) => patch({ seo })}
            folder={STORAGE_FOLDERS.services}
            previewPath={`/services/${form.slug || "your-slug"}`}
            fallbackTitle={form.title || "Service title"}
            fallbackDescription={form.shortDescription || "Short description of the service."}
          />
        </div>

        <div className="space-y-5">
          <FieldGroup title="Presentation">
            <ImageUploader
              label="Service image"
              description="Used on the card and as the detail page header."
              folder={STORAGE_FOLDERS.services}
              value={form.image}
              onChange={(image) => patch({ image })}
            />

            <IconPicker value={form.icon} onChange={(icon) => patch({ icon })} />
          </FieldGroup>

          <FieldGroup title="Visibility">
            <Switch
              label="Published"
              description="Unpublished services are hidden from the site entirely."
              checked={form.isActive}
              onChange={(isActive) => patch({ isActive })}
            />
            <Switch
              label="Feature on the homepage"
              description="Featured services appear in the homepage services section."
              checked={form.isFeatured}
              onChange={(isFeatured) => patch({ isFeatured })}
            />
          </FieldGroup>
        </div>
      </div>

      <SaveBar dirty={dirty || isNew} saving={saving} onSave={handleSave} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this service?"
        message={`"${form.title}" and its uploaded image will be permanently removed, and /services/${form.slug} will start returning a 404.`}
        busy={saving}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
