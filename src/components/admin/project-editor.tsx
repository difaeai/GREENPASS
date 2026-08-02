"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { EMPTY_SEO, SeoFieldsEditor } from "@/components/admin/seo-fields";
import {
  AdminLoading,
  AdminPageHeader,
  ConfirmDialog,
  SaveBar,
  TagInput,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { FieldGroup, Input, Select, Switch, Textarea } from "@/components/ui/form";
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
import type { PortfolioCategory, PortfolioImage, PortfolioProject, SeoFields } from "@/types";

interface FormState {
  title: string;
  slug: string;
  clientName: string;
  completionDate: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  featuredImage: ImageValue;
  images: PortfolioImage[];
  technologies: string[];
  projectUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  seo: SeoFields;
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  clientName: "",
  completionDate: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  featuredImage: { url: "", path: null },
  images: [],
  technologies: [],
  projectUrl: "",
  isFeatured: false,
  isActive: true,
  seo: EMPTY_SEO,
};

export function ProjectEditor({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const isNew = !projectId;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [original, setOriginal] = useState<PortfolioProject | null>(null);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [slugLocked, setSlugLocked] = useState(!isNew);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [categoryList, project] = await Promise.all([
          listOrdered<PortfolioCategory>(COLLECTIONS.portfolioCategories),
          projectId ? getById<PortfolioProject>(COLLECTIONS.portfolio, projectId) : null,
        ]);

        if (cancelled) return;
        setCategories(categoryList);

        if (projectId) {
          if (!project) {
            toast.error("That project no longer exists.");
            router.replace("/admin/portfolio");
            return;
          }

          setOriginal(project);
          setForm({
            title: project.title,
            slug: project.slug,
            clientName: project.clientName,
            // `<input type="date">` needs a bare YYYY-MM-DD value.
            completionDate: project.completionDate ? project.completionDate.slice(0, 10) : "",
            categoryId: project.categoryId,
            shortDescription: project.shortDescription,
            description: project.description,
            featuredImage: {
              url: project.featuredImage ?? "",
              path: project.featuredImagePath ?? null,
            },
            images: project.images ?? [],
            technologies: project.technologies ?? [],
            projectUrl: project.projectUrl ?? "",
            isFeatured: project.isFeatured,
            isActive: project.isActive,
            seo: { ...EMPTY_SEO, ...(project.seo ?? {}) },
          });
        } else if (categoryList.length > 0) {
          setForm((state) => ({ ...state, categoryId: categoryList[0].id }));
        }
      } catch (error) {
        console.error("[portfolio] Failed to load:", error);
        toast.error("Could not load this project.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId, router]);

  function patch(partial: Partial<FormState>) {
    setForm((state) => ({ ...state, ...partial }));
    setDirty(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2) next.title = "A title is required.";
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      next.slug = "Use lowercase letters, numbers and hyphens only.";
    }
    if (!form.clientName.trim()) next.clientName = "A client name is required.";
    if (!form.categoryId) next.categoryId = "Choose a category.";
    if (!form.featuredImage.url) next.featuredImage = "A featured image is required.";
    if (form.shortDescription.trim().length < 10) {
      next.shortDescription = "Add a short description of at least 10 characters.";
    }
    if (form.description.trim().length < 20) next.description = "Add the full description.";

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
      const existing = await listOrdered<PortfolioProject>(COLLECTIONS.portfolio);
      const clash = existing.find(
        (project) => project.slug === form.slug && project.id !== projectId,
      );
      if (clash) {
        setErrors({ slug: `"${form.slug}" is already used by "${clash.title}".` });
        toast.error("That URL slug is already taken.");
        setSaving(false);
        return;
      }

      const category = categories.find((item) => item.id === form.categoryId);

      const payload = {
        title: form.title.trim(),
        slug: form.slug,
        clientName: form.clientName.trim(),
        // Store an ISO instant so the value round-trips through Firestore.
        completionDate: form.completionDate
          ? new Date(`${form.completionDate}T00:00:00.000Z`).toISOString()
          : null,
        categoryId: form.categoryId,
        // Denormalised so the public grid never needs a second read per card.
        categoryName: category?.name ?? "",
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        featuredImage: form.featuredImage.url,
        featuredImagePath: form.featuredImage.path,
        images: form.images,
        technologies: form.technologies,
        projectUrl: form.projectUrl.trim() || null,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        seo: form.seo,
      };

      if (isNew) {
        const id = await createDoc(COLLECTIONS.portfolio, {
          ...payload,
          order: nextOrder(existing),
        });
        toast.success("Project created.");
        setDirty(false);
        router.replace(`/admin/portfolio/${id}`);
      } else {
        if (
          original?.featuredImagePath &&
          original.featuredImagePath !== form.featuredImage.path
        ) {
          await deleteStorageObject(original.featuredImagePath);
        }
        await updateDocById(COLLECTIONS.portfolio, projectId, payload);
        setOriginal((current) => (current ? { ...current, ...payload } : current));
        setDirty(false);
        toast.success("Project saved.");
      }
    } catch (error) {
      console.error("[portfolio] Save failed:", error);
      toast.error("Could not save this project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!projectId) return;
    setSaving(true);

    try {
      // Only files this project uploaded carry a `path` — library picks don't.
      await Promise.all([
        deleteStorageObject(original?.featuredImagePath),
        ...(original?.images ?? []).map((image) => deleteStorageObject(image.path)),
      ]);
      await deleteDocById(COLLECTIONS.portfolio, projectId);
      toast.success("Project deleted.");
      router.replace("/admin/portfolio");
    } catch (error) {
      console.error("[portfolio] Delete failed:", error);
      toast.error("Could not delete this project.");
      setSaving(false);
    }
  }

  if (loading) return <AdminLoading label="Loading project…" />;

  return (
    <div>
      <AdminPageHeader
        title={isNew ? "New project" : form.title || "Edit project"}
        description={isNew ? "Case studies shown on the Portfolio page." : `Public URL: /portfolio/${form.slug}`}
        backHref="/admin/portfolio"
        actions={
          !isNew && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/portfolio/${form.slug}`, "_blank")}
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
          )
        }
      />

      {categories.length === 0 && (
        <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-[13.5px] text-amber-800 dark:text-amber-200">
            You need at least one portfolio category before a project can be saved.{" "}
            <a href="/admin/categories" className="font-semibold underline underline-offset-2">
              Create a category
            </a>
            .
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <FieldGroup title="Project details">
            <Input
              label="Project title"
              required
              placeholder="Atlas Logistics Platform"
              value={form.title}
              error={errors.title}
              onChange={(event) => {
                const title = event.target.value;
                patch(slugLocked ? { title } : { title, slug: slugify(title) });
              }}
            />

            <Input
              label="URL slug"
              required
              description={`The page will live at /portfolio/${form.slug || "your-slug"}`}
              value={form.slug}
              error={errors.slug}
              onChange={(event) => {
                setSlugLocked(true);
                patch({ slug: slugify(event.target.value) });
              }}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Client name"
                required
                placeholder="Atlas Freight Group"
                value={form.clientName}
                error={errors.clientName}
                onChange={(event) => patch({ clientName: event.target.value })}
              />
              <Input
                label="Completion date"
                type="date"
                value={form.completionDate}
                onChange={(event) => patch({ completionDate: event.target.value })}
              />
            </div>

            <Select
              label="Category"
              required
              value={form.categoryId}
              error={errors.categoryId}
              onChange={(event) => patch({ categoryId: event.target.value })}
            >
              <option value="">Choose a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Input
              label="Live project URL"
              type="url"
              placeholder="https://example.com"
              description="Optional. Adds a 'Visit the live site' button."
              value={form.projectUrl}
              onChange={(event) => patch({ projectUrl: event.target.value })}
            />

            <Textarea
              label="Short description"
              required
              rows={3}
              description="Shown on portfolio cards and in search results."
              value={form.shortDescription}
              error={errors.shortDescription}
              onChange={(event) => patch({ shortDescription: event.target.value })}
            />

            <Textarea
              label="Full case study"
              required
              rows={12}
              description="Leave a blank line between paragraphs. Problem, approach, outcome works well."
              value={form.description}
              error={errors.description}
              onChange={(event) => patch({ description: event.target.value })}
            />

            <TagInput
              label="Technologies used"
              description="Rendered as tags on the card and detail page."
              placeholder="Next.js, PostgreSQL, AWS…"
              values={form.technologies}
              onChange={(technologies) => patch({ technologies })}
            />
          </FieldGroup>

          <FieldGroup title="Gallery" description="Screenshots shown in the lightbox gallery.">
            <GalleryUploader
              images={form.images}
              onChange={(images) => patch({ images })}
              folder={STORAGE_FOLDERS.portfolio}
              label="Project screenshots"
              description="Add as many as you like. The first is shown first."
            />
          </FieldGroup>

          <SeoFieldsEditor
            value={form.seo}
            onChange={(seo) => patch({ seo })}
            folder={STORAGE_FOLDERS.portfolio}
            previewPath={`/portfolio/${form.slug || "your-slug"}`}
            fallbackTitle={form.title || "Project title"}
            fallbackDescription={form.shortDescription || "Short description of the project."}
          />
        </div>

        <div className="space-y-5">
          <FieldGroup title="Featured image">
            <ImageUploader
              label="Featured image"
              description="Used on the card, the page header and social shares."
              folder={STORAGE_FOLDERS.portfolio}
              aspect="video"
              value={form.featuredImage}
              onChange={(featuredImage) => patch({ featuredImage })}
              error={errors.featuredImage}
            />
          </FieldGroup>

          <FieldGroup title="Visibility">
            <Switch
              label="Published"
              description="Unpublished projects are hidden from the site entirely."
              checked={form.isActive}
              onChange={(isActive) => patch({ isActive })}
            />
            <Switch
              label="Feature on the homepage"
              description="Featured projects appear in the homepage portfolio section."
              checked={form.isFeatured}
              onChange={(isFeatured) => patch({ isFeatured })}
            />
          </FieldGroup>
        </div>
      </div>

      <SaveBar dirty={dirty || isNew} saving={saving} onSave={handleSave} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this project?"
        message={`"${form.title}" and every image it uploaded will be permanently removed, and /portfolio/${form.slug} will start returning a 404.`}
        busy={saving}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
