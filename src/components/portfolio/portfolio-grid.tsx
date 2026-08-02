"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FolderSearch, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ProjectCard } from "@/components/public/cards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { PAGE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PortfolioCategory, PortfolioProject } from "@/types";

/**
 * Client-side category filter, search and pagination.
 *
 * The full project list is delivered by the server component above, so
 * filtering is instant and every project stays in the initial HTML for
 * crawlers. Swap to server-side pagination if the catalogue outgrows a few
 * hundred entries.
 */
export function PortfolioGrid({
  projects,
  categories,
}: {
  projects: PortfolioProject[];
  categories: PortfolioCategory[];
}) {
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Only offer categories that actually contain a published project.
  const usedCategories = useMemo(() => {
    const ids = new Set(projects.map((project) => project.categoryId));
    return categories.filter((category) => ids.has(category.id));
  }, [projects, categories]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return projects.filter((project) => {
      if (activeCategory !== "all" && project.categoryId !== activeCategory) return false;
      if (!needle) return true;

      return (
        project.title.toLowerCase().includes(needle) ||
        project.clientName.toLowerCase().includes(needle) ||
        project.shortDescription.toLowerCase().includes(needle) ||
        project.technologies.some((tech) => tech.toLowerCase().includes(needle))
      );
    });
  }, [projects, activeCategory, query]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  function selectCategory(id: string) {
    setActiveCategory(id);
    setVisible(PAGE_SIZE);
  }

  function updateQuery(value: string) {
    setQuery(value);
    setVisible(PAGE_SIZE);
  }

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      map.set(project.categoryId, (map.get(project.categoryId) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="scrollbar-slim -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          <FilterChip
            active={activeCategory === "all"}
            onClick={() => selectCategory("all")}
            count={projects.length}
          >
            All work
          </FilterChip>

          {usedCategories.map((category) => (
            <FilterChip
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => selectCategory(category.id)}
              count={counts.get(category.id) ?? 0}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <label htmlFor="portfolio-search" className="sr-only">
            Search projects
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-navy-400"
          />
          <input
            id="portfolio-search"
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Search by name, client or tech…"
            className="w-full rounded-full border border-navy-200 bg-white py-2.5 pr-9 pl-10 text-sm text-navy-900 placeholder:text-navy-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-navy-50"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-navy-400 transition-colors hover:text-navy-700 dark:hover:text-navy-200"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Result count, announced to screen readers */}
      <p className="mt-6 text-sm text-navy-500 dark:text-navy-400" role="status" aria-live="polite">
        Showing {shown.length} of {filtered.length}{" "}
        {filtered.length === 1 ? "project" : "projects"}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<FolderSearch className="size-5" />}
          title="No projects match those filters"
          description="Try a different category, or clear the search to see everything."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveCategory("all");
                setQuery("");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {shown.map((project, index) => (
                <motion.li
                  key={project.id}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index % PAGE_SIZE, 6) * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                >
                  <ProjectCard project={project} priority={index < 3} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
              >
                Load more projects
                <span className="ml-1 text-navy-400">
                  ({filtered.length - visible} left)
                </span>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "border-transparent bg-navy-950 text-white shadow-soft dark:bg-white dark:text-navy-950"
          : "border-navy-200 bg-white text-navy-600 hover:border-brand-300 hover:text-brand-700 dark:border-navy-700 dark:bg-navy-950 dark:text-navy-300 dark:hover:border-brand-500/50 dark:hover:text-brand-300",
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
          active
            ? "bg-white/15 text-white dark:bg-navy-950/10 dark:text-navy-950"
            : "bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-400",
        )}
      >
        {count}
      </span>
    </button>
  );
}
