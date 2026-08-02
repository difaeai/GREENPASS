"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Editor for the repeating item arrays stored inside the singleton documents
 * (why-choose-us cards, statistics, core values, history milestones, business
 * hours). Handles add, remove, reorder and collapse; the caller supplies the
 * fields for one item.
 */
export function RepeatableList<T extends { id: string; order: number }>({
  items,
  onChange,
  createItem,
  renderItem,
  itemLabel,
  addLabel,
  summary,
  max,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderItem: (item: T, update: (partial: Partial<T>) => void, index: number) => ReactNode;
  itemLabel: string;
  addLabel: string;
  summary: (item: T, index: number) => string;
  max?: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  /** Rewrite `order` from array position so it always matches what's shown. */
  function commit(next: T[]) {
    onChange(next.map((item, index) => ({ ...item, order: index + 1 })));
  }

  function update(id: string, partial: Partial<T>) {
    commit(items.map((item) => (item.id === id ? { ...item, ...partial } : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  function add() {
    const item = createItem();
    commit([...items, item]);
    setOpenId(item.id);
  }

  const atLimit = typeof max === "number" && items.length >= max;

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-navy-200 py-8 text-center text-[13px] text-navy-500 dark:border-navy-700 dark:text-navy-400">
          No {itemLabel.toLowerCase()} yet.
        </p>
      )}

      <ul className="space-y-2.5">
        {items.map((item, index) => {
          const open = openId === item.id;

          return (
            <li
              key={item.id}
              className="overflow-hidden rounded-xl border border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-950"
            >
              <div className="flex items-center gap-2 p-2.5">
                <div className="flex shrink-0 flex-col overflow-hidden rounded-md border border-navy-200 dark:border-navy-700">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${itemLabel} up`}
                    className="flex size-5.5 items-center justify-center text-navy-500 transition-colors hover:bg-navy-50 hover:text-brand-600 disabled:opacity-30 dark:hover:bg-navy-800"
                  >
                    <ChevronUp aria-hidden className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label={`Move ${itemLabel} down`}
                    className="flex size-5.5 items-center justify-center border-t border-navy-200 text-navy-500 transition-colors hover:bg-navy-50 hover:text-brand-600 disabled:opacity-30 dark:border-navy-700 dark:hover:bg-navy-800"
                  >
                    <ChevronDown aria-hidden className="size-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate text-[13.5px] font-medium text-navy-900 dark:text-navy-50">
                    {summary(item, index) || `${itemLabel} ${index + 1}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-label={open ? "Collapse" : "Expand"}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-navy-400 transition-colors hover:bg-navy-50 dark:hover:bg-navy-800"
                >
                  <ChevronDown
                    aria-hidden
                    className={cn("size-4 transition-transform", open && "rotate-180")}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => commit(items.filter((entry) => entry.id !== item.id))}
                  aria-label={`Remove this ${itemLabel.toLowerCase()}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 aria-hidden className="size-3.5" />
                </button>
              </div>

              {open && (
                <div className="space-y-4 border-t border-navy-200 bg-navy-50/50 p-4 dark:border-navy-700 dark:bg-navy-900/40">
                  {renderItem(item, (partial) => update(item.id, partial), index)}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Button variant="outline" size="sm" onClick={add} disabled={atLimit}>
        <Plus aria-hidden className="size-4" />
        {addLabel}
      </Button>
      {atLimit && (
        <p className="text-xs text-navy-400">Maximum of {max} reached.</p>
      )}
    </div>
  );
}
