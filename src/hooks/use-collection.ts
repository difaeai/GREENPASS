"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteDocById,
  listOrdered,
  persistOrder,
  updateDocById,
} from "@/lib/firebase/repository";
import type { BaseDoc, Orderable } from "@/types";

/**
 * Shared list-management behaviour for every orderable admin collection:
 * loading, reordering, visibility toggles and deletion.
 *
 * Reorder and toggle apply optimistically and roll back on failure, so the
 * table stays responsive without risking a lie about persisted state.
 */
export function useCollection<T extends BaseDoc & Orderable>(collectionName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listOrdered<T>(collectionName));
      setError(null);
    } catch (loadError) {
      console.error(`[${collectionName}] Failed to load:`, loadError);
      setError(
        "Could not load this collection. Check your connection and Firestore security rules.",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    // `refresh` awaits Firestore before its first setState, so this is not a
    // synchronous set-in-effect; the rule cannot see through the async boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  /** Swap an item with its neighbour and persist the whole new order. */
  const move = useCallback(
    async (id: string, direction: -1 | 1) => {
      const index = items.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= items.length) return;

      const reordered = [...items];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

      const previous = items;
      setItems(reordered.map((item, i) => ({ ...item, order: i + 1 })));
      setBusyId(id);

      try {
        await persistOrder(
          collectionName,
          reordered.map((item) => item.id),
        );
      } catch (moveError) {
        console.error(`[${collectionName}] Reorder failed:`, moveError);
        setItems(previous);
        toast.error("Could not save the new order.");
      } finally {
        setBusyId(null);
      }
    },
    [items, collectionName],
  );

  const toggleActive = useCallback(
    async (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      const next = !item.isActive;
      const previous = items;

      setItems((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, isActive: next } : entry)),
      );
      setBusyId(id);

      try {
        await updateDocById(collectionName, id, { isActive: next });
        toast.success(next ? "Now visible on the site." : "Hidden from the site.");
      } catch (toggleError) {
        console.error(`[${collectionName}] Visibility toggle failed:`, toggleError);
        setItems(previous);
        toast.error("Could not change visibility.");
      } finally {
        setBusyId(null);
      }
    },
    [items, collectionName],
  );

  /**
   * Delete a record. `cleanup` runs first and is where callers remove any
   * Storage objects the record owned — if it throws, nothing is deleted.
   */
  const remove = useCallback(
    async (id: string, cleanup?: (item: T) => Promise<void>) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;

      setBusyId(id);
      try {
        if (cleanup) await cleanup(item);
        await deleteDocById(collectionName, id);
        setItems((current) => current.filter((entry) => entry.id !== id));
        toast.success("Deleted.");
      } catch (deleteError) {
        console.error(`[${collectionName}] Delete failed:`, deleteError);
        toast.error("Could not delete this item.");
      } finally {
        setBusyId(null);
      }
    },
    [items, collectionName],
  );

  return { items, setItems, loading, busyId, error, refresh, move, toggleActive, remove };
}
