"use client";

import { Check, Copy, ImageIcon, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { useAdminAuth } from "@/components/admin/auth-provider";
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
import { Input, Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { COLLECTIONS } from "@/lib/constants";
import { updateDocById } from "@/lib/firebase/repository";
import {
  deleteMediaItem,
  listMedia,
  uploadImage,
  UploadError,
} from "@/lib/firebase/storage";
import { cn, formatBytes, formatDateTime } from "@/lib/utils";
import { MEDIA_FOLDERS, type MediaFolder, type MediaItem } from "@/types";

export default function MediaLibraryPage() {
  const { admin } = useAdminAuth();
  const inputId = useId();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState<"all" | MediaFolder>("all");
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>("general");
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await listMedia());
      setError(null);
    } catch (loadError) {
      console.error("[media] Failed to load:", loadError);
      setError("Could not load the media library. Check your Firestore security rules.");
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
      if (folderFilter !== "all" && item.folder !== folderFilter) return false;
      if (!needle) return true;
      return (
        item.name.toLowerCase().includes(needle) ||
        item.folder.toLowerCase().includes(needle) ||
        (item.alt ?? "").toLowerCase().includes(needle)
      );
    });
  }, [items, search, folderFilter]);

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.folder, (map.get(item.folder) ?? 0) + 1);
    return map;
  }, [items]);

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + (item.size ?? 0), 0),
    [items],
  );

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    await Promise.all(
      list.map(async (file) => {
        const key = `${file.name}-${file.size}-${Math.random()}`;
        setUploading((state) => ({ ...state, [key]: 0 }));

        try {
          await uploadImage(file, uploadFolder, {
            uploadedBy: admin?.uid ?? admin?.id ?? null,
            onProgress: (percent) => setUploading((state) => ({ ...state, [key]: percent })),
          });
        } catch (uploadError) {
          const message =
            uploadError instanceof UploadError
              ? uploadError.message
              : `Could not upload "${file.name}".`;
          toast.error(message);
        } finally {
          setUploading((state) => {
            const next = { ...state };
            delete next[key];
            return next;
          });
        }
      }),
    );

    await load();
    toast.success("Upload complete.");
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("Could not copy — your browser blocked clipboard access.");
    }
  }

  async function saveAlt() {
    if (!selected) return;
    setSavingAlt(true);

    try {
      await updateDocById(COLLECTIONS.mediaLibrary, selected.id, {
        alt: altDraft.trim() || null,
      });
      setItems((current) =>
        current.map((item) =>
          item.id === selected.id ? { ...item, alt: altDraft.trim() || null } : item,
        ),
      );
      toast.success("Alt text saved.");
      setSelected(null);
    } catch (saveError) {
      console.error("[media] Failed to save alt text:", saveError);
      toast.error("Could not save the alt text.");
    } finally {
      setSavingAlt(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);

    try {
      await deleteMediaItem(deleteTarget);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      toast.success("File deleted.");
    } catch (deleteError) {
      console.error("[media] Delete failed:", deleteError);
      toast.error("Could not delete this file.");
    } finally {
      setBusy(false);
    }
  }

  const uploadingKeys = Object.keys(uploading);

  return (
    <div>
      <AdminPageHeader
        title="Media library"
        description={
          items.length > 0
            ? `${items.length} file${items.length === 1 ? "" : "s"} · ${formatBytes(totalSize)} stored.`
            : "Central store for every image used across the site."
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {/* Upload */}
      <Panel className="mb-5">
        <div
          onDragOver={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setDragging(false);
            if (event.dataTransfer.files.length > 0) void handleFiles(event.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors",
            dragging
              ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
              : "border-navy-200 bg-navy-50/50 dark:border-navy-700 dark:bg-navy-950/50",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-navy-400 shadow-xs dark:bg-navy-800">
            <Upload aria-hidden className="size-5" />
          </span>

          <div>
            <p className="text-[14px] font-medium text-navy-800 dark:text-navy-100">
              Drop images here to upload
            </p>
            <p className="mt-0.5 text-[12px] text-navy-500 dark:text-navy-400">
              JPEG, PNG, WebP, AVIF, GIF or SVG · up to 8 MB each
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Select
              value={uploadFolder}
              onChange={(event) => setUploadFolder(event.target.value as MediaFolder)}
              aria-label="Destination folder"
              containerClassName="w-40"
            >
              {MEDIA_FOLDERS.map((folder) => (
                <option key={folder} value={folder}>
                  /{folder}
                </option>
              ))}
            </Select>

            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-full bg-linear-to-r from-brand-700 to-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-92"
            >
              Choose files
            </label>
          </div>

          {uploadingKeys.length > 0 && (
            <ul className="mt-2 w-full max-w-sm space-y-2">
              {uploadingKeys.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-200 dark:bg-navy-800">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-[width] duration-200"
                      style={{ width: `${uploading[key]}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-navy-500 tabular-nums">{uploading[key]}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </Panel>

      {/* Filters */}
      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearch value={search} onChange={setSearch} placeholder="Search files…" />
          <Select
            value={folderFilter}
            onChange={(event) => setFolderFilter(event.target.value as "all" | MediaFolder)}
            containerClassName="w-full sm:w-48"
            aria-label="Filter by folder"
          >
            <option value="all">All folders ({items.length})</option>
            {MEDIA_FOLDERS.map((folder) => (
              <option key={folder} value={folder}>
                /{folder} ({folderCounts.get(folder) ?? 0})
              </option>
            ))}
          </Select>
        </div>
      )}

      {loading ? (
        <AdminLoading label="Loading media…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<ImageIcon className="size-5" />}
          title="Nothing uploaded yet"
          description="Upload images here, or from any image field elsewhere in the panel — everything lands in this library."
        />
      ) : filtered.length === 0 ? (
        <AdminEmpty title="No matches" description="No files match those filters." />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <li key={item.id}>
              <div className="group overflow-hidden rounded-2xl border border-navy-200 bg-white transition-all hover:border-brand-300 hover:shadow-soft dark:border-navy-800 dark:bg-navy-900">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setAltDraft(item.alt ?? "");
                  }}
                  className="relative block aspect-square w-full bg-navy-50 dark:bg-navy-950"
                  aria-label={`Open details for ${item.name}`}
                >
                  <SmartImage
                    src={item.url}
                    alt={item.alt || item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 220px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2">
                    <Badge tone="neutral" className="bg-white/90 backdrop-blur-sm">
                      /{item.folder}
                    </Badge>
                  </span>
                </button>

                <div className="p-3">
                  <p className="truncate text-[12.5px] font-medium text-navy-900 dark:text-navy-50">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-navy-400">
                    {formatBytes(item.size)}
                    {item.width && item.height && ` · ${item.width}×${item.height}`}
                  </p>

                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => copyUrl(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-navy-200 py-1.5 text-[11.5px] font-medium text-navy-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-navy-700 dark:text-navy-300"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check aria-hidden className="size-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy aria-hidden className="size-3" />
                          Copy URL
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={`Delete ${item.name}`}
                      className="flex size-7.5 items-center justify-center rounded-lg border border-navy-200 text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 dark:border-navy-700 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 aria-hidden className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Detail */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "File"}
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
            <Button onClick={saveAlt} loading={savingAlt}>
              Save alt text
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-950">
              <SmartImage
                src={selected.url}
                alt={selected.alt || selected.name}
                fill
                sizes="600px"
                className="object-contain"
              />
            </div>

            <Input
              label="Alt text"
              description="Describes the image for screen readers and search engines."
              placeholder="Two engineers reviewing code on a monitor"
              value={altDraft}
              onChange={(event) => setAltDraft(event.target.value)}
            />

            <dl className="grid gap-3 rounded-xl border border-navy-200 bg-navy-50/60 p-4 text-[12.5px] sm:grid-cols-2 dark:border-navy-700 dark:bg-navy-950/50">
              <div>
                <dt className="text-navy-400">Folder</dt>
                <dd className="mt-0.5 font-medium text-navy-900 dark:text-navy-50">
                  /{selected.folder}
                </dd>
              </div>
              <div>
                <dt className="text-navy-400">Size</dt>
                <dd className="mt-0.5 font-medium text-navy-900 dark:text-navy-50">
                  {formatBytes(selected.size)}
                </dd>
              </div>
              <div>
                <dt className="text-navy-400">Dimensions</dt>
                <dd className="mt-0.5 font-medium text-navy-900 dark:text-navy-50">
                  {selected.width && selected.height
                    ? `${selected.width} × ${selected.height}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-navy-400">Uploaded</dt>
                <dd className="mt-0.5 font-medium text-navy-900 dark:text-navy-50">
                  {formatDateTime(selected.createdAt)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-navy-400">Storage path</dt>
                <dd className="mt-0.5 font-mono text-[11.5px] break-all text-navy-700 dark:text-navy-200">
                  {selected.path}
                </dd>
              </div>
            </dl>

            <Button variant="outline" className="w-full" onClick={() => copyUrl(selected)}>
              {copiedId === selected.id ? (
                <>
                  <Check aria-hidden className="size-4" />
                  URL copied
                </>
              ) : (
                <>
                  <Copy aria-hidden className="size-4" />
                  Copy public URL
                </>
              )}
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this file?"
        message={`"${deleteTarget?.name ?? ""}" will be removed from Storage permanently. Anything already using this image will show a broken image, so check first.`}
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
