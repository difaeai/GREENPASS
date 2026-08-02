"use client";

import { Eye, EyeOff, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS } from "@/lib/constants";
import { createDoc, listOrdered, nextOrder, updateDocById } from "@/lib/firebase/repository";
import { cn, slugify } from "@/lib/utils";
import type { PortfolioCategory, PortfolioProject } from "@/types";

export default function CategoriesPage() {
  const { items, loading, busyId, error, refresh, move, toggleActive, remove } =
    useCollection<PortfolioCategory>(COLLECTIONS.portfolioCategories);

  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<PortfolioCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });
  const [slugLocked, setSlugLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<PortfolioCategory | null>(null);

  // Used to warn before deleting a category that projects still reference.
  useEffect(() => {
    listOrdered<PortfolioProject>(COLLECTIONS.portfolio)
      .then(setProjects)
      .catch((loadError) => console.error("[categories] Failed to load projects:", loadError));
  }, [items]);

  const usageCount = (categoryId: string) =>
    projects.filter((project) => project.categoryId === categoryId).length;

  function openCreate() {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", isActive: true });
    setSlugLocked(false);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(category: PortfolioCategory) {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      isActive: category.isActive,
    });
    setSlugLocked(true);
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "A category name is required.";
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      next.slug = "Use lowercase letters, numbers and hyphens only.";
    }
    if (items.some((item) => item.slug === form.slug && item.id !== editing?.id)) {
      next.slug = "That slug is already in use.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug,
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateDocById(COLLECTIONS.portfolioCategories, editing.id, payload);

        // `categoryName` is denormalised onto every project — keep it in sync.
        if (payload.name !== editing.name) {
          const affected = projects.filter((project) => project.categoryId === editing.id);
          await Promise.all(
            affected.map((project) =>
              updateDocById(COLLECTIONS.portfolio, project.id, {
                categoryName: payload.name,
              }),
            ),
          );
          if (affected.length > 0) {
            toast.success(`Renamed, and updated ${affected.length} project(s).`);
          } else {
            toast.success("Category updated.");
          }
        } else {
          toast.success("Category updated.");
        }
      } else {
        await createDoc(COLLECTIONS.portfolioCategories, {
          ...payload,
          order: nextOrder(items),
        });
        toast.success("Category added.");
      }

      setModalOpen(false);
      await refresh();
    } catch (saveError) {
      console.error("[categories] Save failed:", saveError);
      toast.error("Could not save this category.");
    } finally {
      setSaving(false);
    }
  }

  const targetUsage = deleteTarget ? usageCount(deleteTarget.id) : 0;

  return (
    <div>
      <AdminPageHeader
        title="Portfolio categories"
        description="Categories power the filter tabs on the public Portfolio page."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden className="size-4" />
            Add category
          </Button>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {loading ? (
        <AdminLoading label="Loading categories…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Tags className="size-5" />}
          title="No categories yet"
          description="Create at least one category before adding portfolio projects."
          actionLabel="Add category"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((category, index) => (
            <li key={category.id}>
              <Panel
                padded={false}
                className={cn(
                  "flex items-center gap-4 p-4",
                  !category.isActive && "opacity-60",
                )}
              >
                <ReorderControls
                  onUp={() => move(category.id, -1)}
                  onDown={() => move(category.id, 1)}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  disabled={busyId === category.id}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                      {category.name}
                    </h3>
                    <Badge tone="neutral">
                      {usageCount(category.id)} project
                      {usageCount(category.id) === 1 ? "" : "s"}
                    </Badge>
                    <Badge tone={category.isActive ? "success" : "neutral"}>
                      {category.isActive ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11.5px] text-navy-400">
                    {category.slug}
                  </p>
                  {category.description && (
                    <p className="mt-1 line-clamp-1 text-[12.5px] text-navy-500 dark:text-navy-400">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(category.id)}
                    disabled={busyId === category.id}
                    aria-label={category.isActive ? "Hide" : "Show"}
                    title={category.isActive ? "Hide" : "Show"}
                  >
                    {category.isActive ? (
                      <Eye aria-hidden className="size-4" />
                    ) : (
                      <EyeOff aria-hidden className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(category)}
                    aria-label={`Edit ${category.name}`}
                    title="Edit"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(category)}
                    aria-label={`Delete ${category.name}`}
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
        title={editing ? "Edit category" : "New category"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Save changes" : "Add category"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Category name"
            required
            placeholder="Web Platforms"
            value={form.name}
            error={errors.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((state) => ({
                ...state,
                name,
                slug: slugLocked ? state.slug : slugify(name),
              }));
            }}
          />

          <Input
            label="Slug"
            required
            description="Used internally and in filter links."
            value={form.slug}
            error={errors.slug}
            onChange={(event) => {
              setSlugLocked(true);
              setForm((state) => ({ ...state, slug: slugify(event.target.value) }));
            }}
          />

          <Textarea
            label="Description"
            rows={3}
            description="Optional. Not currently shown on the public site."
            value={form.description}
            onChange={(event) =>
              setForm((state) => ({ ...state, description: event.target.value }))
            }
          />

          <Switch
            label="Visible on the site"
            description="Hidden categories are dropped from the portfolio filter tabs."
            checked={form.isActive}
            onChange={(isActive) => setForm((state) => ({ ...state, isActive }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this category?"
        message={
          targetUsage > 0
            ? `"${deleteTarget?.name}" is still used by ${targetUsage} project${targetUsage === 1 ? "" : "s"}. Those projects will keep their stored category name but will no longer match any filter tab. Reassign them first if you can.`
            : `"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`
        }
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
