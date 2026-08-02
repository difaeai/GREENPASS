"use client";

import { Eye, EyeOff, Images, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { Modal } from "@/components/admin/modal";
import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  ConfirmDialog,
  Panel,
  ReorderControls,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Switch, Textarea } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS, STORAGE_FOLDERS } from "@/lib/constants";
import { createDoc, nextOrder, updateDocById } from "@/lib/firebase/repository";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";
import type { HomeBanner } from "@/types";

interface FormState {
  smallHeading: string;
  mainHeading: string;
  description: string;
  image: ImageValue;
  buttonLabel: string;
  buttonLink: string;
  secondaryButtonLabel: string;
  secondaryButtonLink: string;
  overlayOpacity: number;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  smallHeading: "",
  mainHeading: "",
  description: "",
  image: { url: "", path: null },
  buttonLabel: "",
  buttonLink: "",
  secondaryButtonLabel: "",
  secondaryButtonLink: "",
  overlayOpacity: 0.68,
  isActive: true,
};

export default function BannersPage() {
  const { items, loading, busyId, error, refresh, move, toggleActive, remove } =
    useCollection<HomeBanner>(COLLECTIONS.homeBanners);

  const [editing, setEditing] = useState<HomeBanner | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<HomeBanner | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(banner: HomeBanner) {
    setEditing(banner);
    setForm({
      smallHeading: banner.smallHeading ?? "",
      mainHeading: banner.mainHeading ?? "",
      description: banner.description ?? "",
      image: { url: banner.backgroundImage ?? "", path: banner.backgroundImagePath ?? null },
      buttonLabel: banner.buttonLabel ?? "",
      buttonLink: banner.buttonLink ?? "",
      secondaryButtonLabel: banner.secondaryButtonLabel ?? "",
      secondaryButtonLink: banner.secondaryButtonLink ?? "",
      overlayOpacity: banner.overlayOpacity ?? 0.68,
      isActive: banner.isActive,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (form.mainHeading.trim().length < 3) next.mainHeading = "Add a main heading.";
    if (!form.image.url) next.image = "A background image is required.";
    if (form.buttonLabel.trim() && !form.buttonLink.trim()) {
      next.buttonLink = "A button label needs a link.";
    }
    if (form.secondaryButtonLabel.trim() && !form.secondaryButtonLink.trim()) {
      next.secondaryButtonLink = "A button label needs a link.";
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    const payload = {
      smallHeading: form.smallHeading.trim(),
      mainHeading: form.mainHeading.trim(),
      description: form.description.trim(),
      backgroundImage: form.image.url,
      backgroundImagePath: form.image.path,
      buttonLabel: form.buttonLabel.trim() || null,
      buttonLink: form.buttonLink.trim() || null,
      secondaryButtonLabel: form.secondaryButtonLabel.trim() || null,
      secondaryButtonLink: form.secondaryButtonLink.trim() || null,
      overlayOpacity: form.overlayOpacity,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        // Replacing the image orphans the old file — clean it up.
        if (editing.backgroundImagePath && editing.backgroundImagePath !== form.image.path) {
          await deleteStorageObject(editing.backgroundImagePath);
        }
        await updateDocById(COLLECTIONS.homeBanners, editing.id, payload);
        toast.success("Slide updated.");
      } else {
        await createDoc(COLLECTIONS.homeBanners, { ...payload, order: nextOrder(items) });
        toast.success("Slide added.");
      }

      setModalOpen(false);
      await refresh();
    } catch (saveError) {
      console.error("[banners] Save failed:", saveError);
      toast.error("Could not save this slide.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Hero banner slides"
        description="Slides shown in the homepage hero carousel. Drag order, visibility and buttons are all controlled here."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden className="size-4" />
            Add slide
          </Button>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {loading ? (
        <AdminLoading label="Loading slides…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Images className="size-5" />}
          title="No slides yet"
          description="Add your first hero slide — it becomes the first thing visitors see."
          actionLabel="Add slide"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((banner, index) => (
            <li key={banner.id}>
              <Panel
                padded={false}
                className={cn(
                  "flex flex-col gap-4 p-4 sm:flex-row sm:items-center",
                  !banner.isActive && "opacity-60",
                )}
              >
                <div className="flex shrink-0 items-center gap-3">
                  <ReorderControls
                    onUp={() => move(banner.id, -1)}
                    onDown={() => move(banner.id, 1)}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    disabled={busyId === banner.id}
                  />

                  <span className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-navy-100 dark:bg-navy-800">
                    <SmartImage
                      src={banner.backgroundImage}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {banner.smallHeading && <Badge tone="brand">{banner.smallHeading}</Badge>}
                    <Badge tone={banner.isActive ? "success" : "neutral"}>
                      {banner.isActive ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <h3 className="mt-1.5 truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                    {banner.mainHeading}
                  </h3>
                  {banner.description && (
                    <p className="mt-0.5 line-clamp-1 text-[12.5px] text-navy-500 dark:text-navy-400">
                      {banner.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(banner.id)}
                    disabled={busyId === banner.id}
                    aria-label={banner.isActive ? "Hide this slide" : "Show this slide"}
                    title={banner.isActive ? "Hide" : "Show"}
                  >
                    {banner.isActive ? (
                      <Eye aria-hidden className="size-4" />
                    ) : (
                      <EyeOff aria-hidden className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(banner)}
                    aria-label={`Edit ${banner.mainHeading}`}
                    title="Edit"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(banner)}
                    aria-label={`Delete ${banner.mainHeading}`}
                    title="Delete"
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      {/* Editor */}
      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? "Edit slide" : "New slide"}
        description="Keep headings short — they render very large on desktop."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Save changes" : "Add slide"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <ImageUploader
            label="Background image"
            description="Landscape works best. Aim for 1920×1080 or larger."
            folder={STORAGE_FOLDERS.banners}
            aspect="wide"
            value={form.image}
            onChange={(image) => setForm((state) => ({ ...state, image }))}
            error={formErrors.image}
          />

          <Input
            label="Small heading"
            placeholder="Product engineering partner"
            value={form.smallHeading}
            onChange={(event) =>
              setForm((state) => ({ ...state, smallHeading: event.target.value }))
            }
          />

          <Input
            label="Main heading"
            required
            placeholder="We build software that earns its place in your business"
            value={form.mainHeading}
            error={formErrors.mainHeading}
            onChange={(event) =>
              setForm((state) => ({ ...state, mainHeading: event.target.value }))
            }
          />

          <Textarea
            label="Description"
            rows={3}
            placeholder="One or two sentences of supporting copy."
            value={form.description}
            onChange={(event) =>
              setForm((state) => ({ ...state, description: event.target.value }))
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Primary button label"
              placeholder="Start a project"
              value={form.buttonLabel}
              onChange={(event) =>
                setForm((state) => ({ ...state, buttonLabel: event.target.value }))
              }
            />
            <Input
              label="Primary button link"
              placeholder="/contact"
              value={form.buttonLink}
              error={formErrors.buttonLink}
              onChange={(event) =>
                setForm((state) => ({ ...state, buttonLink: event.target.value }))
              }
            />
            <Input
              label="Secondary button label"
              placeholder="See our work"
              value={form.secondaryButtonLabel}
              onChange={(event) =>
                setForm((state) => ({ ...state, secondaryButtonLabel: event.target.value }))
              }
            />
            <Input
              label="Secondary button link"
              placeholder="/portfolio"
              value={form.secondaryButtonLink}
              error={formErrors.secondaryButtonLink}
              onChange={(event) =>
                setForm((state) => ({ ...state, secondaryButtonLink: event.target.value }))
              }
            />
          </div>

          <div>
            <label
              htmlFor="overlay-opacity"
              className="text-[13px] font-medium text-navy-800 dark:text-navy-200"
            >
              Overlay darkness — {Math.round(form.overlayOpacity * 100)}%
            </label>
            <p className="mt-0.5 text-xs text-navy-500 dark:text-navy-400">
              Darker overlays keep the heading readable over busy photography.
            </p>
            <input
              id="overlay-opacity"
              type="range"
              min={0.2}
              max={0.9}
              step={0.02}
              value={form.overlayOpacity}
              onChange={(event) =>
                setForm((state) => ({ ...state, overlayOpacity: Number(event.target.value) }))
              }
              className="mt-2.5 w-full accent-brand-600"
            />
          </div>

          <Switch
            label="Visible on the site"
            description="Hidden slides stay saved but are skipped by the carousel."
            checked={form.isActive}
            onChange={(isActive) => setForm((state) => ({ ...state, isActive }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this slide?"
        message={`"${deleteTarget?.mainHeading ?? ""}" and its uploaded background image will be permanently removed. This cannot be undone.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id, async (banner) => {
            await deleteStorageObject(banner.backgroundImagePath);
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
