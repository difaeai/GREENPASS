"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query as fsQuery,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Download, Mail, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  AdminSearch,
  ConfirmDialog,
  Panel,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Select, Switch } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { ADMIN_PAGE_SIZE, COLLECTIONS } from "@/lib/constants";
import { getDb } from "@/lib/firebase/client";
import { formatDateTime, toCsv } from "@/lib/utils";
import type { NewsletterSubscriber } from "@/types";

export default function NewsletterPage() {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);

  const load = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        fsQuery(
          collection(getDb(), COLLECTIONS.newsletterSubscribers),
          orderBy("subscribedAt", "desc"),
        ),
      );

      setItems(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            subscribedAt: data.subscribedAt?.toDate?.().toISOString() ?? null,
            createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
          } as NewsletterSubscriber;
        }),
      );
      setError(null);
    } catch (loadError) {
      console.error("[newsletter] Failed to load:", loadError);
      setError("Could not load subscribers. Check your Firestore security rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // `load` awaits before its first setState, so this is not a synchronous
    // set-in-effect; the rule cannot see through the async boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter === "active" && !item.isActive) return false;
      if (statusFilter === "inactive" && item.isActive) return false;
      if (!needle) return true;
      return (
        item.email.toLowerCase().includes(needle) ||
        (item.source ?? "").toLowerCase().includes(needle)
      );
    });
  }, [items, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  // Clamped rather than reset from an effect, so removing the last row on the
  // final page falls back a page instead of rendering an empty table.
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE,
  );

  async function toggleActive(subscriber: NewsletterSubscriber) {
    const next = !subscriber.isActive;
    setBusyId(subscriber.id);
    setItems((current) =>
      current.map((item) => (item.id === subscriber.id ? { ...item, isActive: next } : item)),
    );

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.newsletterSubscribers, subscriber.id), {
        isActive: next,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error("[newsletter] Toggle failed:", updateError);
      toast.error("Could not update this subscriber.");
      void load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);

    try {
      await deleteDoc(doc(getDb(), COLLECTIONS.newsletterSubscribers, deleteTarget.id));
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Subscriber removed.");
    } catch (deleteError) {
      console.error("[newsletter] Delete failed:", deleteError);
      toast.error("Could not remove this subscriber.");
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const csv = toCsv(
      filtered.map((item) => ({
        Email: item.email,
        Status: item.isActive ? "Subscribed" : "Unsubscribed",
        Source: item.source ?? "",
        "Subscribed at": formatDateTime(item.subscribedAt ?? item.createdAt),
      })),
    );

    // The BOM makes Excel open UTF-8 correctly.
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} subscriber(s).`);
  }

  const activeCount = items.filter((item) => item.isActive).length;

  return (
    <div>
      <AdminPageHeader
        title="Newsletter subscribers"
        description={
          items.length > 0
            ? `${activeCount} active of ${items.length} total.`
            : "Email addresses collected from the footer subscription form."
        }
        actions={
          items.length > 0 && (
            <Button variant="outline" onClick={exportCsv}>
              <Download aria-hidden className="size-4" />
              Export CSV
            </Button>
          )
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearch value={search} onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Search email or source…" />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "all" | "active" | "inactive");
              setPage(1);
            }}
            containerClassName="w-full sm:w-48"
            aria-label="Filter by status"
          >
            <option value="all">All subscribers</option>
            <option value="active">Subscribed</option>
            <option value="inactive">Unsubscribed</option>
          </Select>
        </div>
      )}

      {loading ? (
        <AdminLoading label="Loading subscribers…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Mail className="size-5" />}
          title="No subscribers yet"
          description="Addresses submitted through the footer form will be listed here."
        />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="No matches" description="No subscribers match those filters." />
      ) : (
        <>
          <Panel padded={false} className="overflow-x-auto">
            <table className="w-full min-w-140 text-left">
              <thead className="border-b border-navy-200 dark:border-navy-800">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase"
                  >
                    Source
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase"
                  >
                    Subscribed
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {paged.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="text-[13.5px] font-medium text-navy-950 hover:text-brand-600 hover:underline dark:text-white"
                        >
                          {subscriber.email}
                        </a>
                        <Badge tone={subscriber.isActive ? "success" : "neutral"}>
                          {subscriber.isActive ? "Subscribed" : "Unsubscribed"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-navy-500 dark:text-navy-400">
                      {subscriber.source || "—"}
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-navy-500 dark:text-navy-400">
                      {formatDateTime(subscriber.subscribedAt ?? subscriber.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Switch
                          label="Subscribed"
                          checked={subscriber.isActive}
                          disabled={busyId === subscriber.id}
                          onChange={() => toggleActive(subscriber)}
                          className="[&>div]:hidden"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(subscriber)}
                          aria-label={`Remove ${subscriber.email}`}
                          title="Remove"
                          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {pageCount > 1 && (
            <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-4">
              <p className="text-[13px] text-navy-500 dark:text-navy-400">
                Page {currentPage} of {pageCount} · {filtered.length} subscriber
                {filtered.length === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this subscriber?"
        message={`${deleteTarget?.email ?? "This address"} will be permanently deleted. To stop emails without losing the record, switch them to unsubscribed instead.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
