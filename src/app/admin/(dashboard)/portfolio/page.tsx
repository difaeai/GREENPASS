"use client";

import { Eye, EyeOff, FolderKanban, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  AdminSearch,
  ConfirmDialog,
  Panel,
  ReorderControls,
} from "@/components/admin/ui";
import { Button, ButtonLink } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS } from "@/lib/constants";
import { listOrdered } from "@/lib/firebase/repository";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { cn, formatDate } from "@/lib/utils";
import type { PortfolioCategory, PortfolioProject } from "@/types";

export default function PortfolioListPage() {
  const { items, loading, busyId, error, move, toggleActive, remove } =
    useCollection<PortfolioProject>(COLLECTIONS.portfolio);

  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    listOrdered<PortfolioCategory>(COLLECTIONS.portfolioCategories)
      .then(setCategories)
      .catch((loadError) => console.error("[portfolio] Failed to load categories:", loadError));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((project) => {
      if (categoryFilter !== "all" && project.categoryId !== categoryFilter) return false;
      if (!needle) return true;
      return (
        project.title.toLowerCase().includes(needle) ||
        project.clientName.toLowerCase().includes(needle) ||
        project.slug.toLowerCase().includes(needle)
      );
    });
  }, [items, query, categoryFilter]);

  const filtering = Boolean(query) || categoryFilter !== "all";

  return (
    <div>
      <AdminPageHeader
        title="Portfolio"
        description="Case studies shown on the Portfolio page. Order here controls the public order."
        actions={
          <ButtonLink href="/admin/portfolio/new">
            <Plus aria-hidden className="size-4" />
            Add project
          </ButtonLink>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearch value={query} onChange={setQuery} placeholder="Search projects…" />
          <Select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            containerClassName="w-full sm:w-52"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {loading ? (
        <AdminLoading label="Loading projects…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<FolderKanban className="size-5" />}
          title="No projects yet"
          description="Add your first case study. Each project gets its own detail page with a gallery."
          actionLabel="Add project"
          actionHref="/admin/portfolio/new"
        />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="No matches" description="No projects match those filters." />
      ) : (
        <ul className="space-y-3">
          {filtered.map((project) => {
            const index = items.findIndex((item) => item.id === project.id);
            return (
              <li key={project.id}>
                <Panel
                  padded={false}
                  className={cn(
                    "flex flex-col gap-4 p-4 sm:flex-row sm:items-center",
                    !project.isActive && "opacity-60",
                  )}
                >
                  <div className="flex shrink-0 items-center gap-3">
                    <ReorderControls
                      onUp={() => move(project.id, -1)}
                      onDown={() => move(project.id, 1)}
                      isFirst={index === 0}
                      isLast={index === items.length - 1}
                      disabled={busyId === project.id || filtering}
                    />

                    <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-navy-100 dark:bg-navy-800">
                      <SmartImage
                        src={project.featuredImage}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                        {project.title}
                      </h3>
                      {project.isFeatured && (
                        <Badge tone="brand">
                          <Star aria-hidden className="size-2.5 fill-current" />
                          Featured
                        </Badge>
                      )}
                      <Badge tone={project.isActive ? "success" : "neutral"}>
                        {project.isActive ? "Published" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-navy-500 dark:text-navy-400">
                      {project.clientName} · {project.categoryName || "Uncategorised"}
                      {project.completionDate &&
                        ` · ${formatDate(project.completionDate, { month: "short", year: "numeric" })}`}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11.5px] text-navy-400">
                      /portfolio/{project.slug} · {project.images?.length ?? 0} gallery image
                      {project.images?.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(project.id)}
                      disabled={busyId === project.id}
                      aria-label={project.isActive ? "Unpublish" : "Publish"}
                      title={project.isActive ? "Unpublish" : "Publish"}
                    >
                      {project.isActive ? (
                        <Eye aria-hidden className="size-4" />
                      ) : (
                        <EyeOff aria-hidden className="size-4" />
                      )}
                    </Button>
                    <Link
                      href={`/admin/portfolio/${project.id}`}
                      aria-label={`Edit ${project.title}`}
                      title="Edit"
                      className="flex size-10 items-center justify-center rounded-full text-navy-700 transition-colors hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800"
                    >
                      <Pencil aria-hidden className="size-4" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(project)}
                      aria-label={`Delete ${project.title}`}
                      title="Delete"
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this project?"
        message={`"${deleteTarget?.title ?? ""}" and every image it uploaded will be permanently removed. This cannot be undone.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id, async (project) => {
            await Promise.all([
              deleteStorageObject(project.featuredImagePath),
              ...(project.images ?? []).map((image) => deleteStorageObject(image.path)),
            ]);
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
