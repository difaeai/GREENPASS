"use client";

import { Eye, EyeOff, Layers, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS } from "@/lib/constants";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";
import type { Service } from "@/types";

export default function ServicesListPage() {
  const { items, loading, busyId, error, move, toggleActive, remove } = useCollection<Service>(
    COLLECTIONS.services,
  );

  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (service) =>
        service.title.toLowerCase().includes(needle) ||
        service.slug.toLowerCase().includes(needle) ||
        service.shortDescription.toLowerCase().includes(needle),
    );
  }, [items, query]);

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Everything you offer. Order here controls the order on the public Services page."
        actions={
          <ButtonLink href="/admin/services/new">
            <Plus aria-hidden className="size-4" />
            Add service
          </ButtonLink>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {items.length > 0 && (
        <div className="mb-4">
          <AdminSearch value={query} onChange={setQuery} placeholder="Search services…" />
        </div>
      )}

      {loading ? (
        <AdminLoading label="Loading services…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Layers className="size-5" />}
          title="No services yet"
          description="Add the services you offer. Each one gets its own SEO-friendly detail page."
          actionLabel="Add service"
          actionHref="/admin/services/new"
        />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="No matches" description={`Nothing matches "${query}".`} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((service) => {
            const index = items.findIndex((item) => item.id === service.id);
            return (
              <li key={service.id}>
                <Panel
                  padded={false}
                  className={cn(
                    "flex flex-col gap-4 p-4 sm:flex-row sm:items-center",
                    !service.isActive && "opacity-60",
                  )}
                >
                  <div className="flex shrink-0 items-center gap-3">
                    <ReorderControls
                      onUp={() => move(service.id, -1)}
                      onDown={() => move(service.id, 1)}
                      isFirst={index === 0}
                      isLast={index === items.length - 1}
                      disabled={busyId === service.id || Boolean(query)}
                    />

                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-navy-100 dark:bg-navy-800">
                      {service.image ? (
                        <SmartImage
                          src={service.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-navy-400">
                          <Icon name={service.icon} className="size-5" />
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                        {service.title}
                      </h3>
                      {service.isFeatured && (
                        <Badge tone="brand">
                          <Star aria-hidden className="size-2.5 fill-current" />
                          Featured
                        </Badge>
                      )}
                      <Badge tone={service.isActive ? "success" : "neutral"}>
                        {service.isActive ? "Published" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11.5px] text-navy-400">
                      /services/{service.slug}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12.5px] text-navy-500 dark:text-navy-400">
                      {service.shortDescription}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(service.id)}
                      disabled={busyId === service.id}
                      aria-label={service.isActive ? "Unpublish" : "Publish"}
                      title={service.isActive ? "Unpublish" : "Publish"}
                    >
                      {service.isActive ? (
                        <Eye aria-hidden className="size-4" />
                      ) : (
                        <EyeOff aria-hidden className="size-4" />
                      )}
                    </Button>
                    <Link
                      href={`/admin/services/${service.id}`}
                      aria-label={`Edit ${service.title}`}
                      title="Edit"
                      className="flex size-10 items-center justify-center rounded-full text-navy-700 transition-colors hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800"
                    >
                      <Pencil aria-hidden className="size-4" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(service)}
                      aria-label={`Delete ${service.title}`}
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
        title="Delete this service?"
        message={`"${deleteTarget?.title ?? ""}" will be permanently removed and /services/${deleteTarget?.slug ?? ""} will start returning a 404.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id, async (service) => {
            await deleteStorageObject(service.imagePath);
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
