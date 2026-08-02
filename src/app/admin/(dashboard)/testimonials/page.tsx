"use client";

import { Eye, EyeOff, MessageSquareQuote, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { Badge, Rating } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS, STORAGE_FOLDERS } from "@/lib/constants";
import { createDoc, nextOrder, updateDocById } from "@/lib/firebase/repository";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { cn, initials } from "@/lib/utils";
import type { Testimonial } from "@/types";

interface FormState {
  name: string;
  company: string;
  designation: string;
  feedback: string;
  photo: ImageValue;
  rating: number;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: "",
  company: "",
  designation: "",
  feedback: "",
  photo: { url: "", path: null },
  rating: 5,
  isActive: true,
};

export default function TestimonialsPage() {
  const { items, loading, busyId, error, refresh, move, toggleActive, remove } =
    useCollection<Testimonial>(COLLECTIONS.testimonials);

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(testimonial: Testimonial) {
    setEditing(testimonial);
    setForm({
      name: testimonial.name,
      company: testimonial.company,
      designation: testimonial.designation ?? "",
      feedback: testimonial.feedback,
      photo: { url: testimonial.photo ?? "", path: testimonial.photoPath ?? null },
      rating: testimonial.rating ?? 5,
      isActive: testimonial.isActive,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "A client name is required.";
    if (!form.company.trim()) next.company = "A company is required.";
    if (form.feedback.trim().length < 10) next.feedback = "Add the client's feedback.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      company: form.company.trim(),
      designation: form.designation.trim() || null,
      feedback: form.feedback.trim(),
      photo: form.photo.url,
      photoPath: form.photo.path,
      rating: form.rating,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        if (editing.photoPath && editing.photoPath !== form.photo.path) {
          await deleteStorageObject(editing.photoPath);
        }
        await updateDocById(COLLECTIONS.testimonials, editing.id, payload);
        toast.success("Testimonial updated.");
      } else {
        await createDoc(COLLECTIONS.testimonials, { ...payload, order: nextOrder(items) });
        toast.success("Testimonial added.");
      }

      setModalOpen(false);
      await refresh();
    } catch (saveError) {
      console.error("[testimonials] Save failed:", saveError);
      toast.error("Could not save this testimonial.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Client feedback shown in the homepage testimonial carousel."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden className="size-4" />
            Add testimonial
          </Button>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {loading ? (
        <AdminLoading label="Loading testimonials…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<MessageSquareQuote className="size-5" />}
          title="No testimonials yet"
          description="Add client feedback to build credibility on the homepage."
          actionLabel="Add testimonial"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((testimonial, index) => (
            <li key={testimonial.id}>
              <Panel
                padded={false}
                className={cn(
                  "flex flex-col gap-4 p-4 sm:flex-row sm:items-start",
                  !testimonial.isActive && "opacity-60",
                )}
              >
                <div className="flex shrink-0 items-center gap-3">
                  <ReorderControls
                    onUp={() => move(testimonial.id, -1)}
                    onDown={() => move(testimonial.id, 1)}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    disabled={busyId === testimonial.id}
                  />

                  <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                    {testimonial.photo ? (
                      <SmartImage
                        src={testimonial.photo}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs font-semibold text-navy-500">
                        {initials(testimonial.name)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                      {testimonial.name}
                    </h3>
                    <Rating value={testimonial.rating} className="scale-90" />
                    <Badge tone={testimonial.isActive ? "success" : "neutral"}>
                      {testimonial.isActive ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-navy-500 dark:text-navy-400">
                    {testimonial.designation
                      ? `${testimonial.designation}, ${testimonial.company}`
                      : testimonial.company}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-navy-600 dark:text-navy-300">
                    &ldquo;{testimonial.feedback}&rdquo;
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(testimonial.id)}
                    disabled={busyId === testimonial.id}
                    aria-label={testimonial.isActive ? "Hide" : "Show"}
                    title={testimonial.isActive ? "Hide" : "Show"}
                  >
                    {testimonial.isActive ? (
                      <Eye aria-hidden className="size-4" />
                    ) : (
                      <EyeOff aria-hidden className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(testimonial)}
                    aria-label={`Edit the testimonial from ${testimonial.name}`}
                    title="Edit"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(testimonial)}
                    aria-label={`Delete the testimonial from ${testimonial.name}`}
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

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? "Edit testimonial" : "New testimonial"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Save changes" : "Add testimonial"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <ImageUploader
            label="Client photo"
            description="Optional. Initials are shown when there's no photo."
            folder={STORAGE_FOLDERS.testimonials}
            aspect="square"
            value={form.photo}
            onChange={(photo) => setForm((state) => ({ ...state, photo }))}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Client name"
              required
              placeholder="Helen Marsh"
              value={form.name}
              error={errors.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
            />
            <Input
              label="Company"
              required
              placeholder="Atlas Freight Group"
              value={form.company}
              error={errors.company}
              onChange={(event) =>
                setForm((state) => ({ ...state, company: event.target.value }))
              }
            />
          </div>

          <Input
            label="Job title"
            placeholder="Chief Operating Officer"
            value={form.designation}
            onChange={(event) =>
              setForm((state) => ({ ...state, designation: event.target.value }))
            }
          />

          <Textarea
            label="Feedback"
            required
            rows={5}
            description="The quote itself. Specific and concrete beats generic praise."
            value={form.feedback}
            error={errors.feedback}
            onChange={(event) =>
              setForm((state) => ({ ...state, feedback: event.target.value }))
            }
          />

          <fieldset>
            <legend className="text-[13px] font-medium text-navy-800 dark:text-navy-200">
              Rating
            </legend>
            <div className="mt-2 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((state) => ({ ...state, rating: value }))}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={form.rating === value}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    aria-hidden
                    className={cn(
                      "size-6",
                      value <= form.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-navy-300 dark:text-navy-600",
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-[13px] text-navy-500 dark:text-navy-400">
                {form.rating} of 5
              </span>
            </div>
          </fieldset>

          <Switch
            label="Visible on the site"
            checked={form.isActive}
            onChange={(isActive) => setForm((state) => ({ ...state, isActive }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this testimonial?"
        message={`The testimonial from ${deleteTarget?.name ?? "this client"} will be permanently removed.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id, async (testimonial) => {
            await deleteStorageObject(testimonial.photoPath);
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
