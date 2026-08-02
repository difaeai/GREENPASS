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
import {
  Building2,
  Download,
  Inbox,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Modal } from "@/components/admin/modal";
import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  AdminSearch,
  ConfirmDialog,
  Panel,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { ADMIN_PAGE_SIZE, COLLECTIONS } from "@/lib/constants";
import { getDb } from "@/lib/firebase/client";
import { cn, formatDateTime, toCsv } from "@/lib/utils";
import { CONTACT_STATUSES, type ContactQuery, type ContactStatus } from "@/types";

const STATUS_TONES: Record<ContactStatus, "brand" | "info" | "warning" | "success"> = {
  new: "brand",
  read: "info",
  in_progress: "warning",
  completed: "success",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  in_progress: "In progress",
  completed: "Completed",
};

function QueriesInner() {
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");

  const [items, setItems] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactStatus>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactQuery | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactQuery | null>(null);

  const load = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        fsQuery(collection(getDb(), COLLECTIONS.contactQueries), orderBy("createdAt", "desc")),
      );

      setItems(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
            updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
            submittedAt: data.submittedAt?.toDate?.().toISOString() ?? null,
          } as ContactQuery;
        }),
      );
      setError(null);
    } catch (loadError) {
      console.error("[queries] Failed to load:", loadError);
      setError("Could not load contact queries. Check your Firestore security rules.");
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

  /** Deep link from the dashboard — open that message directly. */
  useEffect(() => {
    if (!focusId || items.length === 0) return;
    const match = items.find((item) => item.id === focusId);
    if (match) openDetail(match);
    // Responds to a URL parameter arriving from the dashboard, which is an
    // external input rather than derived state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, items]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        item.fullName.toLowerCase().includes(needle) ||
        item.email.toLowerCase().includes(needle) ||
        item.subject.toLowerCase().includes(needle) ||
        (item.companyName ?? "").toLowerCase().includes(needle) ||
        item.message.toLowerCase().includes(needle)
      );
    });
  }, [items, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / ADMIN_PAGE_SIZE));
  // Clamped rather than reset from an effect, so deleting the last message on
  // the final page falls back a page instead of rendering an empty list.
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice(
    (currentPage - 1) * ADMIN_PAGE_SIZE,
    currentPage * ADMIN_PAGE_SIZE,
  );

  async function setStatus(item: ContactQuery, status: ContactStatus) {
    setItems((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)),
    );
    setSelected((current) => (current?.id === item.id ? { ...current, status } : current));

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.contactQueries, item.id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error("[queries] Status update failed:", updateError);
      toast.error("Could not update the status.");
      void load();
    }
  }

  function openDetail(item: ContactQuery) {
    setSelected(item);
    setNotesDraft(item.notes ?? "");
    // Opening an unread message marks it read, which is what the badge counts.
    if (item.status === "new") void setStatus(item, "read");
  }

  async function saveNotes() {
    if (!selected) return;
    setBusy(true);

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.contactQueries, selected.id), {
        notes: notesDraft.trim() || null,
        updatedAt: serverTimestamp(),
      });
      setItems((current) =>
        current.map((entry) =>
          entry.id === selected.id ? { ...entry, notes: notesDraft.trim() || null } : entry,
        ),
      );
      toast.success("Notes saved.");
    } catch (saveError) {
      console.error("[queries] Failed to save notes:", saveError);
      toast.error("Could not save the notes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);

    try {
      await deleteDoc(doc(getDb(), COLLECTIONS.contactQueries, deleteTarget.id));
      setItems((current) => current.filter((entry) => entry.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success("Message deleted.");
    } catch (deleteError) {
      console.error("[queries] Delete failed:", deleteError);
      toast.error("Could not delete this message.");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const csv = toCsv(
      filtered.map((item) => ({
        Name: item.fullName,
        Company: item.companyName ?? "",
        Email: item.email,
        Phone: item.phone ?? "",
        Subject: item.subject,
        Message: item.message,
        Status: STATUS_LABELS[item.status] ?? item.status,
        Received: formatDateTime(item.submittedAt ?? item.createdAt),
        Notes: item.notes ?? "",
      })),
    );

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contact-queries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} message(s).`);
  }

  const unreadCount = items.filter((item) => item.status === "new").length;

  return (
    <div>
      <AdminPageHeader
        title="Contact queries"
        description={
          unreadCount > 0
            ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"} waiting.`
            : "Every submission from the website contact form."
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
          <AdminSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search name, email, subject…"
          />
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "all" | ContactStatus);
              setPage(1);
            }}
            containerClassName="w-full sm:w-48"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
      )}

      {loading ? (
        <AdminLoading label="Loading messages…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Inbox className="size-5" />}
          title="No messages yet"
          description="Submissions from the website contact form will appear here."
        />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="No matches" description="No messages match those filters." />
      ) : (
        <>
          <Panel padded={false} className="overflow-hidden">
            <ul className="divide-y divide-navy-100 dark:divide-navy-800">
              {paged.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(item)}
                    className="flex w-full items-start gap-3.5 p-4 text-left transition-colors hover:bg-navy-50 dark:hover:bg-navy-800/50"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        item.status === "new" ? "bg-brand-500" : "bg-navy-300 dark:bg-navy-600",
                      )}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "truncate text-[14px] text-navy-950 dark:text-white",
                            item.status === "new" ? "font-bold" : "font-semibold",
                          )}
                        >
                          {item.fullName}
                        </span>
                        {item.companyName && (
                          <span className="truncate text-[12px] text-navy-400">
                            {item.companyName}
                          </span>
                        )}
                        <Badge tone={STATUS_TONES[item.status] ?? "neutral"}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </span>

                      <span className="mt-0.5 block truncate text-[13px] text-navy-700 dark:text-navy-200">
                        {item.subject}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-navy-500 dark:text-navy-400">
                        {item.message}
                      </span>
                    </span>

                    <span className="hidden shrink-0 text-[11.5px] text-navy-400 sm:block">
                      {formatDateTime(item.submittedAt ?? item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {pageCount > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-4 flex items-center justify-between gap-4"
            >
              <p className="text-[13px] text-navy-500 dark:text-navy-400">
                Page {currentPage} of {pageCount} · {filtered.length} message
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

      {/* Detail */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.subject ?? "Message"}
        description={
          selected ? `Received ${formatDateTime(selected.submittedAt ?? selected.createdAt)}` : undefined
        }
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => selected && setDeleteTarget(selected)}
              className="mr-auto text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 aria-hidden className="size-4" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button onClick={saveNotes} loading={busy}>
              Save notes
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-3 rounded-xl border border-navy-200 bg-navy-50/60 p-4 sm:grid-cols-2 dark:border-navy-700 dark:bg-navy-950/50">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
                  From
                </p>
                <p className="mt-1 text-[14px] font-semibold text-navy-950 dark:text-white">
                  {selected.fullName}
                </p>
                {selected.companyName && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-navy-500 dark:text-navy-400">
                    <Building2 aria-hidden className="size-3.5" />
                    {selected.companyName}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
                  Contact
                </p>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-1 flex items-center gap-1.5 text-[13px] text-brand-600 hover:underline dark:text-brand-400"
                >
                  <Mail aria-hidden className="size-3.5" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="mt-0.5 flex items-center gap-1.5 text-[13px] text-brand-600 hover:underline dark:text-brand-400"
                  >
                    <Phone aria-hidden className="size-3.5" />
                    {selected.phone}
                  </a>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-navy-400 uppercase">
                Message
              </p>
              <p className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-navy-800 dark:text-navy-100">
                {selected.message}
              </p>
            </div>

            <Select
              label="Status"
              value={selected.status}
              onChange={(event) => setStatus(selected, event.target.value as ContactStatus)}
            >
              {CONTACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>

            <Textarea
              label="Internal notes"
              rows={4}
              description="Only visible in this admin panel."
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
            />

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open(
                  `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`,
                )
              }
            >
              <Mail aria-hidden className="size-4" />
              Reply by email
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this message?"
        message={`The message from ${deleteTarget?.fullName ?? "this sender"} will be permanently removed. This cannot be undone.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function QueriesPage() {
  return (
    <Suspense fallback={<AdminLoading label="Loading messages…" />}>
      <QueriesInner />
    </Suspense>
  );
}
